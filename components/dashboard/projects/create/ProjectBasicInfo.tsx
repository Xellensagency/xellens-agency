import type {
  CreateProjectOptions,
  ProjectDraft,
} from "@/lib/dashboard/projects/create-project-types";
import styles from "./CreateProjectWizard.module.css";

type ProjectBasicInfoProps = {
  options: CreateProjectOptions;
  draft: ProjectDraft;
  onChange: <K extends keyof ProjectDraft>(
    field: K,
    value: ProjectDraft[K]
  ) => void;
};

export default function ProjectBasicInfo({
  options,
  draft,
  onChange,
}: ProjectBasicInfoProps) {
  const selectedCustomer =
    options.customers.find(
      (customer) =>
        customer.id === draft.customerId
    );

  const contacts =
    selectedCustomer?.contacts ?? [];

  function handleCustomerChange(
    customerId: string
  ) {
    onChange("customerId", customerId);

    const customer =
      options.customers.find(
        (item) => item.id === customerId
      );

    const primaryContact =
      customer?.contacts.find(
        (contact) => contact.is_primary
      ) ?? customer?.contacts[0];

    onChange(
      "contactId",
      primaryContact?.id ?? ""
    );
  }

  function toggleCategory(categoryId: string) {
    const selectedCategoryIds =
      draft.categoryIds ?? [];

    const nextCategoryIds =
      selectedCategoryIds.includes(categoryId)
        ? selectedCategoryIds.filter(
            (selectedId) =>
              selectedId !== categoryId
          )
        : [
            ...selectedCategoryIds,
            categoryId,
          ];

    onChange(
      "categoryIds",
      nextCategoryIds
    );
  }

  return (
    <section className={styles.formCard}>
      <header className={styles.cardHeader}>
        <span>1.</span>
        <h2>Grundinformation</h2>
      </header>

      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>
            Projektnamn <em>*</em>
          </span>

          <input
            type="text"
            value={draft.title}
            onChange={(event) =>
              onChange(
                "title",
                event.target.value
              )
            }
            placeholder="Exempel: Ny hemsida"
            maxLength={160}
          />
        </label>

        <label className={styles.field}>
          <span>
            Kund eller företag <em>*</em>
          </span>

          <select
            value={draft.customerId}
            onChange={(event) =>
              handleCustomerChange(
                event.target.value
              )
            }
          >
            <option value="">
              Välj kund
            </option>

            {options.customers.map(
              (customer) => (
                <option
                  value={customer.id}
                  key={customer.id}
                >
                  {customer.name}
                </option>
              )
            )}
          </select>

          {options.customers.length === 0 && (
            <small className={styles.helpText}>
              Det finns ännu inga kunder i
              kundregistret.
            </small>
          )}
        </label>

        <div
          className={`${styles.field} ${styles.fullWidth}`}
        >
          <span>
            Projektkategorier <em>*</em>
          </span>

          <div className={styles.categoryGrid}>
            {options.categories.map(
              (category) => (
                <button
                  type="button"
                  key={category.id}
                  className={`${styles.categoryButton} ${
                    (draft.categoryIds ?? []).includes(category.id)
                      ? styles.selectedCategory
                      : ""
                  }`}
                  onClick={() => toggleCategory(category.id)}
                >
                  {category.name}
                </button>
              )
            )}
          </div>
        </div>

        <label
          className={`${styles.field} ${styles.fullWidth}`}
        >
          <span>
            Projektbeskrivning <em>*</em>
          </span>

          <textarea
            value={draft.description}
            onChange={(event) =>
              onChange(
                "description",
                event.target.value
              )
            }
            placeholder="Beskriv projektets mål, omfattning och kundens önskemål."
            maxLength={1000}
            rows={5}
          />

          <small className={styles.counter}>
            {draft.description.length} / 1000
          </small>
        </label>

        <label className={styles.field}>
          <span>Startdatum</span>

          <input
            type="date"
            value={draft.startDate}
            onChange={(event) =>
              onChange(
                "startDate",
                event.target.value
              )
            }
          />
        </label>

        <label className={styles.field}>
          <span>Förväntat slutdatum</span>

          <input
            type="date"
            value={draft.endDate}
            min={draft.startDate || undefined}
            onChange={(event) =>
              onChange(
                "endDate",
                event.target.value
              )
            }
          />
        </label>

        <label className={styles.field}>
          <span>
            Projektbudget, exkl. moms
          </span>

          <div className={styles.moneyInput}>
            <input
              type="number"
              min="0"
              step="100"
              value={draft.budgetExVat}
              onChange={(event) =>
                onChange(
                  "budgetExVat",
                  event.target.value
                )
              }
              placeholder="0"
            />

            <span>SEK</span>
          </div>
        </label>

        <label className={styles.field}>
          <span>Prioritet</span>

          <select
            value={draft.priority}
            onChange={(event) =>
              onChange(
                "priority",
                event.target.value as ProjectDraft["priority"]
              )
            }
          >
            <option value="low">Låg</option>
            <option value="normal">
              Normal
            </option>
            <option value="high">Hög</option>
            <option value="urgent">
              Brådskande
            </option>
          </select>
        </label>

        <label className={styles.field}>
          <span>Status vid skapande</span>

          <select
            value={draft.status}
            onChange={(event) =>
              onChange(
                "status",
                event.target.value as ProjectDraft["status"]
              )
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
          </select>
        </label>

        <label className={styles.field}>
          <span>Synlighet för kunden</span>

          <select
            value={draft.customerVisibility}
            onChange={(event) =>
              onChange(
                "customerVisibility",
                event.target.value as ProjectDraft["customerVisibility"]
              )
            }
          >
            <option value="hidden">
              Dölj tills vidare
            </option>
            <option value="immediate">
              Visa omedelbart
            </option>
            <option value="after_approval">
              Visa efter godkännande
            </option>
          </select>
        </label>

        <label
          className={`${styles.field} ${styles.fullWidth}`}
        >
          <span>Kundkontakt</span>

          <select
            value={draft.contactId}
            disabled={!draft.customerId}
            onChange={(event) =>
              onChange(
                "contactId",
                event.target.value
              )
            }
          >
            <option value="">
              {draft.customerId
                ? "Välj kontaktperson"
                : "Välj kund först"}
            </option>

            {contacts.map((contact) => (
              <option
                value={contact.id}
                key={contact.id}
              >
                {contact.full_name}
                {contact.job_title
                  ? ` – ${contact.job_title}`
                  : ""}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}


