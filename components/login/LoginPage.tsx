import Image from "next/image";
import LoginForm from "./LoginForm";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <section className={styles.loginShell}>
        <div className={styles.loginPanel}>
          <Image
            src="/images/login/xellens-login-logo.png"
            alt="Xellens Agency"
            width={310}
            height={100}
            priority
            className={styles.logo}
          />

          <div className={styles.content}>
            <p className={styles.welcome}>
              Välkommen tillbaka!
            </p>

            <h1 className={styles.title}>
              <span>Logga in för att fortsätta</span>
              <span>i din portal</span>
            </h1>

            <p className={styles.description}>
              Hantera dina projekt, kunder och uppdrag
              <br />
              på ett och samma ställe.
            </p>

            <LoginForm />
          </div>

          <footer className={styles.footer}>
            © {new Date().getFullYear()} Xellens Agency.
            Alla rättigheter förbehållna.
          </footer>
        </div>

        <aside
          className={styles.visualPanel}
          aria-label="Xellens Agency administrationsportal"
        />
      </section>
    </main>
  );
}
