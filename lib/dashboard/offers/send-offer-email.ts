import {
  Resend,
} from "resend";


type SendOfferEmailInput = {
  recipientEmail: string;

  copyToEmail?: string | null;

  customerName: string;

  offerNumber: string;

  title: string;

  totalIncVat: number;

  currency: string;

  validUntil: string | null;

  shareUrl: string;
};


function escapeHtml(
  value: string
) {
  return value
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
}


function formatCurrency(
  value: number,
  currency: string
) {
  return new Intl.NumberFormat(
    "sv-SE",
    {
      style: "currency",
      currency:
        currency || "SEK",
      maximumFractionDigits: 0,
    }
  ).format(value);
}


function formatDate(
  value: string | null
) {
  if (!value) {
    return "Se offerten";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "sv-SE",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  ).format(date);
}


export async function sendOfferEmail({
  recipientEmail,
  copyToEmail,
  customerName,
  offerNumber,
  title,
  totalIncVat,
  currency,
  validUntil,
  shareUrl,
}: SendOfferEmailInput) {

  const apiKey =
    process.env
      .RESEND_API_KEY
      ?.trim();

  const from =
    process.env
      .VORIX_EMAIL_FROM
      ?.trim() ||
    process.env
      .RESEND_FROM_EMAIL
      ?.trim();

  const replyTo =
    process.env
      .VORIX_EMAIL_REPLY_TO
      ?.trim();


  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY saknas i serverns miljövariabler."
    );
  }


  if (!from) {
    throw new Error(
      "VORIX_EMAIL_FROM eller RESEND_FROM_EMAIL saknas i serverns miljövariabler."
    );
  }


  const resend =
    new Resend(
      apiKey
    );


  const safeCustomer =
    escapeHtml(
      customerName ||
        "kund"
    );

  const safeNumber =
    escapeHtml(
      offerNumber
    );

  const safeTitle =
    escapeHtml(
      title
    );

  const safeShareUrl =
    escapeHtml(
      shareUrl
    );


  const html = `
<!doctype html>
<html lang="sv">
  <body
    style="
      margin:0;
      padding:0;
      background:#F3F6F5;
      font-family:Arial,Helvetica,sans-serif;
      color:#0B2F33;
    "
  >
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      style="
        padding:32px 16px;
        background:#F3F6F5;
      "
    >
      <tr>
        <td align="center">

          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            role="presentation"
            style="
              max-width:620px;
              overflow:hidden;
              border:1px solid #E1E9E6;
              border-radius:14px;
              background:#FFFFFF;
            "
          >

            <tr>
              <td
                style="
                  padding:26px 30px;
                  background:#0B2F33;
                "
              >
                <div
                  style="
                    color:#FFFFFF;
                    font-size:25px;
                    font-weight:700;
                    letter-spacing:-1px;
                  "
                >
                  VORIX
                </div>

                <div
                  style="
                    margin-top:5px;
                    color:#D6C4A0;
                    font-size:11px;
                  "
                >
                  Digital products. Built to last.
                </div>
              </td>
            </tr>


            <tr>
              <td
                style="
                  padding:34px 30px 12px;
                "
              >
                <div
                  style="
                    color:#22B573;
                    font-size:11px;
                    font-weight:700;
                    letter-spacing:.6px;
                  "
                >
                  NY OFFERT · ${safeNumber}
                </div>

                <h1
                  style="
                    margin:10px 0 0;
                    color:#0B2F33;
                    font-size:27px;
                    line-height:1.2;
                  "
                >
                  Hej ${safeCustomer},
                </h1>

                <p
                  style="
                    margin:14px 0 0;
                    color:#58706D;
                    font-size:14px;
                    line-height:1.7;
                  "
                >
                  Vi har tagit fram ett offertförslag för
                  <strong>${safeTitle}</strong>.
                  Du kan öppna hela offerten digitalt via knappen nedan.
                </p>
              </td>
            </tr>


            <tr>
              <td
                style="
                  padding:12px 30px;
                "
              >
                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  role="presentation"
                  style="
                    border:1px solid #E5E7EB;
                    border-radius:10px;
                    background:#F8FAF9;
                  "
                >
                  <tr>
                    <td
                      style="
                        padding:16px;
                      "
                    >
                      <div
                        style="
                          color:#81918F;
                          font-size:10px;
                          font-weight:700;
                        "
                      >
                        OFFERTVÄRDE
                      </div>

                      <div
                        style="
                          margin-top:5px;
                          color:#0B2F33;
                          font-size:21px;
                          font-weight:700;
                        "
                      >
                        ${escapeHtml(
                          formatCurrency(
                            totalIncVat,
                            currency
                          )
                        )}
                      </div>

                      <div
                        style="
                          margin-top:3px;
                          color:#81918F;
                          font-size:10px;
                        "
                      >
                        inklusive moms
                      </div>
                    </td>

                    <td
                      style="
                        padding:16px;
                        border-left:1px solid #E5E7EB;
                      "
                    >
                      <div
                        style="
                          color:#81918F;
                          font-size:10px;
                          font-weight:700;
                        "
                      >
                        GILTIG TILL
                      </div>

                      <div
                        style="
                          margin-top:5px;
                          color:#0B2F33;
                          font-size:14px;
                          font-weight:700;
                        "
                      >
                        ${escapeHtml(
                          formatDate(
                            validUntil
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>


            <tr>
              <td
                align="center"
                style="
                  padding:20px 30px 34px;
                "
              >
                <a
                  href="${safeShareUrl}"
                  style="
                    display:inline-block;
                    padding:14px 24px;
                    border-radius:8px;
                    background:#D6C4A0;
                    color:#0B2F33;
                    font-size:13px;
                    font-weight:700;
                    text-decoration:none;
                  "
                >
                  Öppna offerten
                </a>

                <p
                  style="
                    margin:20px 0 0;
                    color:#8A9997;
                    font-size:10px;
                    line-height:1.5;
                  "
                >
                  Länken är personlig för denna offert.
                  Vidarebefordra den därför endast till personer
                  som ska ha tillgång till offerten.
                </p>
              </td>
            </tr>


            <tr>
              <td
                style="
                  padding:18px 30px;
                  border-top:1px solid #E5E7EB;
                  color:#8A9997;
                  font-size:10px;
                "
              >
                Vorix · Digital products. Built to last.
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </body>
</html>
`;


  const bcc =
    copyToEmail &&
    copyToEmail
      .trim()
      .toLowerCase() !==
      recipientEmail
        .trim()
        .toLowerCase()
      ? [copyToEmail]
      : undefined;


  const {
    data,
    error,
  } =
    await resend.emails.send({
      from,

      to: [
        recipientEmail,
      ],

      bcc,

      replyTo:
        replyTo ||
        undefined,

      subject:
        `Offert ${offerNumber} från Vorix`,

      html,
    });


  if (error) {
    throw new Error(
      error.message ||
        "Offertmejlet kunde inte skickas."
    );
  }


  return {
    emailId:
      data?.id ||
      null,
  };
}