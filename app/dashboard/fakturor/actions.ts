"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type CreateInvoiceItemInput = {
  serviceId: string | null;
  description: string;
  quantity: number;
  unitCode: string;
  unitPriceExVat: number;
  discountPercent: number;
  vatRate: number;
};

export type CreateInvoiceInput = {
  customerId: string;
  projectId: string | null;

  title: string;
  description: string;

  invoiceDate: string;
  dueDate: string;
  paymentTermsDays: number;

  referenceNumber: string;
  poNumber: string;
  deliveryEmail: string;
  notes: string;

  recurringEnabled: boolean;
  recurringStartDate: string;
  recurringInvoiceDay: number;
  recurringAutoSend: boolean;

  items: CreateInvoiceItemInput[];
};

export type CreateInvoiceResult = {
  ok: boolean;
  invoiceId?: string;
  invoiceNumber?: string;
  error?: string;
};

export async function createInvoiceAction(
  input: CreateInvoiceInput
): Promise<CreateInvoiceResult> {
  try {
    if (!input.customerId) {
      return {
        ok: false,
        error: "Välj en kund.",
      };
    }

    if (!input.title.trim()) {
      return {
        ok: false,
        error: "Ange fakturans titel.",
      };
    }

    if (input.items.length === 0) {
      return {
        ok: false,
        error:
          "Fakturan måste innehålla minst en rad.",
      };
    }

    const invalidItem =
      input.items.find(
        (item) =>
          !item.description.trim() ||
          item.quantity <= 0 ||
          item.unitPriceExVat < 0 ||
          item.discountPercent < 0 ||
          item.discountPercent > 100 ||
          item.vatRate < 0 ||
          item.vatRate > 100
      );

    if (invalidItem) {
      return {
        ok: false,
        error:
          "Kontrollera fakturaradernas beskrivning, antal, pris, rabatt och moms.",
      };
    }

    const supabase =
      await createClient();

    const {
      data: userData,
      error: userError,
    } = await supabase.auth.getUser();

    if (
      userError ||
      !userData.user
    ) {
      return {
        ok: false,
        error:
          "Din inloggning kunde inte verifieras.",
      };
    }

    const {
      data,
      error,
    } = await (
      supabase as any
    ).rpc(
      "create_invoice_with_items",
      {
        p_payload: {
          ...input,

          title:
            input.title.trim(),

          description:
            input.description.trim(),

          referenceNumber:
            input.referenceNumber.trim(),

          poNumber:
            input.poNumber.trim(),

          deliveryEmail:
            input.deliveryEmail.trim(),

          notes:
            input.notes.trim(),

          items:
            input.items.map(
              (item) => ({
                ...item,

                description:
                  item.description.trim(),
              })
            ),
        },
      }
    );

    if (error) {
      console.error(
        "Fakturan kunde inte skapas:",
        error
      );

      return {
        ok: false,
        error:
          error.message ||
          "Fakturan kunde inte skapas.",
      };
    }

    revalidatePath(
      "/dashboard/fakturor"
    );

    return {
      ok: true,

      invoiceId:
        String(
          data?.invoice_id ?? ""
        ),

      invoiceNumber:
        String(
          data?.invoice_number ?? ""
        ),
    };
  }
  catch (error) {
    console.error(
      "Oväntat fakturafel:",
      error
    );

    return {
      ok: false,

      error:
        error instanceof Error
          ? error.message
          : "Ett oväntat fel uppstod.",
    };
  }
}
