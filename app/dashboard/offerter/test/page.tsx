import {
  redirect,
} from "next/navigation";

import {
  FlaskConical,
} from "lucide-react";

import TestOfferButton from "@/components/dashboard/offers/test/TestOfferButton";


export default function OfferTestPage() {

  /*
   * Testsidan ska aldrig finnas
   * tillgänglig i produktion.
   */

  if (
    process.env.NODE_ENV ===
    "production"
  ) {
    redirect(
      "/dashboard/offerter"
    );
  }


  return (
    <div
      style={{
        width:
          "min(100%, 780px)",

        display:
          "grid",

        gap:
          "18px",

        paddingBottom:
          "50px",
      }}
    >
      <header>
        <span
          style={{
            display:
              "block",

            color:
              "var(--vorix-brand-green)",

            fontSize:
              "9px",

            fontWeight:
              700,

            letterSpacing:
              ".06em",
          }}
        >
          VORIX · SYSTEMTEST
        </span>

        <h1
          style={{
            margin:
              "7px 0 0",

            color:
              "var(--vorix-text)",

            fontSize:
              "32px",

            fontWeight:
              650,

            letterSpacing:
              "-.035em",
          }}
        >
          Testa offertflödet
        </h1>

        <p
          style={{
            maxWidth:
              "640px",

            margin:
              "8px 0 0",

            color:
              "var(--vorix-text-muted)",

            fontSize:
              "12px",

            lineHeight:
              1.6,
          }}
        >
          Den här sidan skapar en komplett
          testoffert och skickar den till
          ekelof.andreas@hotmail.com.
        </p>
      </header>


      <section
        style={{
          display:
            "grid",

          gap:
            "16px",

          padding:
            "20px",

          border:
            "1px solid var(--vorix-border)",

          borderRadius:
            "12px",

          background:
            "var(--vorix-card-bg)",
        }}
      >
        <div
          style={{
            display:
              "flex",

            gap:
              "10px",

            alignItems:
              "flex-start",
          }}
        >
          <FlaskConical
            size={21}
          />

          <div>
            <strong
              style={{
                display:
                  "block",

                fontSize:
                  "12px",
              }}
            >
              Automatiskt test
            </strong>

            <p
              style={{
                margin:
                  "5px 0 0",

                color:
                  "var(--vorix-text-muted)",

                fontSize:
                  "10px",

                lineHeight:
                  1.55,
              }}
            >
              10 000 kr exkl. moms i grundoffert,
              25 % moms och ett valbart SEO-tillägg
              på 2 500 kr exkl. moms.
            </p>
          </div>
        </div>


        <TestOfferButton />
      </section>
    </div>
  );
}