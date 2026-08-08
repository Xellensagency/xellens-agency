import Link from "next/link";

import {
  ArrowRight,
  FilePenLine,
} from "lucide-react";

import {
  createClient,
} from "@/lib/supabase/server";

import styles from "./ProjectDraftsSection.module.css";


const formatter =
  new Intl.DateTimeFormat(
    "sv-SE",
    {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      timeZone:
        "Europe/Stockholm",
    }
  );


export default async function ProjectDraftsSection() {
  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();


  if (!user) {
    return null;
  }


  const {
    data,
    error,
  } =
    await (
      supabase as any
    )
      .from(
        "project_drafts"
      )
      .select(
        `
          id,
          title,
          customer_name,
          current_step,
          updated_at
        `
      )
      .eq(
        "user_id",
        user.id
      )
      .order(
        "updated_at",
        {
          ascending: false,
        }
      )
      .limit(5);


  if (
    error ||
    !data ||
    data.length === 0
  ) {
    return null;
  }


  return (
    <section
      className={
        styles.card
      }
    >
      <header
        className={
          styles.header
        }
      >
        <div>
          <span>
            Utkast
          </span>

          <h2>
            Sparade projektutkast
          </h2>

          <p>
            Fortsätt där du slutade.
          </p>
        </div>

        <strong>
          {data.length}
        </strong>
      </header>


      <div
        className={
          styles.list
        }
      >
        {data.map(
          (draft: any) => (
            <Link
              key={
                draft.id
              }
              href={`/dashboard/projekt/nytt?draft=${draft.id}`}
              className={
                styles.item
              }
            >
              <span
                className={
                  styles.icon
                }
              >
                <FilePenLine
                  size={19}
                  strokeWidth={1.8}
                />
              </span>

              <span
                className={
                  styles.info
                }
              >
                <strong>
                  {
                    draft.title ||
                    "Nytt projekt"
                  }
                </strong>

                <small>
                  {draft.customer_name ||
                    "Ingen kund vald"}
                </small>
              </span>

              <span
                className={
                  styles.step
                }
              >
                Steg{" "}
                {
                  draft.current_step
                }{" "}
                av 5
              </span>

              <time>
                {formatter.format(
                  new Date(
                    draft.updated_at
                  )
                )}
              </time>

              <span
                className={
                  styles.continue
                }
              >
                Fortsätt

                <ArrowRight
                  size={15}
                />
              </span>
            </Link>
          )
        )}
      </div>
    </section>
  );
}