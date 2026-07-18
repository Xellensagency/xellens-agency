import type {
  CSSProperties,
} from "react";

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";

import type {
  InvoiceDetailData,
} from "@/lib/dashboard/invoices/invoice-detail-types";

export type InvoiceEmailProps = {
  data: InvoiceDetailData;
  recipientEmail: string;
};

function money(
  value: number,
  currency = "SEK"
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

function dateText(
  value: string | null
) {
  if (!value) {
    return "Ej angivet";
  }

  const date =
    new Date(
      value.length === 10
        ? `${value}T12:00:00`
        : value
    );

  return new Intl.DateTimeFormat(
    "sv-SE",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  ).format(date);
}

const main: CSSProperties = {
  margin: "0",
  padding: "28px 12px",
  backgroundColor: "#edf2f5",
  fontFamily:
    "Arial, Helvetica, sans-serif",
};

const container: CSSProperties = {
  maxWidth: "680px",
  margin: "0 auto",
  overflow: "hidden",
  border: "1px solid #dbe4e8",
  borderRadius: "12px",
  backgroundColor: "#ffffff",
};

const header: CSSProperties = {
  padding: "28px 34px",
  color: "#ffffff",
  backgroundColor: "#07366F",
};

const section: CSSProperties = {
  padding: "28px 34px",
};

const muted: CSSProperties = {
  margin: "5px 0 0",
  color: "#687b86",
  fontSize: "12px",
  lineHeight: "19px",
};

const label: CSSProperties = {
  margin: "0 0 5px",
  color: "#70828c",
  fontSize: "10px",
  fontWeight: "700",
  letterSpacing: "0.7px",
  textTransform: "uppercase",
};

const value: CSSProperties = {
  margin: "0",
  color: "#18303a",
  fontSize: "13px",
  fontWeight: "700",
  lineHeight: "20px",
};

const infoCard: CSSProperties = {
  padding: "17px",
  border: "1px solid #dce6ea",
  borderRadius: "8px",
  backgroundColor: "#f7fafb",
};

const totalCard: CSSProperties = {
  marginTop: "22px",
  padding: "21px",
  borderRadius: "9px",
  color: "#ffffff",
  backgroundColor: "#07366F",
};

const footer: CSSProperties = {
  padding: "22px 34px 28px",
  color: "#73858e",
  backgroundColor: "#f6f9fa",
  fontSize: "10px",
  lineHeight: "17px",
};

export default function InvoiceEmail({
  data,
  recipientEmail,
}: InvoiceEmailProps) {
  const company =
    data.company;

  const customerName =
    data.customer.contactPerson ||
    data.customer.name;

  const paymentReference =
    data.invoice.ocrNumber ||
    data.invoice.invoiceNumber;

  const accentColor =
    /^#[0-9A-Fa-f]{6}$/.test(
      company.primaryColor
    )
      ? company.primaryColor
      : "#07366F";

  return (
    <Html lang="sv">
      <Head />

      <Preview>
        Faktura {data.invoice.invoiceNumber} från{" "}
        {company.name}
      </Preview>

      <Body style={main}>
        <Container style={container}>
          <Section
            style={{
              ...header,
              backgroundColor:
                accentColor,
            }}
          >
            {company.logoDarkUrl ||
            company.logoUrl ? (
              <Img
                src={
                  company.logoDarkUrl ||
                  company.logoUrl ||
                  ""
                }
                alt={company.name}
                width="210"
                style={{
                  display: "block",
                  maxHeight: "65px",
                  objectFit: "contain",
                  objectPosition: "left center",
                }}
              />
            ) : (
              <Heading
                style={{
                  margin: "0",
                  color: "#ffffff",
                  fontSize: "23px",
                }}
              >
                {company.name}
              </Heading>
            )}

            <Text
              style={{
                margin: "22px 0 0",
                color:
                  "rgba(255,255,255,0.72)",
                fontSize: "10px",
                fontWeight: "700",
                letterSpacing: "1.5px",
              }}
            >
              FAKTURA
            </Text>

            <Heading
              style={{
                margin: "5px 0 0",
                color: "#ffffff",
                fontSize: "29px",
                lineHeight: "35px",
              }}
            >
              {data.invoice.invoiceNumber}
            </Heading>
          </Section>

          <Section style={section}>
            <Heading
              as="h2"
              style={{
                margin: "0",
                color: "#18303a",
                fontSize: "21px",
                lineHeight: "29px",
              }}
            >
              Hej {customerName}!
            </Heading>

            <Text
              style={{
                margin: "12px 0 0",
                color: "#425b66",
                fontSize: "14px",
                lineHeight: "23px",
              }}
            >
              Här kommer faktura{" "}
              <strong>
                {data.invoice.invoiceNumber}
              </strong>{" "}
              från {company.name}.
            </Text>

            <Text
              style={{
                ...muted,
                marginTop: "8px",
              }}
            >
              Fakturan har skickats till{" "}
              {recipientEmail}.
            </Text>

            <table
              role="presentation"
              width="100%"
              cellPadding="0"
              cellSpacing="0"
              style={{
                marginTop: "24px",
                borderCollapse: "separate",
                borderSpacing: "10px",
              }}
            >
              <tbody>
                <tr>
                  <td
                    width="50%"
                    style={infoCard}
                  >
                    <Text style={label}>
                      Fakturadatum
                    </Text>

                    <Text style={value}>
                      {dateText(
                        data.invoice
                          .invoiceDate
                      )}
                    </Text>
                  </td>

                  <td
                    width="50%"
                    style={infoCard}
                  >
                    <Text style={label}>
                      Förfallodatum
                    </Text>

                    <Text style={value}>
                      {dateText(
                        data.invoice.dueDate
                      )}
                    </Text>
                  </td>
                </tr>

                <tr>
                  <td
                    width="50%"
                    style={infoCard}
                  >
                    <Text style={label}>
                      OCR / referens
                    </Text>

                    <Text style={value}>
                      {paymentReference}
                    </Text>
                  </td>

                  <td
                    width="50%"
                    style={infoCard}
                  >
                    <Text style={label}>
                      Betalningsvillkor
                    </Text>

                    <Text style={value}>
                      {
                        data.invoice
                          .paymentTermsDays
                      }{" "}
                      dagar
                    </Text>
                  </td>
                </tr>
              </tbody>
            </table>

            <Hr
              style={{
                margin: "25px 0",
                borderColor: "#dce5e8",
              }}
            />

            <Heading
              as="h3"
              style={{
                margin: "0 0 14px",
                color: "#18303a",
                fontSize: "15px",
              }}
            >
              Fakturarader
            </Heading>

            <table
              role="presentation"
              width="100%"
              cellPadding="0"
              cellSpacing="0"
              style={{
                width: "100%",
                borderCollapse:
                  "collapse",
              }}
            >
              <thead>
                <tr>
                  <th
                    align="left"
                    style={{
                      padding:
                        "9px 7px",
                      borderBottom:
                        "1px solid #dbe5e8",
                      color: "#71838c",
                      fontSize: "9px",
                      textTransform:
                        "uppercase",
                    }}
                  >
                    Beskrivning
                  </th>

                  <th
                    align="right"
                    style={{
                      padding:
                        "9px 7px",
                      borderBottom:
                        "1px solid #dbe5e8",
                      color: "#71838c",
                      fontSize: "9px",
                      textTransform:
                        "uppercase",
                    }}
                  >
                    Summa
                  </th>
                </tr>
              </thead>

              <tbody>
                {data.items.map(
                  (item) => (
                    <tr key={item.id}>
                      <td
                        style={{
                          padding:
                            "13px 7px",
                          borderBottom:
                            "1px solid #edf2f4",
                          color:
                            "#233d47",
                          fontSize:
                            "12px",
                          lineHeight:
                            "18px",
                        }}
                      >
                        <strong>
                          {
                            item.description
                          }
                        </strong>

                        <br />

                        <span
                          style={{
                            color:
                              "#788b93",
                            fontSize:
                              "10px",
                          }}
                        >
                          {item.quantity}{" "}
                          {item.unitCode} ×{" "}
                          {money(
                            item.unitPriceExVat,
                            data.invoice
                              .currency
                          )}
                          {" · "}
                          Moms{" "}
                          {item.vatRate} %
                        </span>
                      </td>

                      <td
                        align="right"
                        style={{
                          padding:
                            "13px 7px",
                          borderBottom:
                            "1px solid #edf2f4",
                          color:
                            "#233d47",
                          fontSize:
                            "12px",
                          fontWeight:
                            "700",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {money(
                          item.subtotalExVat,
                          data.invoice.currency
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>

            <Section
              style={{
                ...totalCard,
                backgroundColor:
                  accentColor,
              }}
            >
              <table
                role="presentation"
                width="100%"
                cellPadding="0"
                cellSpacing="0"
              >
                <tbody>
                  <tr>
                    <td>
                      <Text
                        style={{
                          margin: "0",
                          color:
                            "rgba(255,255,255,0.7)",
                          fontSize: "11px",
                        }}
                      >
                        Att betala
                      </Text>
                    </td>

                    <td align="right">
                      <Text
                        style={{
                          margin: "0",
                          color: "#ffffff",
                          fontSize: "23px",
                          fontWeight: "700",
                        }}
                      >
                        {money(
                          data.invoice
                            .outstandingAmount,
                          data.invoice
                            .currency
                        )}
                      </Text>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            <Heading
              as="h3"
              style={{
                margin: "27px 0 13px",
                color: "#18303a",
                fontSize: "15px",
              }}
            >
              Betalningsuppgifter
            </Heading>

            <table
              role="presentation"
              width="100%"
              cellPadding="0"
              cellSpacing="0"
              style={{
                borderCollapse:
                  "collapse",
              }}
            >
              <tbody>
                {company.bankgiro && (
                  <tr>
                    <td
                      style={{
                        padding:
                          "7px 0",
                        color:
                          "#74868e",
                        fontSize:
                          "11px",
                      }}
                    >
                      Bankgiro
                    </td>

                    <td
                      align="right"
                      style={{
                        padding:
                          "7px 0",
                        color:
                          "#203943",
                        fontSize:
                          "12px",
                        fontWeight:
                          "700",
                      }}
                    >
                      {company.bankgiro}
                    </td>
                  </tr>
                )}

                {company.plusgiro && (
                  <tr>
                    <td
                      style={{
                        padding:
                          "7px 0",
                        color:
                          "#74868e",
                        fontSize:
                          "11px",
                      }}
                    >
                      Plusgiro
                    </td>

                    <td
                      align="right"
                      style={{
                        padding:
                          "7px 0",
                        color:
                          "#203943",
                        fontSize:
                          "12px",
                        fontWeight:
                          "700",
                      }}
                    >
                      {company.plusgiro}
                    </td>
                  </tr>
                )}

                {company.swishNumber && (
                  <tr>
                    <td
                      style={{
                        padding:
                          "7px 0",
                        color:
                          "#74868e",
                        fontSize:
                          "11px",
                      }}
                    >
                      Swish
                    </td>

                    <td
                      align="right"
                      style={{
                        padding:
                          "7px 0",
                        color:
                          "#203943",
                        fontSize:
                          "12px",
                        fontWeight:
                          "700",
                      }}
                    >
                      {
                        company.swishNumber
                      }
                    </td>
                  </tr>
                )}

                {company.iban && (
                  <tr>
                    <td
                      style={{
                        padding:
                          "7px 0",
                        color:
                          "#74868e",
                        fontSize:
                          "11px",
                      }}
                    >
                      IBAN
                    </td>

                    <td
                      align="right"
                      style={{
                        padding:
                          "7px 0",
                        color:
                          "#203943",
                        fontSize:
                          "12px",
                        fontWeight:
                          "700",
                      }}
                    >
                      {company.iban}
                    </td>
                  </tr>
                )}

                <tr>
                  <td
                    style={{
                      padding: "7px 0",
                      color: "#74868e",
                      fontSize: "11px",
                    }}
                  >
                    Referens
                  </td>

                  <td
                    align="right"
                    style={{
                      padding: "7px 0",
                      color: "#203943",
                      fontSize: "12px",
                      fontWeight: "700",
                    }}
                  >
                    {paymentReference}
                  </td>
                </tr>
              </tbody>
            </table>

            {company.invoiceFooterText && (
              <Text
                style={{
                  margin:
                    "23px 0 0",
                  padding:
                    "14px 16px",
                  border:
                    "1px solid #dce6ea",
                  borderRadius:
                    "7px",
                  color: "#5a707a",
                  backgroundColor:
                    "#f7fafb",
                  fontSize: "11px",
                  lineHeight: "18px",
                  whiteSpace: "pre-line",
                }}
              >
                {
                  company.invoiceFooterText
                }
              </Text>
            )}
          </Section>

          <Section style={footer}>
            <strong>
              {company.name}
            </strong>

            <br />

            {[
              company.address,
              [
                company.postalCode,
                company.city,
              ]
                .filter(Boolean)
                .join(" "),
              company.country,
            ]
              .filter(Boolean)
              .join(" · ")}

            <br />

            {[
              company.email,
              company.phone,
              company.website,
            ]
              .filter(Boolean)
              .join(" · ")}

            {company.organizationNumber && (
              <>
                <br />
                Org.nr{" "}
                {
                  company.organizationNumber
                }
              </>
            )}

            {company.approvedForFTax && (
              <>
                {" · "}
                Godkänd för F-skatt
              </>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
