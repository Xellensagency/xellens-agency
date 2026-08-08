"use client";

import Link from "next/link";

import {
  AlertTriangle,
  Bell,
  CircleAlert,
  Info,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import styles from "./NotificationCenter.module.css";

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  tone:
    | "danger"
    | "warning"
    | "info"
    | "success";
};

const STORAGE_KEY =
  "vorix-seen-notifications";

export default function NotificationCenter() {
  const [
    notifications,
    setNotifications,
  ] = useState<
    NotificationItem[]
  >([]);

  const [
    open,
    setOpen,
  ] =
    useState(false);

  const [
    seen,
    setSeen,
  ] =
    useState<string[]>([]);

  const container =
    useRef<HTMLDivElement>(
      null
    );

  const load =
    useCallback(
      async () => {
        try {
          const response =
            await fetch(
              "/api/dashboard/notifications",
              {
                cache:
                  "no-store",
              }
            );

          if (
            !response.ok
          ) {
            return;
          }

          const data =
            await response.json();

          setNotifications(
            Array.isArray(
              data.notifications
            )
              ? data.notifications
              : []
          );
        } catch {
          // Behåll befintliga
          // notiser vid nätverksfel.
        }
      },
      []
    );

  useEffect(() => {
    try {
      const stored =
        JSON.parse(
          localStorage.getItem(
            STORAGE_KEY
          ) || "[]"
        );

      if (
        Array.isArray(stored)
      ) {
        setSeen(stored);
      }
    } catch {
      setSeen([]);
    }

    load();

    const timer =
      window.setInterval(
        load,
        60000
      );

    return () =>
      window.clearInterval(
        timer
      );
  }, [load]);

  useEffect(() => {
    function close(
      event: MouseEvent
    ) {
      if (
        container.current &&
        !container.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      close
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        close
      );
  }, []);

  const unread =
    notifications.filter(
      (item) =>
        !seen.includes(
          item.id
        )
    ).length;

  function toggle() {
    const next =
      !open;

    setOpen(next);

    if (next) {
      const ids =
        notifications.map(
          (item) => item.id
        );

      setSeen(ids);

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(ids)
      );
    }
  }

  return (
    <div
      className={
        styles.container
      }
      ref={container}
    >
      <button
        type="button"
        className={
          styles.button
        }
        onClick={toggle}
        aria-label="Visa notiser"
        aria-expanded={open}
      >
        <Bell
          size={20}
          strokeWidth={1.7}
        />

        {unread > 0 && (
          <span
            className={
              styles.badge
            }
          >
            {unread > 9
              ? "9+"
              : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className={
            styles.panel
          }
        >
          <header
            className={
              styles.header
            }
          >
            <div>
              <strong>
                Notiser
              </strong>

              <span>
                {notifications.length}
                {" "}
                aktuella
              </span>
            </div>

            <span
              className={
                styles.live
              }
            >
              Live
            </span>
          </header>

          <div
            className={
              styles.list
            }
          >
            {notifications.length ===
            0 ? (
              <div
                className={
                  styles.empty
                }
              >
                <Bell
                  size={24}
                />

                <strong>
                  Inga notiser
                </strong>

                <span>
                  Allt ser lugnt ut
                  just nu.
                </span>
              </div>
            ) : (
              notifications.map(
                (item) => {
                  const Icon =
                    item.tone ===
                    "danger"
                      ? AlertTriangle
                      : item.tone ===
                          "warning"
                        ? CircleAlert
                        : Info;

                  return (
                    <Link
                      href={
                        item.href
                      }
                      className={
                        styles.item
                      }
                      key={item.id}
                      onClick={() =>
                        setOpen(
                          false
                        )
                      }
                    >
                      <span
                        className={`${styles.icon} ${
                          styles[
                            item.tone
                          ]
                        }`}
                      >
                        <Icon
                          size={18}
                        />
                      </span>

                      <span
                        className={
                          styles.text
                        }
                      >
                        <strong>
                          {
                            item.title
                          }
                        </strong>

                        <small>
                          {
                            item.description
                          }
                        </small>
                      </span>
                    </Link>
                  );
                }
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}