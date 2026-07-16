"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "./LoginPage.module.css";

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 6.75A1.75 1.75 0 0 1 4.75 5h14.5A1.75 1.75 0 0 1 21 6.75v10.5A1.75 1.75 0 0 1 19.25 19H4.75A1.75 1.75 0 0 1 3 17.25V6.75Z" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4.5" y="10" width="15" height="10" rx="2" />
      <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
    </svg>
  );
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.5 12s3.5-5.5 9.5-5.5S21.5 12 21.5 12s-3.5 5.5-9.5 5.5S2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.5" />
      {hidden && <path d="m4 4 16 16" />}
    </svg>
  );
}

export default function LoginForm() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState<"error" | "success" | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);
    setMessage("");
    setMessageType(null);

    try {
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error || !data.user) {
        setMessage("Fel e-postadress eller lösenord.");
        setMessageType("error");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, is_active")
        .eq("id", data.user.id)
        .single();

      if (profileError || !profile) {
        await supabase.auth.signOut();

        setMessage("Kontots behörighet kunde inte kontrolleras.");
        setMessageType("error");
        return;
      }

      const allowedRoles = [
        "super_admin",
        "admin",
        "staff",
      ];

      if (
        !profile.is_active ||
        !allowedRoles.includes(profile.role)
      ) {
        await supabase.auth.signOut();

        setMessage(
          "Du har inte behörighet till administrationsportalen."
        );
        setMessageType("error");
        return;
      }

      window.location.assign("/dashboard");
    } catch {
      setMessage(
        "Ett oväntat fel inträffade. Försök igen."
      );

      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor="email">E-postadress</label>

        <div className={styles.inputWrapper}>
          <span className={styles.inputIcon}>
            <EmailIcon />
          </span>

          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            placeholder="namn@foretag.se"
            disabled={isLoading}
            required
          />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="password">Lösenord</label>

        <div className={styles.inputWrapper}>
          <span className={styles.inputIcon}>
            <LockIcon />
          </span>

          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            autoComplete="current-password"
            placeholder="••••••••••••"
            disabled={isLoading}
            required
          />

          <button
            type="button"
            className={styles.eyeButton}
            onClick={() =>
              setShowPassword((value) => !value)
            }
            aria-label={
              showPassword
                ? "Dölj lösenord"
                : "Visa lösenord"
            }
          >
            <EyeIcon hidden={showPassword} />
          </button>
        </div>
      </div>

      <div className={styles.options}>
        <label className={styles.remember}>
          <input type="checkbox" defaultChecked />
          <span>Kom ihåg mig</span>
        </label>

        <a href="/glomt-losenord">
          Glömt lösenord?
        </a>
      </div>

      <button
        type="submit"
        className={styles.loginButton}
        disabled={isLoading}
      >
        <span>
          {isLoading ? "Loggar in..." : "Logga in"}
        </span>

        {!isLoading && (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12h14" />
            <path d="m14 7 5 5-5 5" />
          </svg>
        )}
      </button>

      {message && (
        <div
          className={`${styles.message} ${
            messageType === "success"
              ? styles.success
              : styles.error
          }`}
          role="status"
          aria-live="polite"
        >
          {message}
        </div>
      )}
    </form>
  );
}

