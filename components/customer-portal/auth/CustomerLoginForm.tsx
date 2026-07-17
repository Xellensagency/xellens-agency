"use client";

import {
  useActionState,
} from "react";

import {
  loginCustomer,
  type CustomerLoginState,
} from "@/app/logga-in/actions";

import styles from "./CustomerLoginForm.module.css";

const initialState:
CustomerLoginState = {
  error: null,
};

export default function CustomerLoginForm() {
  const [
    state,
    formAction,
    pending,
  ] = useActionState(
    loginCustomer,
    initialState
  );

  return (
    <form
      action={formAction}
      className={styles.form}
    >
      <div className={styles.field}>
        <label htmlFor="email">
          E-postadress
        </label>

        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="namn@foretag.se"
          required
        />
      </div>

      <div className={styles.field}>
        <div className={styles.labelRow}>
          <label htmlFor="password">
            Lösenord
          </label>

          <span>
            Glömt lösenord?
          </span>
        </div>

        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Ditt lösenord"
          required
        />
      </div>

      {state.error && (
        <div
          className={styles.error}
          role="alert"
        >
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
      >
        {pending
          ? "Loggar in..."
          : "Logga in i kundportalen"}
      </button>

      <p className={styles.help}>
        Saknar du åtkomst? Kontakta{" "}
        <a href="mailto:support@xellensagency.com">
          support@xellensagency.com
        </a>
      </p>
    </form>
  );
}
