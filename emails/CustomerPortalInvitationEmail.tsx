import type {
  CSSProperties,
} from "react";

import {
  Button,
  Column,
  Heading,
  Hr,
  Link,
  Row,
  Section,
  Text,
} from "@react-email/components";

import XellensEmailLayout from "./components/XellensEmailLayout";

export type CustomerPortalInvitationEmailProps = {
  firstName: string;
  companyName: string;
  invitedByName: string;
  activationUrl: string;
  expiresAt: string;
  recipientEmail: string;
};

const colors = {
  navy: "#07366f",
  darkNavy: "#062f63",
  text: "#263f5b",
  muted: "#687d92",
  border: "#dce5ef",
  pale: "#f5f8fc",
  circle: "#e9eff7",
};

const heroStyle: CSSProperties = {
  padding: "32px 34px 23px",
  backgroundColor: "#ffffff",
};

const heroTableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const heroLeftStyle: CSSProperties = {
  width: "55%",
  padding: "10px 22px 10px 0",
  verticalAlign: "middle",
};

const heroRightStyle: CSSProperties = {
  width: "45%",
  padding: "6px 0 6px 12px",
  verticalAlign: "middle",
};

const eyebrowStyle: CSSProperties = {
  margin: "0 0 14px",
  color: colors.navy,
  fontSize: "11px",
  lineHeight: "16px",
  fontWeight: "800",
  letterSpacing: "1.6px",
};

const titleStyle: CSSProperties = {
  margin: "0",
  color: colors.navy,
  fontSize: "35px",
  lineHeight: "41px",
  fontWeight: "800",
};

const introStyle: CSSProperties = {
  margin: "17px 0 0",
  color: colors.text,
  fontSize: "15px",
  lineHeight: "23px",
};

const buttonStyle: CSSProperties = {
  display: "inline-block",
  marginTop: "20px",
  padding: "15px 28px",
  borderRadius: "7px",
  color: "#ffffff",
  backgroundColor: colors.navy,
  fontSize: "14px",
  lineHeight: "18px",
  fontWeight: "700",
  textDecoration: "none",
  boxShadow:
    "0 7px 18px rgba(7, 54, 111, 0.18)",
};

const illustrationStyle: CSSProperties = {
  padding: "24px 20px",
  borderRadius: "50%",
  backgroundColor: colors.circle,
};

const browserStyle: CSSProperties = {
  overflow: "hidden",
  border: `1px solid ${colors.border}`,
  borderRadius: "9px",
  backgroundColor: "#ffffff",
  boxShadow:
    "0 12px 25px rgba(23, 58, 93, 0.12)",
};

const browserTopStyle: CSSProperties = {
  height: "25px",
  padding: "0 9px",
  color: "#ffffff",
  backgroundColor: colors.navy,
  fontSize: "10px",
  lineHeight: "25px",
  fontWeight: "700",
};

const browserContentStyle: CSSProperties = {
  padding: "13px",
};

const browserRowStyle: CSSProperties = {
  height: "8px",
  marginBottom: "9px",
  borderRadius: "5px",
  backgroundColor: "#e5ebf2",
};

const browserCardStyle: CSSProperties = {
  display: "inline-block",
  width: "27%",
  height: "45px",
  marginRight: "4%",
  borderRadius: "6px",
  backgroundColor: "#eef3f8",
};

const invitationStyle: CSSProperties = {
  margin: "0 34px",
  padding: "20px 22px",
  border: `1px solid ${colors.border}`,
  borderRadius: "11px",
  backgroundColor: colors.pale,
};

const invitationTextStyle: CSSProperties = {
  margin: "0",
  color: colors.text,
  fontSize: "13px",
  lineHeight: "21px",
};

const featureSectionStyle: CSSProperties = {
  padding: "27px 30px 24px",
};

const featureColumnStyle: CSSProperties = {
  width: "33.33%",
  padding: "5px",
  verticalAlign: "top",
};

const featureCardStyle: CSSProperties = {
  minHeight: "130px",
  padding: "17px 14px",
  border: `1px solid ${colors.border}`,
  borderRadius: "9px",
  backgroundColor: "#f7f9fc",
};

const featureIconStyle: CSSProperties = {
  width: "43px",
  height: "43px",
  margin: "0 0 13px",
  borderRadius: "50%",
  color: colors.navy,
  backgroundColor: "#e2eaf4",
  fontSize: "21px",
  lineHeight: "43px",
  fontWeight: "800",
  textAlign: "center",
};

const featureTitleStyle: CSSProperties = {
  margin: "0",
  color: colors.text,
  fontSize: "12px",
  lineHeight: "17px",
  fontWeight: "700",
};

const featureTextStyle: CSSProperties = {
  margin: "7px 0 0",
  color: colors.muted,
  fontSize: "10px",
  lineHeight: "16px",
};

const securitySectionStyle: CSSProperties = {
  margin: "0 34px 24px",
  padding: "17px 20px",
  borderTop: `1px solid ${colors.border}`,
  borderBottom: `1px solid ${colors.border}`,
};

const securityTableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const securityIconStyle: CSSProperties = {
  width: "42px",
  height: "42px",
  borderRadius: "50%",
  color: colors.navy,
  backgroundColor: "#e5ecf5",
  fontSize: "20px",
  lineHeight: "42px",
  fontWeight: "700",
  textAlign: "center",
};

const securityTitleStyle: CSSProperties = {
  margin: "0",
  color: colors.text,
  fontSize: "11px",
  lineHeight: "17px",
  fontWeight: "700",
};

const securityTextStyle: CSSProperties = {
  margin: "4px 0 0",
  color: colors.muted,
  fontSize: "10px",
  lineHeight: "16px",
};

const fallbackStyle: CSSProperties = {
  margin: "0",
  padding: "0 34px 28px",
  color: "#8b9aaa",
  fontSize: "9px",
  lineHeight: "15px",
  textAlign: "center",
};

const fallbackLinkStyle: CSSProperties = {
  color: colors.navy,
  textDecoration: "none",
  wordBreak: "break-all",
};

export default function CustomerPortalInvitationEmail({
  firstName = "Emma",
  companyName = "Nordic Skin",
  invitedByName = "Andreas Ekelöf",
  activationUrl =
    "https://kund.xellensagency.com/aktivera?token=xellens-exempel",
  expiresAt = "23 juli 2026 kl. 18:00",
  recipientEmail = "emma@nordicskin.se",
}: CustomerPortalInvitationEmailProps) {
  return (
    <XellensEmailLayout
      previewText={`Välkommen till Xellens kundportal för ${companyName}.`}
    >
      <Section style={heroStyle}>
        <table
          role="presentation"
          style={heroTableStyle}
        >
          <tbody>
            <tr>
              <td style={heroLeftStyle}>
                <Text style={eyebrowStyle}>
                  VÄLKOMMEN!
                </Text>

                <Heading style={titleStyle}>
                  Välkommen till
                  <br />
                  Xellens kundportal
                </Heading>

                <Text style={introStyle}>
                  Din nya hubb för smidig
                  projektkommunikation och
                  effektivt samarbete.
                </Text>

                <Button
                  href={activationUrl}
                  style={buttonStyle}
                >
                  Aktivera mitt konto →
                </Button>
              </td>

              <td style={heroRightStyle}>
                <Section style={illustrationStyle}>
                  <Section style={browserStyle}>
                    <div style={browserTopStyle}>
                      XELLENS · ÖVERSIKT
                    </div>

                    <div style={browserContentStyle}>
                      <div
                        style={{
                          ...browserRowStyle,
                          width: "58%",
                        }}
                      />

                      <div
                        style={{
                          ...browserRowStyle,
                          width: "82%",
                        }}
                      />

                      <div
                        style={{
                          ...browserRowStyle,
                          width: "68%",
                          marginBottom: "14px",
                        }}
                      />

                      <div style={browserCardStyle} />
                      <div style={browserCardStyle} />

                      <div
                        style={{
                          ...browserCardStyle,
                          marginRight: "0",
                        }}
                      />
                    </div>
                  </Section>
                </Section>
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section style={invitationStyle}>
        <Text style={invitationTextStyle}>
          Hej <strong>{firstName}</strong>!
          <br />
          <br />

          <strong>{invitedByName}</strong>{" "}
          från Xellens Agency har bjudit in
          dig till kundportalen för{" "}
          <strong>{companyName}</strong>.
          Här kan ni hantera projekt,
          dokument, meddelanden,
          godkännanden och fakturor på ett
          och samma ställe.
        </Text>
      </Section>

      <Section style={featureSectionStyle}>
        <Row>
          <Column style={featureColumnStyle}>
            <Section style={featureCardStyle}>
              <Text style={featureIconStyle}>
                ▣
              </Text>

              <Text style={featureTitleStyle}>
                Samla allt på ett ställe
              </Text>

              <Text style={featureTextStyle}>
                Få en tydlig överblick över
                projekt, filer och
                uppdateringar.
              </Text>
            </Section>
          </Column>

          <Column style={featureColumnStyle}>
            <Section style={featureCardStyle}>
              <Text style={featureIconStyle}>
                ●
              </Text>

              <Text style={featureTitleStyle}>
                Kommunicera enkelt
              </Text>

              <Text style={featureTextStyle}>
                Ha alla konversationer,
                kommentarer och möten
                samlade.
              </Text>
            </Section>
          </Column>

          <Column style={featureColumnStyle}>
            <Section style={featureCardStyle}>
              <Text style={featureIconStyle}>
                ✓
              </Text>

              <Text style={featureTitleStyle}>
                Godkänn smidigt
              </Text>

              <Text style={featureTextStyle}>
                Granska offerter och
                designförslag och lämna
                feedback.
              </Text>
            </Section>
          </Column>
        </Row>
      </Section>

      <Section style={securitySectionStyle}>
        <table
          role="presentation"
          style={securityTableStyle}
        >
          <tbody>
            <tr>
              <td
                style={{
                  width: "54px",
                  verticalAlign: "middle",
                }}
              >
                <div style={securityIconStyle}>
                  ◇
                </div>
              </td>

              <td
                style={{
                  paddingLeft: "13px",
                  verticalAlign: "middle",
                }}
              >
                <Text style={securityTitleStyle}>
                  Säker. Pålitlig.
                  Tillgänglig.
                </Text>

                <Text style={securityTextStyle}>
                  Inbjudan gäller till{" "}
                  <strong>{expiresAt}</strong>{" "}
                  och kan endast användas av{" "}
                  <strong>
                    {recipientEmail}
                  </strong>
                  . Länken kan användas en
                  gång.
                </Text>
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Text style={fallbackStyle}>
        Fungerar inte knappen? Kopiera
        länken och klistra in den i din
        webbläsare:
        <br />

        <Link
          href={activationUrl}
          style={fallbackLinkStyle}
        >
          {activationUrl}
        </Link>
      </Text>
    </XellensEmailLayout>
  );
}
