import Image from "next/image";
import styles from "./LoginBrand.module.css";

const benefits = [
  "Hantera kunder och projekt",
  "Skapa offerter och fakturor",
  "Kommunicera med dina kunder",
];

export default function LoginBrand() {
  return (
    <section className={styles.brand}>
      <div className={styles.logoWrapper}>
        <Image
          src="/images/brand/xellens-logo.png"
          alt="Xellens Agency"
          width={290}
          height={115}
          className={styles.logo}
          priority
        />
      </div>

      <div className={styles.badge}>
        <span className={styles.badgeDot} />
        Administrationsportal
      </div>

      <h1 className={styles.title}>
        Välkommen tillbaka till
        <span>Xellens Agency.</span>
      </h1>

      <p className={styles.description}>
        Samla kunder, projekt, offerter och kommunikation på ett och samma
        ställe.
      </p>

      <div className={styles.benefits}>
        {benefits.map((benefit) => (
          <div className={styles.benefit} key={benefit}>
            <span className={styles.check}>✓</span>
            <span>{benefit}</span>
          </div>
        ))}
      </div>

      <div className={styles.security}>
        <span className={styles.securityIcon}>◆</span>

        <div>
          <strong>Säker och skyddad portal</strong>
          <p>Din information hanteras tryggt och säkert.</p>
        </div>
      </div>
    </section>
  );
}
