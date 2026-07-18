"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  Resend,
} from "resend";

import InvoiceEmail from "@/emails/InvoiceEmail";

import {
  getInvoiceDetailData,
} from "@/lib/dashboard/invoices/get-invoice-detail-data";

import {
  createClient,
} from "@/lib/supabase/server";

export type SendInvoiceResult = {
  ok: boolean;
  message?: string;
  error?: string;
};

function validEmail(
  value: string
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value
  );
}

function safeSenderName(
  value: string
) {
  return value
    .replace(/[<>"]/g, "")
    .trim();
}

function dateText(
  value: string | null
) {
  if (!value) {
    return "Ej angivet";
  }

  return new Intl.DateTimeFormat(
    "sv-SE",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  ).format(
    new Date(
      value.length === 10
        ? `${value}T12:00:00`
        : value
    )
  );
}

function money(
  value: number,
  currency: string
) {
  return new Intl.NumberFormat(
    "sv-SE",
    {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(value);
}

export async function sendInvoiceAction(
  invoiceId: string
): Promise<SendInvoiceResult> {
  try {
    const cleanedInvoiceId =
      String(invoiceId || "").trim();

    if (!cleanedInvoiceId) {
      return {
        ok: false,
        error:
          "Fakturans id saknas.",
      };
    }

    const supabase =
      await createClient();

    const {
      data: {
        user,
      },
      error: userError,
    } =
      await supabase.auth.getUser();

    if (
      userError ||
      !user
    ) {
      return {
        ok: false,
        error:
          "Din inloggning kunde inte verifieras.",
      };
    }

    const {
      data: profile,
      error: profileError,
    } = await (
      supabase as any
    )
      .from("profiles")
      .select(
        "role, is_active"
      )
      .eq(
        "id",
        user.id
      )
      .maybeSingle();

    const allowedRoles = [
      "super_admin",
      "admin",
    ];

    if (
      profileError ||
      !profile ||
      profile.is_active !== true ||
      !allowedRoles.includes(
        String(profile.role)
      )
    ) {
      return {
        ok: false,
        error:
          "Du har inte behörighet att skicka fakturor.",
      };
    }

    const data =
      await getInvoiceDetailData(
        cleanedInvoiceId
      );

    if (!data) {
      return {
        ok: false,
        error:
          "Fakturan kunde inte hittas.",
      };
    }

    if (
      data.invoice.status ===
        "cancelled" ||
      data.invoice.status ===
        "credited"
    ) {
      return {
        ok: false,
        error:
          "En makulerad eller krediterad faktura kan inte skickas.",
      };
    }

    const recipient =
      (
        data.invoice
          .deliveryEmail ||
        data.customer
          .billingEmail ||
        data.customer.email ||
        ""
      ).trim();

    if (
      !recipient ||
      !validEmail(recipient)
    ) {
      return {
        ok: false,
        error:
          "Fakturan saknar en giltig fakturamejl.",
      };
    }

    const apiKey =
      process.env
        .RESEND_API_KEY
        ?.trim();

    if (!apiKey) {
      return {
        ok: false,
        error:
          "RESEND_API_KEY saknas i miljövariablerna.",
      };
    }

    const configuredSender =
      process.env
        .RESEND_FROM_EMAIL
        ?.trim() ||
      "faktura@xellensagency.com";

    const senderName =
      safeSenderName(
        data.company
          .emailSenderName ||
        data.company.name ||
        "Xellens Agency"
      );

    const from =
      configuredSender.includes(
        "<"
      )
        ? configuredSender
        : `${senderName} <${configuredSender}>`;

    const reference =
      data.invoice.ocrNumber ||
      data.invoice.invoiceNumber;

    const textRows =
      data.items
        .map(
          (item) =>
            `- ${item.description}: ${money(
              item.totalIncVat,
              data.invoice.currency
            )}`
        )
        .join("\n");

    const plainText = [
      `Hej ${data.customer.contactPerson || data.customer.name}!`,
      "",
      `Här kommer faktura ${data.invoice.invoiceNumber} från ${data.company.name}.`,
      "",
      `Fakturadatum: ${dateText(data.invoice.invoiceDate)}`,
      `Förfallodatum: ${dateText(data.invoice.dueDate)}`,
      `Att betala: ${money(data.invoice.outstandingAmount, data.invoice.currency)}`,
      `OCR / referens: ${reference}`,
      "",
      "Fakturarader:",
      textRows,
      "",
      data.company.bankgiro
        ? `Bankgiro: ${data.company.bankgiro}`
        : "",
      data.company.swishNumber
        ? `Swish: ${data.company.swishNumber}`
        : "",
      data.company.iban
        ? `IBAN: ${data.company.iban}`
        : "",
      "",
      data.company.invoiceFooterText || "",
      "",
      `Med vänliga hälsningar`,
      data.company.name,
    ]
      .filter(
        (line) =>
          line !== null &&
          line !== undefined
      )
      .join("\n");

    const resend =
      new Resend(apiKey);

    const {
      data: sentEmail,
      error: sendError,
    } =
      await resend.emails.send({
        from,

        to: [
          recipient,
        ],

        subject:
          `Faktura ${data.invoice.invoiceNumber} från ${data.company.name}`,

        react:
          InvoiceEmail({
            data,
            recipientEmail:
              recipient,
          }),

        text:
          plainText,

        ...(data.company.email
          ? {
              replyTo:
                data.company.email,
            }
          : {}),
      });

    if (sendError) {
      console.error(
        "Resend kunde inte skicka fakturan:",
        sendError
      );

      return {
        ok: false,
        error:
          sendError.message ||
          "Fakturamejlet kunde inte skickas.",
      };
    }

    const {
      error: markError,
    } = await (
      supabase as any
    ).rpc(
      "mark_invoice_sent",
      {
        p_invoice_id:
          cleanedInvoiceId,

        p_recipient:
          recipient,

        p_resend_email_id:
          sentEmail?.id ||
          null,
      }
    );

    revalidatePath(
      "/dashboard/fakturor"
    );

    revalidatePath(
      `/dashboard/fakturor/${cleanedInvoiceId}`
    );

    if (markError) {
      console.error(
        "Fakturan skickades men statusen kunde inte uppdateras:",
        markError
      );

      return {
        ok: true,
        message:
          "Fakturan skickades, men statusen kunde inte uppdateras. Kontrollera Supabase-funktionen mark_invoice_sent.",
      };
    }

    return {
      ok: true,
      message:
        `Fakturan skickades till ${recipient}.`,
    };
  }
  catch (error) {
    console.error(
      "Oväntat fel vid fakturautskick:",
      error
    );

    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Ett oväntat fel uppstod när fakturan skulle skickas.",
    };
  }
}
