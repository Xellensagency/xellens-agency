"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  TriangleAlert,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/client";

import styles from "./ActivateCustomerAccount.module.css";

export default function ActivateCustomerAccount() {
  const router =
    useRouter();

  const supabase =
    useMemo(
      () => createClient(),
      []
    );

  const [
    password,
    setPassword,
  ] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] =
    useState("");

  const [
    showPassword,
    setShowPassword,
  ] =
    useState(false);

  const [
    isReady,
    setIsReady,
  ] =
    useState(false);

  const [
    sessionError,
    setSessionError,
  ] =
    useState("");

  const [
    submitError,
    setSubmitError,
  ] =
    useState("");

  const [
    isPending,
    startTransition,
  ] =
    useTransition();

  useEffect(() => {
    async function prepareSession() {
      try {
        const url =
          new URL(
            window.location.href
          );

        const searchError =
          url.searchParams.get(
            "error_description"
          );

        const hash =
          new URLSearchParams(
            window.location.hash
              .replace(/^#/, "")
          );

        const hashError =
          hash.get(
            "error_description"
          );

        if (
          searchError ||
          hashError
        ) {
          setSessionError(
            searchError ||
            hashError ||
            "Aktiveringslänken är ogiltig."
          );

          return;
        }

        const code =
          url.searchParams.get(
            "code"
          );

        if (code) {
          const {
            error,
          } =
            await supabase.auth
              .exchangeCodeForSession(
                code
              );

          if (error) {
            throw error;
          }
        }
        else {
          const accessToken =
            hash.get(
              "access_token"
            );

          const refreshToken =
            hash.get(
              "refresh_token"
            );

          if (
            accessToken &&
            refreshToken
          ) {
            const {
              error,
            } =
              await supabase.auth
                .setSession({
                  access_token:
                    accessToken,

                  refresh_token:
                    refreshToken,
                });

            if (error) {
              throw error;
            }
          }
        }

        const {
          data: {
            session,
          },
          error,
        } =
          await supabase.auth
            .getSession();

        if (
          error ||
          !session
        ) {
          throw new Error(
            "Aktiveringslänken har gått ut eller har redan använts."
          );
        }

        setIsReady(true);
      }
      catch (error) {
        console.error(
          "Aktiveringssessionen kunde inte startas:",
          error
        );

        setSessionError(
          error instanceof Error
            ? error.message
            : "Aktiveringslänken kunde inte öppnas."
        );
      }
    }

    void prepareSession();
  }, [
    supabase,
  ]);

  function activateAccount(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSubmitError("");

    if (
      password.length < 8
    ) {
      setSubmitError(
        "Lösenordet måste innehålla minst 8 tecken."
      );

      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setSubmitError(
        "Lösenorden stämmer inte överens."
      );

      return;
    }

    startTransition(
      async () => {
        const {
          error,
        } =
          await supabase.auth
            .updateUser({
              password,
            });

        if (error) {
          setSubmitError(
            error.message ||
            "Lösenordet kunde inte sparas."
          );

          return;
        }

        router.replace(
          "/portal"
        );

        router.refresh();
      }
    );
  }

  return (
    <main
      className={
        styles.page
      }
    >
      <section
        className={
          styles.card
        }
      >
        <div
          className={
            styles.logo
          }
        >
          <span>X</span>

          <div>
            <strong>
              XELLENS
            </strong>

            <small>
              AGENCY
            </small>
          </div>
        </div>

        {sessionError ? (
          <div
            className={
              styles.errorState
            }
          >
            <TriangleAlert
              size={34}
            />

            <h1>
              Länken kan inte användas
            </h1>

            <p>
              {sessionError}
            </p>

            <a
              href="/logga-in"
            >
              Till kundinloggningen
            </a>
          </div>
        ) : !isReady ? (
          <div
            className={
              styles.loadingState
            }
          >
            <LoaderCircle
              size={34}
              className={
                styles.spinner
              }
            />

            <h1>
              Förbereder ditt konto
            </h1>

            <p>
              Vi kontrollerar din
              aktiveringslänk.
            </p>
          </div>
        ) : (
          <>
            <div
              className={
                styles.icon
              }
            >
              <KeyRound
                size={28}
              />
            </div>

            <span
              className={
                styles.eyebrow
              }
            >
              KUNDPORTAL
            </span>

            <h1>
              Aktivera ditt konto
            </h1>

            <p
              className={
                styles.intro
              }
            >
              Välj ett säkert lösenord.
              Därefter kommer du direkt
              in i Xellens kundportal.
            </p>

            <form
              onSubmit={
                activateAccount
              }
            >
              <label>
                <span>
                  Nytt lösenord
                </span>

                <div
                  className={
                    styles.passwordField
                  }
                >
                  <LockKeyhole
                    size={17}
                  />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      password
                    }
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    autoComplete="new-password"
                    required
                    minLength={8}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) =>
                          !current
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Dölj lösenord"
                        : "Visa lösenord"
                    }
                  >
                    {showPassword ? (
                      <EyeOff
                        size={17}
                      />
                    ) : (
                      <Eye
                        size={17}
                      />
                    )}
                  </button>
                </div>
              </label>

              <label>
                <span>
                  Bekräfta lösenord
                </span>

                <div
                  className={
                    styles.passwordField
                  }
                >
                  <LockKeyhole
                    size={17}
                  />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      confirmPassword
                    }
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    autoComplete="new-password"
                    required
                    minLength={8}
                  />
                </div>
              </label>

              {submitError && (
                <div
                  className={
                    styles.formError
                  }
                >
                  <TriangleAlert
                    size={16}
                  />

                  {submitError}
                </div>
              )}

              <button
                type="submit"
                className={
                  styles.submitButton
                }
                disabled={
                  isPending
                }
              >
                {isPending ? (
                  <LoaderCircle
                    size={18}
                    className={
                      styles.spinner
                    }
                  />
                ) : (
                  <CheckCircle2
                    size={18}
                  />
                )}

                {isPending
                  ? "Aktiverar..."
                  : "Aktivera och öppna portalen"}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
