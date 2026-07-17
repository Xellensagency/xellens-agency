"use client";

import type {
  ReactNode,
} from "react";

import {
  useEffect,
  useState,
} from "react";

import CustomerPortalSidebar from "./CustomerPortalSidebar";
import CustomerPortalTopbar from "./CustomerPortalTopbar";

import styles from "../../dashboard/DashboardShell.module.css";

type CustomerPortalShellProps = {
  children: ReactNode;
  user: {
    fullName: string;
    customerName: string;
    customerNumber: string;
  };
};

export default function CustomerPortalShell({
  children,
  user,
}: CustomerPortalShellProps) {
  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  useEffect(() => {
    function handleEscape(
      event: KeyboardEvent
    ) {
      if (
        event.key === "Escape"
      ) {
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
      <CustomerPortalSidebar
        isOpen={menuOpen}
        onClose={() =>
          setMenuOpen(false)
        }
      />

      {menuOpen && (
        <button
          type="button"
          className={styles.overlay}
          onClick={() =>
            setMenuOpen(false)
          }
          aria-label="Stäng menyn"
        />
      )}

      <div className={styles.workspace}>
        <CustomerPortalTopbar
          fullName={user.fullName}
          customerName={
            user.customerName
          }
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
