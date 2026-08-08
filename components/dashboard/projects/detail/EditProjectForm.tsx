"use client";

import {
  useActionState,
  useEffect,
  useState,
} from "react";

import {
  Banknote,
  Building2,
  CalendarDays,
  Check,
  Eye,
  Gauge,
  Save,
  UserRound,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  initialUpdateProjectState,
  updateProjectAction,
} from "@/app/dashboard/projekt/[id]/redigera/actions";

import styles from "./EditProjectForm.module.css";


type Customer = {
  id: string;
  name: string;
  customerNumber:
    string | null;
};


type TeamMember = {
  id: string;
  fullName: string;
  role: string;
};


type Project = {
  id: string;

  projectNumber:
    string;

  title: string;

  description:
    string;

  customerId:
    string;

  ownerId:
    string;

  status: string;

  priority: string;

  progress: number;

  customerVisibility:
    string;

  budgetExVat:
    number;

  startDate:
    string;

  endDate:
    string;

  deadline:
    string;
};


type Props = {
  project: Project;

  customers:
    Customer[];

  teamMembers:
    TeamMember[];
};


export default function EditProjectForm({
  project,
  customers,
  teamMembers,
}: Props) {
  const router =
    useRouter();

  const [
    progress,
    setProgress,
  ] =
    useState(
      project.progress
    );


  const [
    state,
    formAction,
    pending,
  ] =
    useActionState(
      updateProjectAction,
      initialUpdateProjectState
    );


  useEffect(() => {
    if (
      state.status !==
      "success"
    ) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          router.push(
            `/dashboard/projekt/${project.id}`
          );

          router.refresh();
        },
        650
      );

    return () =>
      window.clearTimeout(
        timer
      );
  }, [
    state.status,
    project.id,
    router,
  ]);


  return (
    <form
      action={formAction}
      className={
        styles.form
      }
    >
      <input
        type="hidden"
        name="projectId"
        value={
          project.id
        }
      />


      <section
        className={
          styles.card
        }
      >
        <header
          className={
            styles.cardHeader
          }
        >
          <Gauge
            size={22}
          />

          <div>
            <h2>
              Grundinformation
            </h2>

            <p>
              Namn, beskrivning,
              status och projektets
              framsteg.
            </p>
          </div>
        </header>


        <div
          className={
            styles.grid
          }
        >
          <label
            className={
              styles.full
            }
          >
            <span>
              Projektnamn
            </span>

            <input
              name="title"
              defaultValue={
                project.title
              }
              required
            />
          </label>


          <label
            className={
              styles.full
            }
          >
            <span>
              Projektbeskrivning
            </span>

            <textarea
              name="description"
              defaultValue={
                project.description
              }
              rows={6}
            />
          </label>


          <label>
            <span>
              Status
            </span>

            <select
              name="status"
              defaultValue={
                project.status
              }
            >
              <option value="planning">
                Planering
              </option>

              <option value="ongoing">
                Pågående
              </option>

              <option value="waiting_customer">
                Väntar på kund
              </option>

              <option value="production">
                I produktion
              </option>

              <option value="paused">
                Pausad
              </option>

              <option value="completed">
                Klar
              </option>

              <option value="cancelled">
                Avbruten
              </option>

              <option value="archived">
                Arkiverad
              </option>
            </select>
          </label>


          <label>
            <span>
              Prioritet
            </span>

            <select
              name="priority"
              defaultValue={
                project.priority
              }
            >
              <option value="low">
                Låg
              </option>

              <option value="normal">
                Normal
              </option>

              <option value="high">
                Hög
              </option>

              <option value="urgent">
                Brådskande
              </option>
            </select>
          </label>


          <div
            className={
              styles.progressField
            }
          >
            <div
              className={
                styles.progressLabel
              }
            >
              <span>
                Projektprogress
              </span>

              <strong>
                {progress}%
              </strong>
            </div>

            <input
              type="range"
              name="progress"
              min="0"
              max="100"
              step="5"
              value={
                progress
              }
              onChange={
                (
                  event
                ) =>
                  setProgress(
                    Number(
                      event.target
                        .value
                    )
                  )
              }
            />

            <div
              className={
                styles.progressTrack
              }
            >
              <span
                style={{
                  width:
                    `${progress}%`,
                }}
              />
            </div>
          </div>
        </div>
      </section>


      <section
        className={
          styles.card
        }
      >
        <header
          className={
            styles.cardHeader
          }
        >
          <Building2
            size={22}
          />

          <div>
            <h2>
              Kund & ansvar
            </h2>

            <p>
              Koppla projektet till
              rätt kund och ansvarig
              projektledare.
            </p>
          </div>
        </header>


        <div
          className={
            styles.grid
          }
        >
          <label>
            <span>
              Kund
            </span>

            <select
              name="customerId"
              defaultValue={
                project.customerId
              }
            >
              <option value="">
                Ingen kund
              </option>

              {customers.map(
                (
                  customer
                ) => (
                  <option
                    key={
                      customer.id
                    }
                    value={
                      customer.id
                    }
                  >
                    {customer.name}
                    {customer.customerNumber
                      ? ` · ${customer.customerNumber}`
                      : ""}
                  </option>
                )
              )}
            </select>
          </label>


          <label>
            <span>
              Projektägare
            </span>

            <select
              name="ownerId"
              defaultValue={
                project.ownerId
              }
            >
              <option value="">
                Ej tilldelad
              </option>

              {teamMembers.map(
                (
                  member
                ) => (
                  <option
                    key={
                      member.id
                    }
                    value={
                      member.id
                    }
                  >
                    {
                      member.fullName
                    }
                  </option>
                )
              )}
            </select>
          </label>


          <label
            className={
              styles.full
            }
          >
            <span>
              Kundsynlighet
            </span>

            <select
              name="customerVisibility"
              defaultValue={
                project.customerVisibility
              }
            >
              <option value="hidden">
                Dold för kunden
              </option>

              <option value="immediate">
                Synlig direkt
              </option>

              <option value="after_approval">
                Synlig efter godkännande
              </option>
            </select>
          </label>
        </div>
      </section>


      <section
        className={
          styles.card
        }
      >
        <header
          className={
            styles.cardHeader
          }
        >
          <CalendarDays
            size={22}
          />

          <div>
            <h2>
              Tidsplan
            </h2>

            <p>
              Projektets planerade
              datum och deadline.
            </p>
          </div>
        </header>


        <div
          className={
            styles.threeColumns
          }
        >
          <label>
            <span>
              Startdatum
            </span>

            <input
              type="date"
              name="startDate"
              defaultValue={
                project.startDate
              }
            />
          </label>

          <label>
            <span>
              Slutdatum
            </span>

            <input
              type="date"
              name="endDate"
              defaultValue={
                project.endDate
              }
            />
          </label>

          <label>
            <span>
              Deadline
            </span>

            <input
              type="date"
              name="deadline"
              defaultValue={
                project.deadline
              }
            />
          </label>
        </div>
      </section>


      <section
        className={
          styles.card
        }
      >
        <header
          className={
            styles.cardHeader
          }
        >
          <Banknote
            size={22}
          />

          <div>
            <h2>
              Ekonomi
            </h2>

            <p>
              Projektets interna
              budget exklusive moms.
            </p>
          </div>
        </header>


        <div
          className={
            styles.grid
          }
        >
          <label>
            <span>
              Budget exkl. moms
            </span>

            <div
              className={
                styles.moneyInput
              }
            >
              <input
                type="number"
                min="0"
                step="1"
                name="budgetExVat"
                defaultValue={
                  project.budgetExVat
                }
              />

              <span>
                SEK
              </span>
            </div>
          </label>
        </div>
      </section>


      {state.message && (
        <div
          className={`${styles.message} ${
            state.status ===
            "success"
              ? styles.success
              : styles.error
          }`}
        >
          {state.status ===
            "success" ? (
            <Check
              size={18}
            />
          ) : null}

          {state.message}
        </div>
      )}


      <div
        className={
          styles.actions
        }
      >
        <button
          type="button"
          className={
            styles.cancel
          }
          onClick={() =>
            router.push(
              `/dashboard/projekt/${project.id}`
            )
          }
        >
          Avbryt
        </button>

        <button
          type="submit"
          className={
            styles.save
          }
          disabled={
            pending
          }
        >
          <Save
            size={18}
          />

          {pending
            ? "Sparar..."
            : "Spara ändringar"}
        </button>
      </div>
    </form>
  );
}