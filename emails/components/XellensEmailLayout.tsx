import type {
  CSSProperties,
  ReactNode,
} from "react";

import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type XellensEmailLayoutProps = {
  previewText: string;
  children: ReactNode;
};

const colors = {
  navy: "#07366f",
  darkNavy: "#062f63",
  text: "#263f5b",
  muted: "#677b91",
  border: "#dce5ef",
  pale: "#f5f8fc",
  background: "#f1f5fa",
  silver: "#b8c2cf",
};

const bodyStyle: CSSProperties = {
  margin: "0",
  padding: "0",
  backgroundColor: colors.background,
  color: colors.text,
  fontFamily:
    "Arial, Helvetica, sans-serif",
};

const outerStyle: CSSProperties = {
  width: "100%",
  padding: "34px 10px",
};

const containerStyle: CSSProperties = {
  width: "100%",
  maxWidth: "760px",
  margin: "0 auto",
  overflow: "hidden",
  border: `1px solid ${colors.border}`,
  borderRadius: "18px",
  backgroundColor: "#ffffff",
  boxShadow:
    "0 18px 55px rgba(22, 55, 90, 0.10)",
};

const logoSectionStyle: CSSProperties = {
  padding: "33px 34px 26px",
  textAlign: "center",
  backgroundColor: "#ffffff",
};

const logoTableStyle: CSSProperties = {
  margin: "0 auto",
  borderCollapse: "collapse",
};

const logoMarkStyle: CSSProperties = {
  width: "66px",
  height: "66px",
  color: "#ffffff",
  backgroundColor: colors.navy,
  borderRadius: "17px",
  fontSize: "38px",
  lineHeight: "66px",
  fontWeight: "700",
  textAlign: "center",
};

const logoNameStyle: CSSProperties = {
  margin: "0",
  color: colors.navy,
  fontSize: "36px",
  lineHeight: "38px",
  fontWeight: "800",
  letterSpacing: "2px",
};

const logoAgencyStyle: CSSProperties = {
  margin: "2px 0 0",
  color: colors.silver,
  fontSize: "26px",
  lineHeight: "28px",
  fontWeight: "400",
  letterSpacing: "3px",
};

const dividerStyle: CSSProperties = {
  margin: "0 34px",
  borderColor: colors.border,
};

const contactSectionStyle: CSSProperties = {
  padding: "22px 34px",
  backgroundColor: "#ffffff",
};

const contactTableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const contactCellStyle: CSSProperties = {
  width: "33.33%",
  padding: "6px 13px",
  color: colors.muted,
  fontSize: "11px",
  lineHeight: "17px",
  verticalAlign: "top",
};

const contactTitleStyle: CSSProperties = {
  display: "block",
  marginBottom: "4px",
  color: colors.text,
  fontWeight: "700",
};

const contactLinkStyle: CSSProperties = {
  color: colors.text,
  textDecoration: "none",
};

const footerStyle: CSSProperties = {
  padding: "20px 34px 23px",
  textAlign: "center",
  backgroundColor: "#f4f7fb",
};

const footerTitleStyle: CSSProperties = {
  margin: "0",
  color: colors.text,
  fontSize: "12px",
  lineHeight: "18px",
  fontWeight: "700",
};

const footerTextStyle: CSSProperties = {
  margin: "4px 0 0",
  color: "#8695a5",
  fontSize: "11px",
  lineHeight: "17px",
};

export default function XellensEmailLayout({
  previewText,
  children,
}: XellensEmailLayoutProps) {
  return (
    <Html lang="sv">
      <Head />

      <Preview>{previewText}</Preview>

      <Body style={bodyStyle}>
        <Section style={outerStyle}>
          <Container style={containerStyle}>
            <Section style={logoSectionStyle}>
              <table
                role="presentation"
                style={logoTableStyle}
              >
                <tbody>
                  <tr>
                    <td
                      style={{
                        paddingRight: "17px",
                        verticalAlign: "middle",
                      }}
                    >
                      <div style={logoMarkStyle}>
                        X
                      </div>
                    </td>

                    <td
                      style={{
                        verticalAlign: "middle",
                        textAlign: "left",
                      }}
                    >
                      <Text style={logoNameStyle}>
                        XELLENS
                      </Text>

                      <Text style={logoAgencyStyle}>
                        AGENCY
                      </Text>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            <Hr style={dividerStyle} />

            {children}

            <Hr style={dividerStyle} />

            <Section style={contactSectionStyle}>
              <table
                role="presentation"
                style={contactTableStyle}
              >
                <tbody>
                  <tr>
                    <td style={contactCellStyle}>
                      <span style={contactTitleStyle}>
                        Xellens Agency
                      </span>

                      Hofverbergsgatan 2B
                      <br />
                      254 43 Helsingborg
                    </td>

                    <td
                      style={{
                        ...contactCellStyle,
                        borderLeft:
                          `1px solid ${colors.border}`,
                        borderRight:
                          `1px solid ${colors.border}`,
                      }}
                    >
                      <span style={contactTitleStyle}>
                        E-post och webb
                      </span>

                      <Link
                        href="mailto:info@xellensagency.com"
                        style={contactLinkStyle}
                      >
                        info@xellensagency.com
                      </Link>

                      <br />

                      <Link
                        href="https://xellensagency.com"
                        style={contactLinkStyle}
                      >
                        xellensagency.com
                      </Link>
                    </td>

                    <td style={contactCellStyle}>
                      <span style={contactTitleStyle}>
                        Kontakta oss
                      </span>

                      072-942 35 37
                      <br />
                      Vardagar 09:00–17:00
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            <Section style={footerStyle}>
              <Text style={footerTitleStyle}>
                Tack för att du är en del av
                Xellens.
              </Text>

              <Text style={footerTextStyle}>
                Tillsammans skapar vi
                framgång.
              </Text>
            </Section>
          </Container>
        </Section>
      </Body>
    </Html>
  );
}
