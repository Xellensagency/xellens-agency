import type { ReactNode } from "react";
import LoginBrand from "./LoginBrand";
import styles from "./LoginLayout.module.css";

type LoginLayoutProps = {
  children?: ReactNode;
};

export default function LoginLayout({ children }: LoginLayoutProps) {
  return (
    <main className={styles.page}>
      <div className={styles.glowOne} />
      <div className={styles.glowTwo} />
      <div className={styles.gridPattern} />

      <div className={styles.container}>
        <LoginBrand />

        <section className={styles.formArea}>
          {children}
        </section>
      </div>

      <div className={styles.footer}>
        © {new Date().getFullYear()} Xellens Agency
      </div>
    </main>
  );
}
