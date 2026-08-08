"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";

import { createClient } from "@/lib/supabase/client";

import ThemeToggle from "@/components/theme/ThemeToggle";
import styles from "./VorixLoginPage.module.css";

type LoginMode = "admin" | "customer";

export default function VorixLoginPage() {
  const supabase = createClient();

  const [mode, setMode] =
    useState<LoginMode>("admin");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const isAdmin = mode === "admin";

  function changeMode(nextMode: LoginMode) {
    setMode(nextMode);
    setMessage("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setIsLoading(true);
    setMessage("");

    try {
      const {
        data,
        error,
      } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error || !data.user) {
        setMessage(
          "E-postadressen eller lösenordet är fel."
        );

        return;
      }

      if (mode === "admin") {
        const {
          data: profile,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select("role, is_active")
          .eq("id", data.user.id)
          .single();

        const allowedRoles = [
          "super_admin",
          "admin",
          "staff",
        ];

        if (
          profileError ||
          !profile ||
          !profile.is_active ||
          !allowedRoles.includes(profile.role)
        ) {
          await supabase.auth.signOut();

          setMessage(
            "Kontot har inte behörighet till Vorix Admin."
          );

          return;
        }

        window.location.assign("/dashboard");
        return;
      }

      const {
        data: membership,
        error: membershipError,
      } = await supabase
        .from("customer_portal_memberships")
        .select("id, status")
        .eq("auth_user_id", data.user.id)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      if (
        membershipError ||
        !membership
      ) {
        await supabase.auth.signOut();

        setMessage(
          "Kontot har inte aktiv tillgång till kundportalen."
        );

        return;
      }

      window.location.assign("/portal");
    } catch {
      setMessage(
        "Ett oväntat fel inträffade. Försök igen."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.brandPanel}>
        <div className={styles.brandInner}>
          <div className={styles.logoWrap}>
            <Image
              src="/images/brand/vorix-logo-vit.png"
              alt="Vorix"
              width={240}
              height={78}
              priority
              className={styles.brandLogo}
            />

            <span className={styles.logoSubtext}>
              Vorix Platform · v0.1.0 Alpha
            </span>
          </div>

          <div className={styles.brandContent}>
            <span className={styles.eyebrow}>
              VORIX PLATFORM
            </span>

            <h1>
              Digital products.
              <br />
              Built to last.
            </h1>

            <p>
              Vorix samlar hela flödet – från första
              kontakt och offert till projekt, feedback,
              filer, fakturor och slutkundens portal.
            </p>

            <ul className={styles.points}>
              <li>Kunder & kundportal</li>
              <li>Offerter & projekt</li>
              <li>Design, filer & fakturor</li>
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.formPanel}>
        <div className={styles.loginThemeToggle}>
          <ThemeToggle />
        </div>
        <div className={styles.formCard}>
          <div className={styles.topText}>
            <span className={styles.kicker}>
              Välkommen tillbaka
            </span>

            <h2>
              Logga in i Vorix
            </h2>

            <p>
              Välj om du loggar in som
              administratör eller kund.
            </p>
          </div>

          <div
            className={styles.modeSwitch}
            role="tablist"
            aria-label="Välj portal"
          >
            <button
              type="button"
              role="tab"
              aria-selected={isAdmin}
              className={`${styles.modeButton} ${
                isAdmin
                  ? styles.modeButtonActive
                  : ""
              }`}
              onClick={() => changeMode("admin")}
              disabled={isLoading}
            >
              Admin
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={!isAdmin}
              className={`${styles.modeButton} ${
                !isAdmin
                  ? styles.modeButtonActive
                  : ""
              }`}
              onClick={() => changeMode("customer")}
              disabled={isLoading}
            >
              Kund
            </button>
          </div>

          <form
            className={styles.form}
            onSubmit={handleSubmit}
          >
            <label className={styles.field}>
              <span>E-postadress</span>

              <input
                name="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                autoComplete="email"
                placeholder={
                  isAdmin
                    ? "namn@vorix.se"
                    : "namn@foretag.se"
                }
                disabled={isLoading}
                required
              />
            </label>

            <label className={styles.field}>
              <span>Lösenord</span>

              <div className={styles.passwordWrap}>
                <input
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  autoComplete="current-password"
                  placeholder="Ange ditt lösenord"
                  disabled={isLoading}
                  required
                />

                <button
                  type="button"
                  className={
                    styles.passwordToggle
                  }
                  onClick={() =>
                    setShowPassword(
                      (current) => !current
                    )
                  }
                  disabled={isLoading}
                  aria-label={
                    showPassword
                      ? "Dölj lösenord"
                      : "Visa lösenord"
                  }
                >
                  {showPassword
                    ? "Dölj"
                    : "Visa"}
                </button>
              </div>
            </label>

            <div className={styles.optionsRow}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  defaultChecked
                />

                <span>
                  Kom ihåg mig
                </span>
              </label>

              <a
                href="/glomt-losenord"
                className={styles.link}
              >
                Glömt lösenord?
              </a>
            </div>

            {message && (
              <div
                className={styles.loginError}
                role="alert"
                aria-live="polite"
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading
                ? "Loggar in..."
                : isAdmin
                  ? "Logga in som admin"
                  : "Logga in som kund"}
            </button>
          </form>

          <div className={styles.footerText}>
            <p>
              {isAdmin
                ? "För administratörer, personal och interna användare."
                : "För kunder med aktiv åtkomst till Vorix kundportal."}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}