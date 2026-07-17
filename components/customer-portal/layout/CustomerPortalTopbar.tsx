"use client";

import Link from "next/link";

import {
  Bell,
  ChevronDown,
  ChevronRight,
  Menu,
  MessageSquare,
} from "lucide-react";

import {
  usePathname,
} from "next/navigation";

import styles from "./CustomerPortalTopbar.module.css";

type CustomerPortalTopbarProps = {
  fullName: string;
  customerName: string;
  onOpenMenu: () => void;
};

function getInitials(
  value: string
) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (part) =>
        part.charAt(0).toUpperCase()
    )
    .join("");
}

export default function CustomerPortalTopbar({
  fullName,
  customerName,
  onOpenMenu,
}: CustomerPortalTopbarProps) {
  const pathname =
    usePathname();

  const isDesignFeedback =
    pathname.startsWith(
      "/portal/design-feedback"
    );

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <button
          type="button"
          className={styles.menuButton}
          onClick={onOpenMenu}
          aria-label="Öppna menyn"
          aria-controls="customer-portal-sidebar"
        >
          <Menu
            size={22}
            strokeWidth={1.8}
          />
        </button>

        {isDesignFeedback ? (
          <nav
            className={styles.breadcrumbs}
            aria-label="Brödsmulor"
          >
            <Link href="/portal/projekt">
              Projekt
            </Link>

            <ChevronRight size={16} />

            <Link href="/portal/projekt">
              Ny hemsida
            </Link>

            <ChevronRight size={16} />

            <span>
              Design & feedback
            </span>
          </nav>
        ) : (
          <span className={styles.title}>
            Kundportal
          </span>
        )}
      </div>

      <div className={styles.actions}>
        <Link
          href="/portal/notiser"
          className={styles.iconButton}
          aria-label="Visa notiser"
        >
          <Bell
            size={21}
            strokeWidth={1.7}
          />

          <span
            className={
              styles.notificationBadge
            }
          >
            2
          </span>
        </Link>

        <Link
          href="/portal/meddelanden"
          className={styles.iconButton}
          aria-label="Visa meddelanden"
        >
          <MessageSquare
            size={21}
            strokeWidth={1.7}
          />
        </Link>

        <Link
          href="/portal/installningar"
          className={styles.profile}
        >
          <span className={styles.avatar}>
            {getInitials(
              fullName
            ) || "K"}
          </span>

          <span className={styles.profileText}>
            <strong>
              {fullName}
            </strong>

            <small>
              {customerName}
            </small>
          </span>

          <ChevronDown
            size={17}
            strokeWidth={1.7}
          />
        </Link>
      </div>
    </header>
  );
}
