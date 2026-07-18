"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  Resend,
} from "resend";

import CustomerPortalInvitationEmail from "@/emails/CustomerPortalInvitationEmail";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  createClient,
} from "@/lib/supabase/server";

export type InviteCustomerPortalResult = {
  success: boolean;
  message: string;
};

type UnknownRow =
  Record<string, unknown>;

function textValue(
  value: unknown
) {
  return String(
    value ?? ""
  ).trim();
}

function validEmail(
  value: string
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value
  );
}

function cleanSenderName(
  value: string
) {
  return value
    .replace(/[<>"]/g, "")
    .trim();
}

function expirationText(
  minutes: number
) {
  const expiresAt =
    new Date(
      Date.now() +
      minutes * 60 * 1000
    );

  return new Intl.DateTimeFormat(
    "sv-SE",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone:
        "Europe/Stockholm",
    }
  ).format(expiresAt);
}

export async function inviteCustomerToPortalAction(
  customerId: string,
  requestedEmail: string,
  requestedName: string
): Promise<InviteCustomerPortalResult> {
  try {
    const cleanedCustomerId =
      textValue(customerId);

    const email =
      textValue(
        requestedEmail
      ).toLowerCase();

    const requestedFullName =
      textValue(
        requestedName
      );

    if (!cleanedCustomerId) {
      return {
        success: false,
        message:
          "Kundens id saknas.",
      };
    }

    if (
      !email ||
      !validEmail(email)
    ) {
      return {
        success: false,
        message:
          "Kunden saknar en giltig e-postadress.",
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
        success: false,
        message:
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
      .select(`
        role,
        is_active,
        full_name,
        email
      `)
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
        textValue(
          profile.role
        )
      )
    ) {
      return {
        success: false,
        message:
          "Du har inte behörighet att bjuda in kunder.",
      };
    }

    const {
      data: customerData,
      error: customerError,
    } = await (
      supabase as any
    )
      .from("customers")
      .select(`
        id,
        name,
        email,
        status
      `)
      .eq(
        "id",
        cleanedCustomerId
      )
      .maybeSingle();

    if (
      customerError ||
      !customerData
    ) {
      return {
        success: false,
        message:
          "Kunden kunde inte hittas.",
      };
    }

    const {
      data: contactsData,
      error: contactsError,
    } = await (
      supabase as any
    )
      .from(
        "customer_contacts"
      )
      .select(`
        id,
        full_name,
        email,
        is_primary,
        is_active
      `)
      .eq(
        "customer_id",
        cleanedCustomerId
      );

    if (contactsError) {
      console.error(
        "Kundkontakter kunde inte hämtas:",
        contactsError
      );

      return {
        success: false,
        message:
          "Kundens kontaktpersoner kunde inte kontrolleras.",
      };
    }

    const contacts =
      Array.isArray(
        contactsData
      )
        ? contactsData as
            UnknownRow[]
        : [];

    const customerEmail =
      textValue(
        customerData.email
      ).toLowerCase();

    const matchedContact =
      contacts.find(
        (contact) =>
          textValue(
            contact.email
          ).toLowerCase() ===
            email &&
          contact.is_active !==
            false
      );

    if (
      email !==
        customerEmail &&
      !matchedContact
    ) {
      return {
        success: false,
        message:
          "Spara kundens e-postadress innan inbjudan skickas.",
      };
    }

    const customerName =
      textValue(
        customerData.name
      ) ||
      "Kund";

    const fullName =
      textValue(
        matchedContact
          ?.full_name
      ) ||
      requestedFullName ||
      customerName;

    const firstName =
      fullName
        .split(/\s+/)
        .filter(Boolean)[0] ||
      "Kund";

    const invitedByName =
      textValue(
        profile.full_name
      ) ||
      textValue(
        profile.email
      ) ||
      "Xellens Agency";

    const activationUrl =
      process.env
        .CUSTOMER_PORTAL_ACTIVATION_URL
        ?.trim() ||
      "https://kund.xellensagency.com/aktivera";

    const admin =
      createAdminClient();

    let linkResult =
      await admin.auth.admin
        .generateLink({
          type: "invite",

          email,

          options: {
            redirectTo:
              activationUrl,

            data: {
              full_name:
                fullName,

              customer_id:
                cleanedCustomerId,
            },
          },
        });

    if (linkResult.error) {
      const errorMessage =
        linkResult.error.message
          .toLowerCase();

      const alreadyExists =
        errorMessage.includes(
          "already"
        ) ||
        errorMessage.includes(
          "registered"
        ) ||
        errorMessage.includes(
          "exists"
        );

      if (!alreadyExists) {
        console.error(
          "Aktiveringslänken kunde inte skapas:",
          linkResult.error
        );

        return {
          success: false,
          message:
            linkResult.error.message ||
            "Aktiveringslänken kunde inte skapas.",
        };
      }

      linkResult =
        await admin.auth.admin
          .generateLink({
            type: "recovery",

            email,

            options: {
              redirectTo:
                activationUrl,
            },
          });
    }

    if (
      linkResult.error ||
      !linkResult.data
    ) {
      console.error(
        "Ny aktiveringslänk kunde inte skapas:",
        linkResult.error
      );

      return {
        success: false,
        message:
          linkResult.error
            ?.message ||
          "Aktiveringslänken kunde inte skapas.",
      };
    }

    const generatedData =
      linkResult.data as any;

    const authUserId =
      textValue(
        generatedData.user?.id
      );

    const actionLink =
      textValue(
        generatedData
          .properties
          ?.action_link
      );

    if (
      !authUserId ||
      !actionLink
    ) {
      return {
        success: false,
        message:
          "Supabase returnerade ingen giltig aktiveringslänk.",
      };
    }

    const {
      data: existingMembership,
      error:
        membershipLookupError,
    } = await admin
      .from(
        "customer_portal_memberships"
      )
      .select("id")
      .eq(
        "customer_id",
        cleanedCustomerId
      )
      .eq(
        "auth_user_id",
        authUserId
      )
      .limit(1)
      .maybeSingle();

    if (
      membershipLookupError
    ) {
      console.error(
        "Kundmedlemskapet kunde inte kontrolleras:",
        membershipLookupError
      );

      return {
        success: false,
        message:
          membershipLookupError.message ||
          "Kundportalens medlemskap kunde inte kontrolleras.",
      };
    }

    if (existingMembership) {
      const {
        error:
          membershipUpdateError,
      } = await admin
        .from(
          "customer_portal_memberships"
        )
        .update({
          role:
            "owner",

          status:
            "active",
        })
        .eq(
          "id",
          existingMembership.id
        );

      if (
        membershipUpdateError
      ) {
        console.error(
          "Kundmedlemskapet kunde inte aktiveras:",
          membershipUpdateError
        );

        return {
          success: false,
          message:
            membershipUpdateError.message ||
            "Kundportalens medlemskap kunde inte aktiveras.",
        };
      }
    }
    else {
      const {
        error:
          membershipInsertError,
      } = await admin
        .from(
          "customer_portal_memberships"
        )
        .insert({
          customer_id:
            cleanedCustomerId,

          auth_user_id:
            authUserId,

          role:
            "owner",

          status:
            "active",
        });

      if (
        membershipInsertError
      ) {
        console.error(
          "Kundmedlemskapet kunde inte skapas:",
          membershipInsertError
        );

        return {
          success: false,
          message:
            membershipInsertError.message ||
            "Kundportalens medlemskap kunde inte skapas.",
        };
      }
    }

    const resendApiKey =
      process.env
        .RESEND_API_KEY
        ?.trim();

    if (!resendApiKey) {
      return {
        success: false,
        message:
          "RESEND_API_KEY saknas i Vercel.",
      };
    }

    const {
      data: companySettings,
    } = await (
      supabase as any
    )
      .from(
        "company_settings"
      )
      .select(`
        company_name,
        email,
        email_sender_name
      `)
      .limit(1)
      .maybeSingle();

    const senderName =
      cleanSenderName(
        textValue(
          companySettings
            ?.email_sender_name
        ) ||
        textValue(
          companySettings
            ?.company_name
        ) ||
        "Xellens Agency"
      );

    const senderEmail =
      process.env
        .CUSTOMER_PORTAL_FROM_EMAIL
        ?.trim() ||
      process.env
        .RESEND_FROM_EMAIL
        ?.trim() ||
      "info@xellensagency.com";

    const from =
      senderEmail.includes(
        "<"
      )
        ? senderEmail
        : `${senderName} <${senderEmail}>`;

    const configuredExpiry =
      Number(
        process.env
          .SUPABASE_INVITE_EXPIRY_MINUTES ||
        "60"
      );

    const expiryMinutes =
      Number.isFinite(
        configuredExpiry
      ) &&
      configuredExpiry > 0
        ? configuredExpiry
        : 60;

    const resend =
      new Resend(
        resendApiKey
      );

    const {
      error: sendError,
    } =
      await resend.emails.send({
        from,

        to: [
          email,
        ],

        subject:
          `Aktivera kundportalen för ${customerName}`,

        react:
          CustomerPortalInvitationEmail({
            firstName,
            companyName:
              customerName,

            invitedByName,

            activationUrl:
              actionLink,

            expiresAt:
              expirationText(
                expiryMinutes
              ),

            recipientEmail:
              email,
          }),

        text: [
          `Hej ${firstName}!`,
          "",
          `${invitedByName} från Xellens Agency har bjudit in dig till kundportalen för ${customerName}.`,
          "",
          "Aktivera ditt konto genom länken:",
          actionLink,
          "",
          `Länken gäller till ${expirationText(expiryMinutes)}.`,
          "",
          "Med vänliga hälsningar",
          "Xellens Agency",
        ].join("\n"),

        ...(companySettings
          ?.email
          ? {
              replyTo:
                textValue(
                  companySettings
                    .email
                ),
            }
          : {}),
      });

    if (sendError) {
      console.error(
        "Aktiveringsmejlet kunde inte skickas:",
        sendError
      );

      return {
        success: false,
        message:
          sendError.message ||
          "Aktiveringsmejlet kunde inte skickas.",
      };
    }

    revalidatePath(
      `/dashboard/kunder/${cleanedCustomerId}`
    );

    return {
      success: true,
      message:
        `Aktiveringsmejlet har skickats till ${email}.`,
    };
  }
  catch (error) {
    console.error(
      "Oväntat fel vid kundinbjudan:",
      error
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Ett oväntat fel uppstod.",
    };
  }
}

