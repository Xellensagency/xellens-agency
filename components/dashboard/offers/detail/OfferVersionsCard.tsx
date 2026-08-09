import Link from "next/link";

import {
  Clock3,
  ExternalLink,
  History,
} from "lucide-react";

import {
  createClient,
} from "@/lib/supabase/server";

import styles from "./OfferVersionsCard.module.css";


type OfferVersionsCardProps = {
  offerId: string;
};


type VersionRow = {
  id: string;
  version_number: number;
  status: string | null;
  recipient_email: string | null;
  sent_at: string | null;
  created_at: string | null;
};


function formatDateTime(
  value: string | null
) {
  if (!value) {
    return "Datum saknas";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "sv-SE",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}


export default async function OfferVersionsCard({
  offerId,
}: OfferVersionsCardProps) {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await (
    supabase as any
  )
    .from("offer_versions")
    .select(
      "id, version_number, status, recipient_email, sent_at, created_at"
    )
    .eq(
      "offer_id",
      offerId
    )
    .order(
      "version_number",
      {
        ascending: false,
      }
    );


  if (error) {
    console.error(
      "Kunde inte hämta offertversioner:",
      error
    );

    return (
      <section
        className={
          styles.card
        }
      >
        <header>
          <History
            size={18}
          />

          <div>
            <small>
              VERSIONER
            </small>

            <h3>
              Versionshistorik
            </h3>
          </div>
        </header>

        <div
          className={
            styles.empty
          }
        >
          Versionshistoriken
          kunde inte hämtas.
        </div>
      </section>
    );
  }


  const versions =
    (
      Array.isArray(data)
        ? data
        : []
    ) as VersionRow[];


  const latestVersion =
    versions[0]
      ?.version_number ??
    null;


  return (
    <section
      className={
        styles.card
      }
    >
      <header>
        <History
          size={18}
        />

        <div>
          <small>
            VERSIONER
          </small>

          <h3>
            Versionshistorik
          </h3>
        </div>

        {versions.length >
          0 && (
          <span
            className={
              styles.count
            }
          >
            {versions.length}
          </span>
        )}
      </header>


      {versions.length ===
      0 ? (
        <div
          className={
            styles.emptyState
          }
        >
          <Clock3
            size={20}
          />

          <strong>
            Ingen skickad
            version ännu
          </strong>

          <p>
            Version 1 skapas
            automatiskt när
            offerten skickas
            till kunden.
          </p>
        </div>
      ) : (
        <div
          className={
            styles.list
          }
        >
          {versions.map(
            (
              version
            ) => (
              <Link
                key={
                  version.id
                }
                href={`/dashboard/offerter/${offerId}/versioner/${version.version_number}`}
                className={
                  styles.version
                }
              >
                <div
                  className={
                    styles.versionTop
                  }
                >
                  <div>
                    <strong>
                      Version{" "}
                      {
                        version.version_number
                      }
                    </strong>

                    {version.version_number ===
                      latestVersion && (
                      <span
                        className={
                          styles.latest
                        }
                      >
                        SENASTE
                      </span>
                    )}
                  </div>

                  <ExternalLink
                    size={14}
                  />
                </div>

                <p>
                  Skickad{" "}
                  {formatDateTime(
                    version.sent_at ||
                      version.created_at
                  )}
                </p>

                {version.recipient_email && (
                  <small>
                    {
                      version.recipient_email
                    }
                  </small>
                )}
              </Link>
            )
          )}
        </div>
      )}
    </section>
  );
}