"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import styles from "./DashboardShell.module.css";

export type DashboardUser = {
  fullName: string;
  firstName: string;
  roleLabel: string;
};

type DashboardShellProps = {
  children: ReactNode;
  user: DashboardUser;
};

export default function DashboardShell({
  children,
  user,
}: DashboardShellProps) {
  const [menuOpen, setMenuOpen] =
    useState(false);

  useEffect(() => {
    function handleEscape(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow;

    if (menuOpen) {
      document.body.style.overflow =
        "hidden";
    }

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [menuOpen]);

  return (
    <div className={styles.shell}>
      <Sidebar
        user={user}
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      {menuOpen && (
        <button
          type="button"
          className={styles.overlay}
          onClick={() =>
            setMenuOpen(false)
          }
          aria-label="Stäng huvudmenyn"
        />
      )}

      <div className={styles.workspace}>
        <Topbar
          firstName={user.firstName}
          onOpenMenu={() =>
            setMenuOpen(true)
          }
        />

        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
