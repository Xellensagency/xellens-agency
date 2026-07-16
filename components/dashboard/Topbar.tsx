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
  Bell,
  Menu,
  Plus,
  Search,
  Users,
} from "lucide-react";

import styles from "./Topbar.module.css";

type TopbarProps = {
  firstName?: string;
  onOpenMenu: () => void;
};

type Greeting = {
  text: string;
  emoji: string;
};

function getGreeting(): Greeting {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 11) {
    return {
      text: "God morgon",
      emoji: "☀️",
    };
  }

  if (hour >= 11 && hour < 17) {
    return {
      text: "God eftermiddag",
      emoji: "🌤️",
    };
  }

  if (hour >= 17 && hour < 23) {
    return {
      text: "God kväll",
      emoji: "🌙",
    };
  }

  return {
    text: "God natt",
    emoji: "✨",
  };
}

export default function Topbar({
  firstName = "Andreas",
  onOpenMenu,
}: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isCreateProjectPage =
    pathname === "/dashboard/projekt/nytt";

  const isProjectsPage =
    pathname.startsWith(
      "/dashboard/projekt"
    );

  const isCreateCustomerPage =
    pathname === "/dashboard/kunder/ny";

  const isCustomersPage =
    pathname.startsWith(
      "/dashboard/kunder"
    );

  const isCreateOfferPage =
    pathname === "/dashboard/offerter/ny";

  const isOffersPage =
    pathname.startsWith(
      "/dashboard/offerter"
    );

  const [query, setQuery] = useState(
    searchParams.get("search") ?? ""
  );

  const [greeting, setGreeting] =
    useState<Greeting>({
      text: "Hej",
      emoji: "👋",
    });

  useEffect(() => {
    function updateGreeting() {
      setGreeting(getGreeting());
    }

    updateGreeting();

    const interval = window.setInterval(
      updateGreeting,
      60_000
    );

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    setQuery(
      searchParams.get("search") ?? ""
    );
  }, [searchParams]);

  function handleSearch(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const targetPath =
      isOffersPage
        ? "/dashboard/offerter"
        : isCustomersPage
          ? "/dashboard/kunder"
          : "/dashboard/projekt";

    const keepCurrentParameters =
      isOffersPage ||
      isCustomersPage ||
      isProjectsPage;

    const parameters =
      new URLSearchParams(
        keepCurrentParameters
          ? searchParams.toString()
          : ""
      );

    const cleanQuery = query.trim();

    if (cleanQuery) {
      parameters.set(
        "search",
        cleanQuery
      );
    } else {
      parameters.delete("search");
    }

    parameters.set("page", "1");

    const queryString =
      parameters.toString();

    router.push(
      `${targetPath}${
        queryString
          ? `?${queryString}`
          : ""
      }`
    );
  }

  const searchPlaceholder =
    isOffersPage
      ? "Sök offert, kund eller projekt..."
      : isCustomersPage
        ? "Sök kunder..."
        : isProjectsPage
          ? "Sök projekt..."
          : "Sök projekt eller kund...";

  const searchLabel =
    isOffersPage
      ? "Sök offerter"
      : isCustomersPage
        ? "Sök kunder"
        : "Sök projekt";

  const actionHref =
    isCreateCustomerPage
      ? "/dashboard/kunder"
      : isCustomersPage
        ? "/dashboard/kunder/ny"
        : "/dashboard/projekt/nytt";

  const actionLabel =
    isCreateCustomerPage
      ? "Kundlista"
      : isCustomersPage
        ? "Ny kund"
        : "Nytt projekt";

  const ActionIcon =
    isCreateCustomerPage
      ? Users
      : Plus;

  return (
    <header className={styles.topbar}>
      <button
        type="button"
        className={styles.menuButton}
        onClick={onOpenMenu}
        aria-label="Öppna huvudmenyn"
        aria-controls="dashboard-sidebar"
      >
        <Menu
          size={23}
          strokeWidth={1.8}
        />
      </button>

      <div className={styles.greeting}>
        {isCreateProjectPage ? (
          <>
            <h1>Skapa nytt projekt</h1>

            <p>
              Lägg grunden, välj tjänster och
              planera projektet.
            </p>
          </>
        ) : isCreateCustomerPage ? (
          <>
            <h1>Skapa ny kund</h1>

            <p>
              Lägg till företag eller
              privatperson i kundregistret.
            </p>
          </>
        ) : isCreateOfferPage ? (
          <>
            <h1>Skapa ny offert</h1>

            <p>
              Välj kund, tjänster och villkor
              innan offerten skickas.
            </p>
          </>
        ) : isOffersPage ? (
          <>
            <h1>Offertöversikt</h1>

            <p>
              Skapa, skicka och följ upp
              företagets offerter.
            </p>
          </>
        ) : isCustomersPage ? (
          <>
            <h1>Kunder – CRM</h1>

            <p>
              Hantera kundrelationer,
              kontaktuppgifter och status.
            </p>
          </>
        ) : isProjectsPage ? (
          <>
            <h1>Projekt – Lista</h1>

            <p>
              Hantera och följ upp alla dina
              projekt på ett ställe.
            </p>
          </>
        ) : (
          <>
            <h1>
              {greeting.text} {firstName}{" "}
              <span aria-hidden="true">
                {greeting.emoji}
              </span>
            </h1>

            <p>
              Här är en översikt av din
              verksamhet.
            </p>
          </>
        )}
      </div>

      <div className={styles.actions}>
        <form
          className={styles.search}
          onSubmit={handleSearch}
        >
          <Search
            size={20}
            strokeWidth={1.7}
            aria-hidden="true"
          />

          <input
            type="search"
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder={
              searchPlaceholder
            }
            aria-label={searchLabel}
          />
        </form>

        <button
          type="button"
          className={
            styles.notificationButton
          }
          aria-label="Visa notiser"
        >
          <Bell
            size={23}
            strokeWidth={1.7}
          />

          <span
            className={
              styles.notificationDot
            }
          />
        </button>

        {!isCustomersPage &&
          !isOffersPage && (
            <Link
              href={actionHref}
              className={
                styles.newProjectButton
              }
            >
              <ActionIcon
                size={20}
                strokeWidth={1.8}
              />

              <span>{actionLabel}</span>
            </Link>
          )}
      </div>
    </header>
  );
}
