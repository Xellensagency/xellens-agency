import type {
  Metadata,
} from "next";

import CustomerLoginForm from "@/components/customer-portal/auth/CustomerLoginForm";

import styles from "./page.module.css";

export const metadata:
Metadata = {
  title:
    "Logga in | Xellens kundportal",
  description:
    "Logga in i Xellens kundportal.",
};

type CustomerLoginPageProps = {
  searchParams: Promise<{
    fel?: string;
  }>;
};

export default async function CustomerLoginPage({
  searchParams,
}: CustomerLoginPageProps) {
  const parameters =
    await searchParams;

  return (
    <main className={styles.page}>
      <section className={styles.brandPanel}>
        <div className={styles.brandContent}>
          <div className={styles.logo}>
            <div className={styles.logoMark}>
              X
            </div>

            <div>
              <strong>
                XELLENS
              </strong>

              <span>
                AGENCY
              </span>
            </div>
          </div>

          <div className={styles.brandText}>
            <span>
              KUNDPORTAL
            </span>

            <h1>
              Ditt projekt.
              <br />
              Samlat på ett ställe.
            </h1>

            <p>
              Följ projekt, granska material,
              hantera filer, fakturor och
              kommunikation direkt med
              Xellens Agency.
            </p>
          </div>

          <div className={styles.features}>
            <div>
              <b>01</b>
              <span>
                Projekt och tidslinjer
              </span>
            </div>

            <div>
              <b>02</b>
              <span>
                Filer och granskning
              </span>
            </div>

            <div>
              <b>03</b>
              <span>
                Meddelanden och support
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.loginPanel}>
        <div className={styles.loginCard}>
          <span className={styles.eyebrow}>
            VÄLKOMMEN TILLBAKA
          </span>

          <h2>
            Logga in
          </h2>

          <p className={styles.intro}>
            Använd den e-postadress som
            blivit inbjuden till
            kundportalen.
          </p>

          {parameters.fel ===
            "behorighet" && (
            <div
              className={
                styles.accessError
              }
            >
              Kontot har ingen aktiv
              kundportalbehörighet.
            </div>
          )}

          <CustomerLoginForm />
        </div>

        <p className={styles.copyright}>
          © 2026 Xellens Agency
        </p>
      </section>
    </main>
  );
}
