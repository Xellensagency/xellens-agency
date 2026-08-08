"use client";

import { useEffect } from "react";

type Theme = "dark" | "light";

const STORAGE_KEY = "vorix-theme";

export default function ThemeBoot() {
  useEffect(() => {
    let theme: Theme = "dark";

    try {
      const saved =
        localStorage.getItem(STORAGE_KEY);

      theme =
        saved === "light"
          ? "light"
          : "dark";
    } catch {
      theme = "dark";
    }

    document.documentElement.dataset.theme =
      theme;
  }, []);

  return null;
}