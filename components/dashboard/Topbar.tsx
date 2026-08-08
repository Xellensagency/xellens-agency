"use client";

import Link from "next/link";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  Menu,
  Plus,
  Search,
} from "lucide-react";

import ThemeToggle from "@/components/theme/ThemeToggle";
import NotificationCenter from "@/components/dashboard/NotificationCenter";
import UserAccountMenu from "@/components/dashboard/UserAccountMenu";

import styles from "./Topbar.module.css";

type TopbarProps = {
  firstName?: string;
  fullName: string;
  roleLabel: string;
  onOpenMenu: () => void;
};

function getPageInfo(
  pathname: string
) {
  if (pathname === "/dashboard") {
    return {
      title: "Dashboard",
      description:
        "Översikt av systemet i realtid.",
    };
  }

  if (
    pathname.startsWith(
      "/dashboard/projekt"
    )
  ) {
    return {
      title: "Projekt",
      description:
        "Hantera och följ upp alla projekt.",
    };
  }

  if (
    pathname.startsWith(
      "/dashboard/kunder"
    )
  ) {
    return {
      title: "Kunder",
      description:
        "Kundregister och relationer.",
    };
  }

  if (
    pathname.startsWith(
      "/dashboard/offerter"
    )
  ) {
    return {
      title: "Offerter",
      description:
        "Skapa, skicka och följ upp offerter.",
    };
  }

  if (
    pathname.startsWith(
      "/dashboard/fakturor"
    )
  ) {
    return {
      title: "Fakturor",
      description:
        "Skapa, skicka och följ upp fakturering.",
    };
  }

  if (
    pathname.startsWith(
      "/dashboard/kalender"
    )
  ) {
    return {
      title: "Kalender",
      description:
        "Aktiviteter, möten och deadlines.",
    };
  }

  if (
    pathname.startsWith(
      "/dashboard/installningar"
    )
  ) {
    return {
      title: "Inställningar",
      description:
        "Hantera Vorix och företagets inställningar.",
    };
  }

  return {
    title: "Vorix",
    description:
      "Digital products. Built to last.",
  };
}

export default function Topbar({
  fullName,
  roleLabel,
  onOpenMenu,
}: TopbarProps) {
  const pathname =
    usePathname();

  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  const pageInfo =
    getPageInfo(pathname);

  const [query, setQuery] =
    useState(
      searchParams.get(
        "search"
      ) ?? ""
    );

  useEffect(() => {
    setQuery(
      searchParams.get(
        "search"
      ) ?? ""
    );
  }, [searchParams]);

  function handleSearch(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cleanQuery =
      query.trim();

    if (!cleanQuery) {
      return;
    }

    router.push(
      `/dashboard/projekt?search=${encodeURIComponent(
        cleanQuery
      )}&page=1`
    );
  }

  return (
    <header className={styles.topbar}>
      <div
        className={
          styles.headingArea
        }
      >
        <button
          type="button"
          className={
            styles.menuButton
          }
          onClick={
            onOpenMenu
          }
          aria-label="Öppna huvudmenyn"
        >
          <Menu
            size={21}
            strokeWidth={1.8}
          />
        </button>

        <div
          className={
            styles.heading
          }
        >
          <h1>
            {pageInfo.title}
          </h1>

          <p>
            {
              pageInfo.description
            }
          </p>
        </div>
      </div>

      <div className={styles.actions}>
        <form
          className={styles.search}
          onSubmit={handleSearch}
        >
          <Search
            size={18}
            strokeWidth={1.7}
          />

          <input
            type="search"
            value={query}
            onChange={(event) =>
              setQuery(
                event.target.value
              )
            }
            placeholder="Sök i systemet..."
            aria-label="Sök i Vorix"
          />
        </form>

        <ThemeToggle />

        <NotificationCenter />

        <Link
          href="/dashboard/projekt/nytt"
          className={
            styles.newProjectButton
          }
        >
          <Plus
            size={19}
            strokeWidth={2}
          />

          <span>
            Nytt projekt
          </span>
        </Link>

        <UserAccountMenu
          fullName={fullName}
          roleLabel={roleLabel}
          variant="topbar"
        />
      </div>
    </header>
  );
}