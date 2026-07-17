"use client";

import Link from "next/link";
import {
  usePathname,
} from "next/navigation";

import styles from "./PortalLayout.module.css";

const navigation = [
  {
    href: "/portal",
    icon: "⌂",
    label: "Översikt",
  },
  {
    href: "/portal/projekt",
    icon: "▣",
    label: "Projekt",
  },
  {
    href: "/portal/design-feedback",
    icon: "◉",
    label: "Design & feedback",
  },
  {
    href: "/portal/filer",
    icon: "□",
    label: "Filer",
  },
  {
    href: "/portal/offerter",
    icon: "◇",
    label: "Offerter",
  },
  {
    href: "/portal/fakturor",
    icon: "▤",
    label: "Fakturor",
  },
  {
    href: "/portal/moten",
    icon: "◷",
    label: "Möten",
  },
  {
    href: "/portal/meddelanden",
    icon: "●",
    label: "Meddelanden",
  },
  {
    href: "/portal/support",
    icon: "?",
    label: "Support",
  },
  {
    href: "/portal/notiser",
    icon: "○",
    label: "Notiser",
  },
];

type PortalSidebarProps = {
  customerName: string;
  customerNumber: string;
};

export default function PortalSidebar({
  customerName,
  customerNumber,
}: PortalSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarLogo}>
        <div className={styles.logoMark}>
          X
        </div>

        <div>
          <strong>
            XELLENS
          </strong>

          <span>
            KUNDPORTAL
          </span>
        </div>
      </div>

      <div className={styles.customerBox}>
        <span>
          KUNDKONTO
        </span>

        <strong>
          {customerName}
        </strong>

        {customerNumber && (
          <small>
            {customerNumber}
          </small>
        )}
      </div>

      <nav className={styles.navigation}>
        {navigation.map(
          (item) => {
            const active =
              item.href === "/portal"
                ? pathname === "/portal"
                : pathname.startsWith(
                    item.href
                  );

            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? styles.activeLink
                    : styles.navigationLink
                }
              >
                <span>
                  {item.icon}
                </span>

                {item.label}
              </Link>
            );
          }
        )}
      </nav>

      <Link
        href="/portal/installningar"
        className={styles.settingsLink}
      >
        <span>⚙</span>
        Inställningar
      </Link>
    </aside>
  );
}
