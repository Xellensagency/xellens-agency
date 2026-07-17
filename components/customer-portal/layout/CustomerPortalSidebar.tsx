"use client";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  Headphones,
  X,
} from "lucide-react";

import {
  usePathname,
} from "next/navigation";

import {
  customerPortalNavigation,
} from "@/lib/customer-portal/navigation";

import dashboardStyles from "../../dashboard/Sidebar.module.css";
import styles from "./CustomerPortalSidebar.module.css";

type CustomerPortalSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CustomerPortalSidebar({
  isOpen,
  onClose,
}: CustomerPortalSidebarProps) {
  const pathname = usePathname();

  function isActive(
    href: string
  ) {
    if (href === "/portal") {
      return pathname === href;
    }

    return pathname.startsWith(
      href
    );
  }

  return (
    <aside
      id="customer-portal-sidebar"
      className={`${dashboardStyles.sidebar} ${
        isOpen
          ? dashboardStyles.open
          : ""
      }`}
    >
      <div
        className={
          dashboardStyles.logoArea
        }
      >
        <Link
          href="/portal"
          aria-label="Xellens kundportal"
          onClick={onClose}
        >
          <Image
            src="/images/login/xellens-login-logo.png"
            alt="Xellens Agency"
            width={220}
            height={70}
            priority
            className={
              dashboardStyles.logo
            }
          />
        </Link>

        <button
          type="button"
          className={
            dashboardStyles.mobileClose
          }
          onClick={onClose}
          aria-label="Stäng menyn"
        >
          <X
            size={22}
            strokeWidth={1.8}
          />
        </button>
      </div>

      <nav
        className={
          dashboardStyles.navigation
        }
        aria-label="Kundportalens meny"
      >
        <div
          className={
            dashboardStyles.menuItems
          }
        >
          {customerPortalNavigation.map(
            (item) => {
              const Icon =
                item.icon;

              const active =
                isActive(
                  item.href
                );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`${dashboardStyles.menuLink} ${
                    active
                      ? dashboardStyles.active
                      : ""
                  }`}
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                >
                  <Icon
                    size={21}
                    strokeWidth={1.7}
                  />

                  <span>
                    {item.label}
                  </span>
                </Link>
              );
            }
          )}
        </div>
      </nav>

      <div className={styles.supportCard}>
        <span className={styles.supportIcon}>
          <Headphones
            size={25}
            strokeWidth={1.6}
          />
        </span>

        <strong>
          Behöver du hjälp?
        </strong>

        <p>
          Vi finns här för dig!
        </p>

        <Link
          href="/portal/support"
          onClick={onClose}
        >
          Kontakta oss

          <ArrowRight
            size={16}
            strokeWidth={1.7}
          />
        </Link>
      </div>

      <footer className={styles.footer}>
        <strong>
          Xellens Agency
        </strong>

        <span>
          © 2026 Alla rättigheter
          förbehållna
        </span>
      </footer>
    </aside>
  );
}
