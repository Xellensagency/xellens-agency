"use client";

import {
  Moon,
  Sun,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import styles from "./ThemeToggle.module.css";

type Theme = "dark" | "light";

const STORAGE_KEY = "vorix-theme";

export default function ThemeToggle() {
  const [theme, setTheme] =
    useState<Theme>("dark");

  const [mounted, setMounted] =
    useState(false);

  useEffect(() => {
    let nextTheme: Theme =
      "dark";

    try {
      const saved =
        localStorage.getItem(
          STORAGE_KEY
        );

      nextTheme =
        saved === "light"
          ? "light"
          : "dark";
    } catch {
      nextTheme = "dark";
    }

    document.documentElement.dataset.theme =
      nextTheme;

    setTheme(nextTheme);
    setMounted(true);
  }, []);

  function toggleTheme() {
    const nextTheme: Theme =
      theme === "dark"
        ? "light"
        : "dark";

    document.documentElement.dataset.theme =
      nextTheme;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        nextTheme
      );
    } catch {
      // Tema fungerar även om
      // localStorage inte är tillgängligt.
    }

    setTheme(nextTheme);
  }

  return (
    <button
      type="button"
      className={styles.button}
      onClick={toggleTheme}
      aria-label={
        theme === "dark"
          ? "Byt till ljust läge"
          : "Byt till mörkt läge"
      }
      title={
        theme === "dark"
          ? "Ljust läge"
          : "Mörkt läge"
      }
      disabled={!mounted}
    >
      {theme === "dark" ? (
        <Sun
          size={19}
          strokeWidth={1.8}
        />
      ) : (
        <Moon
          size={19}
          strokeWidth={1.8}
        />
      )}
    </button>
  );
}