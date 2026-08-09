"use client";

import {
  useState,
  useTransition,
} from "react";

import Link from "next/link";

import {
  CheckCircle2,
  FlaskConical,
  LoaderCircle,
  Send,
  TriangleAlert,
} from "lucide-react";

import {
  saveOfferAction,
} from "@/app/dashboard/offerter/actions";


type ResultState = {
  type:
    | "success"
    | "error";

  message: string;

  offerId?: string;

  offerNumber?: string;
};


export default function TestOfferButton() {
  const [
    isPending,
    startTransition,
  ] = useTransition();

  const [
    result,
    setResult,
  ] =
    useState<ResultState | null>(
      null
    );


  function createAndSendTestOffer() {
    setResult(null);

    startTransition(() => {
      void (async () => {

        const response =
          await saveOfferAction({
            offerId: null,

            sendNow: true,

            payload: {
              draft: {
                customerMode:
                  "new",

                customerId:
                  "",

                contactId:
                  "",

                newCustomerType:
                  "private",

                newCustomerName:
                  "Andreas Ekelöf – Testkund",

                newCustomerEmail:
                  "ekelof.andreas@hotmail.com",

                newCustomerPhone:
                  "",

                existingProjectId:
                  "",

                title:
                  "Vorix testoffert – systemtest",

                description:
                  "Test av Vorix offertflöde, e-post, versionshistorik och kundvy.",

                categoryId:
                  "",

                desiredStartDate:
                  "",

                internalNote:
                  "AUTOMATISKT TEST – kan tas bort efter verifiering.",

                validDays:
                  "14",

                language:
                  "sv",

                currency:
                  "SEK",

                customerMessage:
                  "Tack för ditt intresse för Vorix. Detta är en testoffert för att verifiera vårt nya digitala offertflöde. Ingen beställning eller betalningsskyldighet uppstår genom denna testoffert.",

                paymentTerms:
                  "Detta är en testoffert. Ingen betalning ska göras.",

                termsText:
                  "Denna offert är endast skapad för tekniskt systemtest av Vorix offertflöde och utgör inte ett bindande avtal.",

                includeDetailedPricing:
                  true,

                showVat:
                  true,

                includePdf:
                  true,

                sendCopyToSelf:
                  false,
              },


              services: [
                {
                  id:
                    "test-service-web",

                  sourceServiceId:
                    null,

                  sourcePackageId:
                    null,

                  categoryId:
                    null,

                  name:
                    "Webbdesign & utveckling",

                  description:
                    "Design och utveckling av en modern digital lösning från Vorix.",

                  pricingModel:
                    "fixed",

                  unitCode:
                    "st",

                  quantity:
                    1,

                  unitPriceExVat:
                    10000,

                  discountPercent:
                    0,

                  vatRate:
                    25,

                  customerVisible:
                    true,

                  isOptional:
                    false,
                },
              ],


              addons: [
                {
                  id:
                    "test-addon-seo",

                  sourceServiceId:
                    null,

                  sourcePackageId:
                    null,

                  categoryId:
                    null,

                  name:
                    "SEO Startpaket",

                  description:
                    "Grundläggande teknisk SEO och optimering inför lansering.",

                  pricingModel:
                    "fixed",

                  unitCode:
                    "st",

                  quantity:
                    1,

                  unitPriceExVat:
                    2500,

                  discountPercent:
                    0,

                  vatRate:
                    25,

                  customerVisible:
                    true,

                  isOptional:
                    true,
                },
              ],


              discount: {
                mode:
                  "none",

                value:
                  0,

                label:
                  "",

                code:
                  "",
              },
            },
          });


        if (
          !response.ok
        ) {
          setResult({
            type:
              "error",

            message:
              response.error ||
              "Testofferten kunde inte skickas.",
          });

          return;
        }


        setResult({
          type:
            "success",

          message:
            "Testofferten skapades och skickades.",

          offerId:
            response.offerId,

          offerNumber:
            response.offerNumber,
        });

      })();
    });
  }


  return (
    <div
      style={{
        display:
          "grid",

        gap:
          "16px",
      }}
    >
      <button
        type="button"
        onClick={
          createAndSendTestOffer
        }
        disabled={
          isPending
        }
        style={{
          minHeight:
            "48px",

          display:
            "inline-flex",

          alignItems:
            "center",

          justifyContent:
            "center",

          gap:
            "8px",

          padding:
            "0 18px",

          border:
            "0",

          borderRadius:
            "9px",

          background:
            "var(--vorix-brand-champagne)",

          color:
            "#0B2F33",

          font:
            "inherit",

          fontSize:
            "12px",

          fontWeight:
            650,

          cursor:
            isPending
              ? "wait"
              : "pointer",

          opacity:
            isPending
              ? 0.65
              : 1,
        }}
      >
        {isPending ? (
          <>
            <LoaderCircle
              size={18}
            />

            Skapar och skickar...
          </>
        ) : (
          <>
            <Send
              size={18}
            />

            Skapa & skicka testoffert
          </>
        )}
      </button>


      {result && (
        <div
          style={{
            display:
              "grid",

            gap:
              "10px",

            padding:
              "16px",

            border:
              result.type ===
              "success"
                ? "1px solid rgba(34,181,115,.25)"
                : "1px solid rgba(232,121,121,.3)",

            borderRadius:
              "10px",

            background:
              result.type ===
              "success"
                ? "rgba(34,181,115,.06)"
                : "rgba(232,121,121,.06)",
          }}
        >
          <div
            style={{
              display:
                "flex",

              alignItems:
                "center",

              gap:
                "8px",
            }}
          >
            {result.type ===
            "success" ? (
              <CheckCircle2
                size={19}
              />
            ) : (
              <TriangleAlert
                size={19}
              />
            )}

            <strong
              style={{
                fontSize:
                  "12px",
              }}
            >
              {
                result.message
              }
            </strong>
          </div>


          {result.offerNumber && (
            <div
              style={{
                fontSize:
                  "11px",

                color:
                  "var(--vorix-text-secondary)",
              }}
            >
              Offertnummer:{" "}
              <strong>
                {
                  result.offerNumber
                }
              </strong>
            </div>
          )}


          {result.offerId && (
            <Link
              href={`/dashboard/offerter/${result.offerId}`}
              style={{
                width:
                  "fit-content",

                color:
                  "var(--vorix-brand-green)",

                fontSize:
                  "11px",

                fontWeight:
                  650,

                textDecoration:
                  "none",
              }}
            >
              Öppna testofferten →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}