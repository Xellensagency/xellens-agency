import type {
  CSSProperties,
  ReactNode,
} from "react";

import {
  Button,
  Column,
  Heading,
  Link,
  Row,
  Section,
  Text,
} from "@react-email/components";

import XellensEmailLayout from "./XellensEmailLayout";

export type XellensEmailDetail = {
  label: string;
  value: string;
  tone?:
    | "default"
    | "accent"
    | "warning"
    | "danger";
};

export type XellensEmailFeature = {
  icon: string;
  title: string;
  text: string;
};

type XellensTransactionalEmailProps = {
  previewText: string;
  eyebrow: string;
  title: ReactNode;
  intro: string;

  greeting?: string;
  body?: ReactNode;

  illustrationTitle: string;
  illustrationBadge?: string;

  ctaLabel: string;
  ctaUrl: string;

  details?: XellensEmailDetail[];
  features?: XellensEmailFeature[];

  noticeTitle?: string;
  noticeText?: ReactNode;

  fallbackUrl?: string;
};

const colors = {
  navy: "#07366f",
  darkNavy: "#062f63",
  text: "#263f5b",
  muted: "#687d92",
  border: "#dce5ef",
  pale: "#f5f8fc",
  circle: "#e9eff7",
  accent: "#0e7184",
  warning: "#d78816",
  danger: "#c74747",
};

const heroStyle: CSSProperties = {
  padding: "32px 34px 26px",
  backgroundColor: "#ffffff",
};

const heroTableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const heroLeftStyle: CSSProperties = {
  width: "56%",
  padding: "8px 24px 8px 0",
  verticalAlign: "middle",
};

const heroRightStyle: CSSProperties = {
  width: "44%",
  padding: "8px 0 8px 12px",
  verticalAlign: "middle",
};

const eyebrowStyle: CSSProperties = {
  margin: "0 0 14px",
  color: colors.navy,
  fontSize: "11px",
  lineHeight: "16px",
  fontWeight: "800",
  letterSpacing: "1.7px",
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
  marginTop: "21px",
  padding: "15px 27px",
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

const illustrationOuterStyle: CSSProperties = {
  padding: "24px 20px",
  borderRadius: "50%",
  backgroundColor: colors.circle,
};

const illustrationCardStyle: CSSProperties = {
  overflow: "hidden",
  border: `1px solid ${colors.border}`,
  borderRadius: "10px",
  backgroundColor: "#ffffff",
  boxShadow:
    "0 13px 27px rgba(23, 58, 93, 0.12)",
};

const illustrationHeaderStyle: CSSProperties = {
  padding: "11px 13px",
  color: "#ffffff",
  backgroundColor: colors.navy,
  fontSize: "10px",
  lineHeight: "15px",
  fontWeight: "700",
  letterSpacing: "0.5px",
};

const illustrationBodyStyle: CSSProperties = {
  padding: "15px",
};

const illustrationBadgeStyle: CSSProperties = {
  display: "inline-block",
  marginBottom: "12px",
  padding: "5px 9px",
  borderRadius: "14px",
  color: colors.navy,
  backgroundColor: "#e7edf5",
  fontSize: "9px",
  lineHeight: "13px",
  fontWeight: "700",
};

const illustrationTitleStyle: CSSProperties = {
  margin: "0 0 13px",
  color: colors.text,
  fontSize: "14px",
  lineHeight: "19px",
  fontWeight: "700",
};

const illustrationLineStyle: CSSProperties = {
  height: "7px",
  marginBottom: "8px",
  borderRadius: "5px",
  backgroundColor: "#e6ebf1",
};

const contentStyle: CSSProperties = {
  margin: "0 34px",
  padding: "20px 22px",
  border: `1px solid ${colors.border}`,
  borderRadius: "11px",
  backgroundColor: colors.pale,
};

const greetingStyle: CSSProperties = {
  margin: "0 0 13px",
  color: colors.text,
  fontSize: "13px",
  lineHeight: "20px",
  fontWeight: "700",
};

const bodyTextStyle: CSSProperties = {
  margin: "0",
  color: colors.text,
  fontSize: "13px",
  lineHeight: "21px",
};

const detailsSectionStyle: CSSProperties = {
  padding: "25px 29px 7px",
};

const detailColumnStyle: CSSProperties = {
  padding: "5px",
  verticalAlign: "top",
};

const detailCardStyle: CSSProperties = {
  minHeight: "82px",
  padding: "14px 12px",
  border: `1px solid ${colors.border}`,
  borderRadius: "9px",
  backgroundColor: "#ffffff",
  textAlign: "center",
};

const detailLabelStyle: CSSProperties = {
  margin: "0",
  color: colors.muted,
  fontSize: "9px",
  lineHeight: "14px",
};

const detailValueStyle: CSSProperties = {
  margin: "7px 0 0",
  color: colors.text,
  fontSize: "12px",
  lineHeight: "17px",
  fontWeight: "700",
};

const featureSectionStyle: CSSProperties = {
  padding: "20px 29px 23px",
};

const featureColumnStyle: CSSProperties = {
  width: "33.33%",
  padding: "5px",
  verticalAlign: "top",
};

const featureCardStyle: CSSProperties = {
  minHeight: "125px",
  padding: "17px 14px",
  border: `1px solid ${colors.border}`,
  borderRadius: "9px",
  backgroundColor: "#f7f9fc",
};

const featureIconStyle: CSSProperties = {
  width: "42px",
  height: "42px",
  margin: "0 0 12px",
  borderRadius: "50%",
  color: colors.navy,
  backgroundColor: "#e3eaf4",
  fontSize: "20px",
  lineHeight: "42px",
  fontWeight: "700",
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

const noticeStyle: CSSProperties = {
  margin: "0 34px 24px",
  padding: "17px 20px",
  borderTop: `1px solid ${colors.border}`,
  borderBottom: `1px solid ${colors.border}`,
};

const noticeTitleStyle: CSSProperties = {
  margin: "0",
  color: colors.text,
  fontSize: "11px",
  lineHeight: "17px",
  fontWeight: "700",
};

const noticeTextStyle: CSSProperties = {
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

function getToneColor(
  tone:
    | XellensEmailDetail["tone"]
    | undefined
) {
  if (tone === "accent") {
    return colors.accent;
  }

  if (tone === "warning") {
    return colors.warning;
  }

  if (tone === "danger") {
    return colors.danger;
  }

  return colors.text;
}

export default function XellensTransactionalEmail({
  previewText,
  eyebrow,
  title,
  intro,
  greeting,
  body,
  illustrationTitle,
  illustrationBadge,
  ctaLabel,
  ctaUrl,
  details = [],
  features = [],
  noticeTitle,
  noticeText,
  fallbackUrl,
}: XellensTransactionalEmailProps) {
  const detailWidth =
    details.length > 0
      ? `${100 / details.length}%`
      : "25%";

  return (
    <XellensEmailLayout
      previewText={previewText}
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
                  {eyebrow}
                </Text>

                <Heading style={titleStyle}>
                  {title}
                </Heading>

                <Text style={introStyle}>
                  {intro}
                </Text>

                <Button
                  href={ctaUrl}
                  style={buttonStyle}
                >
                  {ctaLabel} →
                </Button>
              </td>

              <td style={heroRightStyle}>
                <Section
                  style={illustrationOuterStyle}
                >
                  <Section
                    style={illustrationCardStyle}
                  >
                    <Section
                      style={illustrationHeaderStyle}
                    >
                      XELLENS PORTAL
                    </Section>

                    <Section
                      style={illustrationBodyStyle}
                    >
                      {illustrationBadge && (
                        <Text
                          style={
                            illustrationBadgeStyle
                          }
                        >
                          {illustrationBadge}
                        </Text>
                      )}

                      <Text
                        style={
                          illustrationTitleStyle
                        }
                      >
                        {illustrationTitle}
                      </Text>

                      <Section
                        style={{
                          ...illustrationLineStyle,
                          width: "86%",
                        }}
                      />

                      <Section
                        style={{
                          ...illustrationLineStyle,
                          width: "68%",
                        }}
                      />

                      <Section
                        style={{
                          ...illustrationLineStyle,
                          width: "78%",
                          marginBottom: "0",
                        }}
                      />
                    </Section>
                  </Section>
                </Section>
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      {(greeting || body) && (
        <Section style={contentStyle}>
          {greeting && (
            <Text style={greetingStyle}>
              {greeting}
            </Text>
          )}

          {body && (
            <Text style={bodyTextStyle}>
              {body}
            </Text>
          )}
        </Section>
      )}

      {details.length > 0 && (
        <Section style={detailsSectionStyle}>
          <Row>
            {details.map(
              (detail) => (
                <Column
                  key={`${detail.label}-${detail.value}`}
                  style={{
                    ...detailColumnStyle,
                    width: detailWidth,
                  }}
                >
                  <Section style={detailCardStyle}>
                    <Text style={detailLabelStyle}>
                      {detail.label}
                    </Text>

                    <Text
                      style={{
                        ...detailValueStyle,
                        color: getToneColor(
                          detail.tone
                        ),
                      }}
                    >
                      {detail.value}
                    </Text>
                  </Section>
                </Column>
              )
            )}
          </Row>
        </Section>
      )}

      {features.length > 0 && (
        <Section style={featureSectionStyle}>
          <Row>
            {features.map(
              (feature) => (
                <Column
                  key={feature.title}
                  style={featureColumnStyle}
                >
                  <Section style={featureCardStyle}>
                    <Text style={featureIconStyle}>
                      {feature.icon}
                    </Text>

                    <Text style={featureTitleStyle}>
                      {feature.title}
                    </Text>

                    <Text style={featureTextStyle}>
                      {feature.text}
                    </Text>
                  </Section>
                </Column>
              )
            )}
          </Row>
        </Section>
      )}

      {(noticeTitle || noticeText) && (
        <Section style={noticeStyle}>
          {noticeTitle && (
            <Text style={noticeTitleStyle}>
              {noticeTitle}
            </Text>
          )}

          {noticeText && (
            <Text style={noticeTextStyle}>
              {noticeText}
            </Text>
          )}
        </Section>
      )}

      <Text style={fallbackStyle}>
        Fungerar inte knappen? Kopiera
        länken och klistra in den i din
        webbläsare:
        <br />

        <Link
          href={fallbackUrl || ctaUrl}
          style={{
            color: colors.navy,
            textDecoration: "none",
            wordBreak: "break-all",
          }}
        >
          {fallbackUrl || ctaUrl}
        </Link>
      </Text>
    </XellensEmailLayout>
  );
}
