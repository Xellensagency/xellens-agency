"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronUp,
  Settings,
  X,
} from "lucide-react";
import { dashboardNavigation } from "@/lib/dashboard/navigation";
import type { DashboardUser } from "./DashboardShell";
import styles from "./Sidebar.module.css";

type SidebarProps = {
  user: DashboardUser;
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({
  user,
  isOpen,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") {
      return pathname === href;
    }

    return pathname.startsWith(href);
  }

  const settingsActive = pathname.startsWith(
    "/dashboard/installningar"
  );

  return (
    <aside
      id="dashboard-sidebar"
      className={`${styles.sidebar} ${
        isOpen ? styles.open : ""
      }`}
    >
      <div className={styles.logoArea}>
        <Link
          href="/dashboard"
          aria-label="Xellens Agency dashboard"
          onClick={onClose}
        >
          <Image
            src="/images/login/xellens-login-logo.png"
            alt="Xellens Agency"
            width={220}
            height={70}
            priority
            className={styles.logo}
          />
        </Link>

        <button
          type="button"
          className={styles.mobileClose}
          onClick={onClose}
          aria-label="Stäng menyn"
        >
          <X size={22} strokeWidth={1.8} />
        </button>
      </div>

      <nav
        className={styles.navigation}
        aria-label="Huvudmeny"
      >
        <div className={styles.menuItems}>
          {dashboardNavigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`${styles.menuLink} ${
                  active ? styles.active : ""
                }`}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={21} strokeWidth={1.7} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <Link
          href="/dashboard/installningar"
          onClick={onClose}
          className={`${styles.menuLink} ${styles.settingsLink} ${
            settingsActive ? styles.active : ""
          }`}
          aria-current={settingsActive ? "page" : undefined}
        >
          <Settings size={21} strokeWidth={1.7} />
          <span>Inställningar</span>
        </Link>
      </nav>

      <button type="button" className={styles.profile}>
        <span className={styles.avatar}>
          {user.fullName
            .split(/\s+/)
            .slice(0, 2)
            .map((name) => name[0])
            .join("")
            .toUpperCase()}
        </span>

        <span className={styles.profileText}>
          <strong>{user.fullName}</strong>
          <small>{user.roleLabel}</small>
        </span>

        <ChevronUp
          className={styles.profileChevron}
          size={16}
          strokeWidth={1.8}
        />
      </button>
    </aside>
  );
}

