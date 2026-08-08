"use client";

import Link from "next/link";

import {
  ChevronDown,
  ChevronUp,
  LogOut,
  Moon,
  Settings,
  Sun,
  UserRound,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/client";

import styles from "./UserAccountMenu.module.css";

type UserAccountMenuProps = {
  fullName: string;
  roleLabel: string;
  variant: "topbar" | "sidebar";
  onNavigate?: () => void;
};

type Theme = "dark" | "light";

function getInitials(
  fullName: string
) {
  const initials = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  return initials || "V";
}

export default function UserAccountMenu({
  fullName,
  roleLabel,
  variant,
  onNavigate,
}: UserAccountMenuProps) {
  const router = useRouter();

  const containerRef =
    useRef<HTMLDivElement>(null);

  const [open, setOpen] =
    useState(false);

  const [theme, setTheme] =
    useState<Theme>("dark");

  const [loggingOut, setLoggingOut] =
    useState(false);

  const initials =
    getInitials(fullName);

  useEffect(() => {
    const currentTheme =
      document.documentElement.dataset.theme;

    setTheme(
      currentTheme === "light"
        ? "light"
        : "dark"
    );
  }, []);

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent
    ) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    function handleEscape(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  function closeMenu() {
    setOpen(false);
    onNavigate?.();
  }

  function toggleTheme() {
    const nextTheme: Theme =
      theme === "dark"
        ? "light"
        : "dark";

    document.documentElement.dataset.theme =
      nextTheme;

    localStorage.setItem(
      "vorix-theme",
      nextTheme
    );

    setTheme(nextTheme);
  }

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      const supabase =
        createClient();

      await supabase.auth.signOut();

      router.replace("/logga-in");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${
        variant === "sidebar"
          ? styles.sidebarContainer
          : styles.topbarContainer
      }`}
    >
      <button
        type="button"
        className={`${styles.trigger} ${
          variant === "sidebar"
            ? styles.sidebarTrigger
            : styles.topbarTrigger
        }`}
        onClick={() =>
          setOpen((current) => !current)
        }
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className={styles.avatar}>
          {initials}
        </span>

        {variant === "topbar" && (
          <span className={styles.topbarName}>
            {fullName}
          </span>
        )}

        {variant === "sidebar" && (
          <span
            className={styles.userText}
          >
            <strong>
              {fullName}
            </strong>

            <small>
              {roleLabel}
            </small>
          </span>
        )}

        {variant === "sidebar" ? (
          <ChevronUp
            size={16}
            strokeWidth={1.8}
            className={styles.chevron}
          />
        ) : (
          <ChevronDown
            size={15}
            strokeWidth={1.8}
            className={styles.chevron}
          />
        )}
      </button>

      {open && (
        <div
          className={`${styles.dropdown} ${
            variant === "sidebar"
              ? styles.sidebarDropdown
              : styles.topbarDropdown
          }`}
          role="menu"
        >
          <div
            className={
              styles.accountHeader
            }
          >
            <span
              className={
                styles.largeAvatar
              }
            >
              {initials}
            </span>

            <div>
              <strong>
                {fullName}
              </strong>

              <span>
                {roleLabel}
              </span>
            </div>
          </div>

          <div
            className={styles.divider}
          />

          <div
            className={styles.menuItems}
          >
            <Link
              href="/dashboard/installningar"
              className={styles.menuItem}
              onClick={closeMenu}
            >
              <UserRound
                size={18}
                strokeWidth={1.8}
              />

              <span>
                Profil & konto
              </span>
            </Link>

            <Link
              href="/dashboard/installningar"
              className={styles.menuItem}
              onClick={closeMenu}
            >
              <Settings
                size={18}
                strokeWidth={1.8}
              />

              <span>
                Inställningar
              </span>
            </Link>

            <button
              type="button"
              className={styles.menuItem}
              onClick={toggleTheme}
            >
              {theme === "dark" ? (
                <Sun
                  size={18}
                  strokeWidth={1.8}
                />
              ) : (
                <Moon
                  size={18}
                  strokeWidth={1.8}
                />
              )}

              <span>
                {theme === "dark"
                  ? "Byt till ljust läge"
                  : "Byt till mörkt läge"}
              </span>
            </button>
          </div>

          <div
            className={styles.divider}
          />

          <button
            type="button"
            className={styles.logout}
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <LogOut
              size={18}
              strokeWidth={1.8}
            />

            <span>
              {loggingOut
                ? "Loggar ut..."
                : "Logga ut"}
            </span>
          </button>

          <div className={styles.version}>
            Vorix Platform · v0.2.0 Alpha
          </div>
        </div>
      )}
    </div>
  );
}