"use client";

import Link from "next/link";

import {
  Activity,
  CalendarDays,
  CircleDollarSign,
  Files,
  LayoutDashboard,
  ListChecks,
  Palette,
  Users,
} from "lucide-react";

import {
  usePathname,
} from "next/navigation";

import styles from "./ProjectWorkspaceTabs.module.css";


type Props = {
  projectId: string;
};


export default function ProjectWorkspaceTabs({
  projectId,
}: Props) {
  const pathname =
    usePathname();

  const base =
    `/dashboard/projekt/${projectId}`;


  const tabs = [
    {
      label:
        "Översikt",

      href:
        base,

      icon:
        LayoutDashboard,

      exact:
        true,
    },

    {
      label:
        "Uppgifter",

      href:
        `${base}/uppgifter`,

      icon:
        ListChecks,
    },

    {
      label:
        "Tidsplan",

      href:
        `${base}/tidsplan`,

      icon:
        CalendarDays,
    },

    {
      label:
        "Team & tjänster",

      href:
        `${base}/resurser`,

      icon:
        Users,
    },

    {
      label:
        "Filer",

      href:
        `${base}/filer`,

      icon:
        Files,
    },

    {
      label:
        "Design",

      href:
        `${base}/design`,

      icon:
        Palette,
    },

    {
      label:
        "Ekonomi",

      href:
        `${base}/ekonomi`,

      icon:
        CircleDollarSign,
    },

    {
      label:
        "Aktivitet",

      href:
        `${base}/aktivitet`,

      icon:
        Activity,
    },
  ];


  return (
    <nav
      className={
        styles.wrapper
      }
      aria-label="Projektmeny"
    >
      <div
        className={
          styles.tabs
        }
      >
        {tabs.map(
          (
            tab
          ) => {
            const active =
              tab.exact
                ? pathname ===
                  tab.href
                : pathname ===
                    tab.href ||
                  pathname.startsWith(
                    `${tab.href}/`
                  );

            const Icon =
              tab.icon;


            return (
              <Link
                key={
                  tab.href
                }
                href={
                  tab.href
                }
                className={`${styles.tab} ${
                  active
                    ? styles.active
                    : ""
                }`}
              >
                <Icon
                  size={16}
                  strokeWidth={1.8}
                />

                {tab.label}
              </Link>
            );
          }
        )}
      </div>
    </nav>
  );
}