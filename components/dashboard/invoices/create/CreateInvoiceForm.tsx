"use client";

import Link from "next/link";

import {
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  FileText,
  Plus,
  ReceiptText,
  RotateCw,
  Save,
  Trash2,
  TriangleAlert,
  UserRound,
} from "lucide-react";

import {
  createInvoiceAction,
} from "@/app/dashboard/fakturor/actions";

import type {
  InvoiceCreateOptions,
  InvoiceDraftItem,
} from "@/lib/dashboard/invoices/create-invoice-types";

import styles from "./CreateInvoiceForm.module.css";

type CreateInvoiceFormProps = {
  options: InvoiceCreateOptions;

  defaults: {
    paymentTermsDays: number;
    vatRate: number;
  };
};

type Feedback = {
  type: "error" | "success";
  message: string;
};

function dateInputValue(
  date: Date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(
  value: string,
  days: number
) {
  const date =
    new Date(
      `${value}T12:00:00`
    );

  date.setDate(
    date.getDate() + days
  );

  return dateInputValue(date);
}

function nextMonthDate() {
  const date =
    new Date();

  date.setMonth(
    date.getMonth() + 1
  );

  if (
    date.getDate() > 28
  ) {
    date.setDate(28);
  }

  return dateInputValue(date);
}

function money(
  value: number
) {
  return new Intl.NumberFormat(
    "sv-SE",
    {
      style: "currency",
      currency: "SEK",
      maximumFractionDigits: 2,
    }
  ).format(value);
}

function lineSubtotal(
  item: InvoiceDraftItem
) {
  return (
    item.quantity *
    item.unitPriceExVat *
    (
      1 -
      item.discountPercent / 100
    )
  );
}

export default function CreateInvoiceForm({
  options,
  defaults,
}: CreateInvoiceFormProps) {
  const defaultPaymentTermsDays =
    Math.max(
      0,
      Math.round(
        Number(
          defaults.paymentTermsDays
        ) || 0
      )
    );

  const defaultVatRate =
    Math.min(
      100,
      Math.max(
        0,
        Number(
          defaults.vatRate
        ) || 0
      )
    );
  const router =
    useRouter();

  const [
    isSaving,
    startSaving,
  ] = useTransition();

  const [
    step,
    setStep,
  ] = useState(1);

  const [
    feedback,
    setFeedback,
  ] = useState<Feedback | null>(
    null
  );

  const today =
    dateInputValue(
      new Date()
    );

  const [
    customerId,
    setCustomerId,
  ] = useState("");

  const [
    projectId,
    setProjectId,
  ] = useState("");

  const [
    title,
    setTitle,
  ] = useState("Tjänster enligt överenskommelse");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    invoiceDate,
    setInvoiceDate,
  ] = useState(today);

  const [
    paymentTermsDays,
    setPaymentTermsDays,
  ] = useState(
    defaultPaymentTermsDays
  );

  const [
    dueDate,
    setDueDate,
  ] = useState(
    addDays(
      today,
      defaultPaymentTermsDays
    )
  );

  const [
    referenceNumber,
    setReferenceNumber,
  ] = useState("");

  const [
    poNumber,
    setPoNumber,
  ] = useState("");

  const [
    deliveryEmail,
    setDeliveryEmail,
  ] = useState("");

  const [
    notes,
    setNotes,
  ] = useState("");

  const [
    recurringEnabled,
    setRecurringEnabled,
  ] = useState(false);

  const [
    recurringStartDate,
    setRecurringStartDate,
  ] = useState(
    nextMonthDate()
  );

  const [
    recurringInvoiceDay,
    setRecurringInvoiceDay,
  ] = useState(
    Math.min(
      new Date().getDate(),
      28
    )
  );

  const [
    recurringAutoSend,
    setRecurringAutoSend,
  ] = useState(false);

  const [
    catalogServiceId,
    setCatalogServiceId,
  ] = useState("");
  const [
    catalogPackageId,
    setCatalogPackageId,
  ] = useState("");

  const [
    items,
    setItems,
  ] = useState<
    InvoiceDraftItem[]
  >([]);

  const selectedCustomer =
    options.customers.find(
      (customer) =>
        customer.id ===
        customerId
    );

  const filteredProjects =
    useMemo(
      () =>
        customerId
          ? options.projects.filter(
              (project) =>
                project.customerId ===
                customerId
            )
          : options.projects,
      [
        customerId,
        options.projects,
      ]
    );

  const subtotal =
    items.reduce(
      (total, item) =>
        total +
        lineSubtotal(item),
      0
    );

  const vatAmount =
    items.reduce(
      (total, item) =>
        total +
        lineSubtotal(item) *
          item.vatRate /
          100,
      0
    );

  const total =
    subtotal + vatAmount;

  function changeCustomer(
    value: string
  ) {
    setCustomerId(value);
    setProjectId("");
    setFeedback(null);

    const customer =
      options.customers.find(
        (item) =>
          item.id === value
      );

    setDeliveryEmail(
      customer?.billingEmail ||
      customer?.email ||
      ""
    );
  }

  function changeInvoiceDate(
    value: string
  ) {
    setInvoiceDate(value);

    if (value) {
      setDueDate(
        addDays(
          value,
          paymentTermsDays
        )
      );
    }
  }

  function changePaymentTerms(
    value: number
  ) {
    const days =
      Math.max(value, 0);

    setPaymentTermsDays(days);

    if (invoiceDate) {
      setDueDate(
        addDays(
          invoiceDate,
          days
        )
      );
    }
  }

  function addCatalogService() {
    const service =
      options.services.find(
        (item) =>
          item.id ===
          catalogServiceId
      );

    if (!service) {
      return;
    }

    setItems(
      (current) => [
        ...current,
        {
          clientId:
            crypto.randomUUID(),

          serviceId:
            service.id,

          description:
            service.name,

          quantity: 1,

          unitCode:
            service.unitCode,

          unitPriceExVat:
            service.unitPriceExVat,

          discountPercent: 0,

          vatRate:
            service.vatRate,
        },
      ]
    );

    setCatalogServiceId("");
  }

  function roundMoney(
    value: number
  ) {
    return Math.round(
      value * 100
    ) / 100;
  }

  function addCatalogPackage() {
    const selectedPackage =
      options.packages.find(
        (item) =>
          item.id ===
          catalogPackageId
      );

    if (!selectedPackage) {
      return;
    }

    const packageItems =
      selectedPackage.items.filter(
        (item) =>
          !item.isOptional
      );

    if (
      packageItems.length === 0
    ) {
      setFeedback({
        type: "error",
        message:
          "Paketet saknar obligatoriska tjänster.",
      });

      return;
    }

    const packageDiscount =
      Math.min(
        Math.max(
          selectedPackage
            .defaultDiscountPercent,
          0
        ),
        100
      );

    let newItems:
      InvoiceDraftItem[];

    if (
      selectedPackage.priceMode ===
        "fixed" &&
      selectedPackage.fixedPriceExVat >
        0
    ) {
      const targetTotal =
        selectedPackage
          .fixedPriceExVat *
        (
          1 -
          packageDiscount / 100
        );

      const itemTotals =
        packageItems.map(
          (item) =>
            item.quantity *
            item.unitPriceExVat *
            (
              1 -
              item.discountPercent /
                100
            )
        );

      const originalTotal =
        itemTotals.reduce(
          (total, value) =>
            total + value,
          0
        );

      let allocatedTotal = 0;

      newItems =
        packageItems.map(
          (item, index) => {
            let lineTotal = 0;

            if (originalTotal > 0) {
              if (
                index ===
                packageItems.length -
                  1
              ) {
                lineTotal =
                  targetTotal -
                  allocatedTotal;
              }
              else {
                lineTotal =
                  roundMoney(
                    targetTotal *
                    (
                      itemTotals[index] /
                      originalTotal
                    )
                  );

                allocatedTotal +=
                  lineTotal;
              }
            }
            else if (index === 0) {
              lineTotal =
                targetTotal;
            }

            return {
              clientId:
                crypto.randomUUID(),

              serviceId:
                item.serviceId,

              description:
                `${selectedPackage.name} – ${item.serviceName}`,

              quantity:
                item.quantity,

              unitCode:
                item.unitCode,

              unitPriceExVat:
                item.quantity > 0
                  ? roundMoney(
                      lineTotal /
                        item.quantity
                    )
                  : 0,

              discountPercent: 0,

              vatRate:
                item.vatRate,
            };
          }
        );
    }
    else {
      newItems =
        packageItems.map(
          (item) => {
            const itemDiscount =
              Math.min(
                Math.max(
                  item.discountPercent,
                  0
                ),
                100
              );

            const combinedDiscount =
              100 *
              (
                1 -
                (
                  1 -
                  itemDiscount / 100
                ) *
                (
                  1 -
                  packageDiscount / 100
                )
              );

            return {
              clientId:
                crypto.randomUUID(),

              serviceId:
                item.serviceId,

              description:
                `${selectedPackage.name} – ${item.serviceName}`,

              quantity:
                item.quantity,

              unitCode:
                item.unitCode,

              unitPriceExVat:
                item.unitPriceExVat,

              discountPercent:
                roundMoney(
                  combinedDiscount
                ),

              vatRate:
                item.vatRate,
            };
          }
        );
    }

    setItems(
      (current) => [
        ...current,
        ...newItems,
      ]
    );

    setCatalogPackageId("");

    setFeedback({
      type: "success",
      message:
        `${selectedPackage.name} lades till med ${newItems.length} fakturarader.`,
    });
  }
  function addCustomItem() {
    setItems(
      (current) => [
        ...current,
        {
          clientId:
            crypto.randomUUID(),

          serviceId: null,

          description:
            "Ny fakturarad",

          quantity: 1,

          unitCode:
            options.units[0]
              ?.code || "st",

          unitPriceExVat: 0,

          discountPercent: 0,

          vatRate: defaultVatRate,
        },
      ]
    );
  }

  function updateItem(
    clientId: string,
    patch:
      Partial<InvoiceDraftItem>
  ) {
    setItems(
      (current) =>
        current.map(
          (item) =>
            item.clientId ===
            clientId
              ? {
                  ...item,
                  ...patch,
                }
              : item
        )
    );

    setFeedback(null);
  }

  function removeItem(
    clientId: string
  ) {
    setItems(
      (current) =>
        current.filter(
          (item) =>
            item.clientId !==
            clientId
        )
    );
  }

  function validateStep() {
    if (step === 1) {
      if (!customerId) {
        setFeedback({
          type: "error",
          message:
            "Välj en kund innan du fortsätter.",
        });

        return false;
      }

      if (!title.trim()) {
        setFeedback({
          type: "error",
          message:
            "Ange en titel för fakturan.",
        });

        return false;
      }
    }

    if (
      step === 2 &&
      items.length === 0
    ) {
      setFeedback({
        type: "error",
        message:
          "Lägg till minst en fakturarad.",
      });

      return false;
    }

    setFeedback(null);

    return true;
  }

  function nextStep() {
    if (!validateStep()) {
      return;
    }

    setStep(
      (current) =>
        Math.min(
          current + 1,
          3
        )
    );
  }

  function saveInvoice() {
    if (!customerId) {
      setFeedback({
        type: "error",
        message:
          "Välj en kund.",
      });

      return;
    }

    if (items.length === 0) {
      setFeedback({
        type: "error",
        message:
          "Lägg till minst en fakturarad.",
      });

      return;
    }

    startSaving(() => {
      void (async () => {
        const result =
          await createInvoiceAction({
            customerId,

            projectId:
              projectId || null,

            title,

            description,

            invoiceDate,

            dueDate,

            paymentTermsDays,

            referenceNumber,

            poNumber,

            deliveryEmail,

            notes,

            recurringEnabled,

            recurringStartDate,

            recurringInvoiceDay,

            recurringAutoSend,

            items:
              items.map(
                (item) => ({
                  serviceId:
                    item.serviceId,

                  description:
                    item.description,

                  quantity:
                    item.quantity,

                  unitCode:
                    item.unitCode,

                  unitPriceExVat:
                    item.unitPriceExVat,

                  discountPercent:
                    item.discountPercent,

                  vatRate:
                    item.vatRate,
                })
              ),
          });

        if (!result.ok) {
          setFeedback({
            type: "error",

            message:
              result.error ||
              "Fakturan kunde inte skapas.",
          });

          return;
        }

        router.push(
          "/dashboard/fakturor"
        );

        router.refresh();
      })();
    });
  }

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <Link
          href="/dashboard/fakturor"
          className={styles.backButton}
        >
          <ArrowLeft size={17} />
          Till fakturor
        </Link>

        <div className={styles.actions}>
          {step > 1 && (
            <button
              type="button"
              className={
                styles.secondaryButton
              }
              onClick={() =>
                setStep(
                  (current) =>
                    current - 1
                )
              }
            >
              <ChevronLeft
                size={17}
              />
              Föregående
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              className={
                styles.primaryButton
              }
              onClick={nextStep}
            >
              Nästa steg
              <ChevronRight
                size={17}
              />
            </button>
          ) : (
            <button
              type="button"
              className={
                styles.primaryButton
              }
              disabled={isSaving}
              onClick={saveInvoice}
            >
              <Save size={17} />

              {isSaving
                ? "Sparar..."
                : "Skapa utkast"}
            </button>
          )}
        </div>
      </header>

      {feedback && (
        <div
          className={[
            styles.feedback,
            feedback.type ===
            "success"
              ? styles.success
              : styles.error,
          ].join(" ")}
        >
          {feedback.type ===
          "success" ? (
            <BadgeCheck size={18} />
          ) : (
            <TriangleAlert
              size={18}
            />
          )}

          {feedback.message}
        </div>
      )}

      <section className={styles.hero}>
        <span>
          <ReceiptText size={23} />
        </span>

        <div>
          <small>Fakturor</small>
          <h1>Skapa ny faktura</h1>

          <p>
            Skapa en engångsfaktura eller
            planera återkommande
            månadsfakturering.
          </p>
        </div>
      </section>

      <nav className={styles.steps}>
        {[
          [
            1,
            "Kund & uppgifter",
          ],
          [
            2,
            "Fakturarader",
          ],
          [
            3,
            "Granska & skapa",
          ],
        ].map(
          ([number, label]) => (
            <button
              key={number}
              type="button"
              className={
                step === number
                  ? styles.activeStep
                  : step >
                      Number(number)
                    ? styles.completedStep
                    : ""
              }
              onClick={() => {
                if (
                  Number(number) <
                  step
                ) {
                  setStep(
                    Number(number)
                  );
                }
              }}
            >
              <span>
                {step >
                Number(number) ? (
                  <BadgeCheck
                    size={15}
                  />
                ) : (
                  number
                )}
              </span>

              {label}
            </button>
          )
        )}
      </nav>

      <div className={styles.layout}>
        <main className={styles.mainColumn}>
          {step === 1 && (
            <>
              <section className={styles.card}>
                <header>
                  <UserRound size={19} />

                  <div>
                    <h2>Kund och projekt</h2>

                    <p>
                      Välj vem som ska
                      faktureras.
                    </p>
                  </div>
                </header>

                <div className={styles.formGrid}>
                  <label>
                    <span>
                      Kund <em>*</em>
                    </span>

                    <select
                      value={customerId}
                      onChange={(event) =>
                        changeCustomer(
                          event.target
                            .value
                        )
                      }
                    >
                      <option value="">
                        Välj kund
                      </option>

                      {options.customers.map(
                        (customer) => (
                          <option
                            key={
                              customer.id
                            }
                            value={
                              customer.id
                            }
                          >
                            {
                              customer.name
                            }
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  <label>
                    <span>Projekt</span>

                    <select
                      value={projectId}
                      onChange={(event) =>
                        setProjectId(
                          event.target
                            .value
                        )
                      }
                    >
                      <option value="">
                        Inget projekt
                      </option>

                      {filteredProjects.map(
                        (project) => (
                          <option
                            key={
                              project.id
                            }
                            value={
                              project.id
                            }
                          >
                            {
                              project.title
                            }
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  <label
                    className={
                      styles.fullWidth
                    }
                  >
                    <span>
                      Fakturans titel
                      <em>*</em>
                    </span>

                    <input
                      value={title}
                      onChange={(event) =>
                        setTitle(
                          event.target
                            .value
                        )
                      }
                    />
                  </label>

                  <label
                    className={
                      styles.fullWidth
                    }
                  >
                    <span>Beskrivning</span>

                    <textarea
                      rows={4}
                      value={description}
                      onChange={(event) =>
                        setDescription(
                          event.target
                            .value
                        )
                      }
                      placeholder="Information som visas på fakturan..."
                    />
                  </label>
                </div>
              </section>

              <section className={styles.card}>
                <header>
                  <CalendarClock
                    size={19}
                  />

                  <div>
                    <h2>Fakturadetaljer</h2>

                    <p>
                      Datum, villkor och
                      mottagare.
                    </p>
                  </div>
                </header>

                <div className={styles.formGrid}>
                  <label>
                    <span>
                      Fakturadatum
                    </span>

                    <input
                      type="date"
                      value={invoiceDate}
                      onChange={(event) =>
                        changeInvoiceDate(
                          event.target
                            .value
                        )
                      }
                    />
                  </label>

                  <label>
                    <span>
                      Betalningsvillkor
                    </span>

                    <select
                      value={
                        paymentTermsDays
                      }
                      onChange={(event) =>
                        changePaymentTerms(
                          Number(
                            event.target
                              .value
                          )
                        )
                      }
                    >
                      <option value={10}>
                        10 dagar
                      </option>

                      <option value={14}>
                        14 dagar
                      </option>

                      <option value={20}>
                        20 dagar
                      </option>

                      <option value={30}>
                        30 dagar
                      </option>

                      <option value={60}>
                        60 dagar
                      </option>
                    </select>
                  </label>

                  <label>
                    <span>
                      Förfallodatum
                    </span>

                    <input
                      type="date"
                      value={dueDate}
                      onChange={(event) =>
                        setDueDate(
                          event.target
                            .value
                        )
                      }
                    />
                  </label>

                  <label>
                    <span>Fakturamejl</span>

                    <input
                      type="email"
                      value={deliveryEmail}
                      onChange={(event) =>
                        setDeliveryEmail(
                          event.target
                            .value
                        )
                      }
                    />
                  </label>

                  <label>
                    <span>
                      Er referens
                    </span>

                    <input
                      value={referenceNumber}
                      onChange={(event) =>
                        setReferenceNumber(
                          event.target
                            .value
                        )
                      }
                    />
                  </label>

                  <label>
                    <span>
                      PO-/ordernummer
                    </span>

                    <input
                      value={poNumber}
                      onChange={(event) =>
                        setPoNumber(
                          event.target
                            .value
                        )
                      }
                    />
                  </label>
                </div>
              </section>

              <section className={styles.card}>
                <header>
                  <RotateCw size={19} />

                  <div>
                    <h2>
                      Månadsfakturering
                    </h2>

                    <p>
                      Skapa samma faktura
                      automatiskt varje månad.
                    </p>
                  </div>
                </header>

                <div
                  className={
                    styles.recurringContent
                  }
                >
                  <label
                    className={
                      styles.toggleRow
                    }
                  >
                    <input
                      type="checkbox"
                      checked={
                        recurringEnabled
                      }
                      onChange={(event) =>
                        setRecurringEnabled(
                          event.target
                            .checked
                        )
                      }
                    />

                    <span>
                      <strong>
                        Återkommande faktura
                      </strong>

                      <small>
                        Spara fakturaraderna
                        som en månadsplan.
                      </small>
                    </span>
                  </label>

                  {recurringEnabled && (
                    <div
                      className={
                        styles.formGrid
                      }
                    >
                      <label>
                        <span>
                          Första kommande
                          fakturadatum
                        </span>

                        <input
                          type="date"
                          value={
                            recurringStartDate
                          }
                          onChange={(event) =>
                            setRecurringStartDate(
                              event.target
                                .value
                            )
                          }
                        />
                      </label>

                      <label>
                        <span>
                          Fakturadag varje
                          månad
                        </span>

                        <input
                          type="number"
                          min={1}
                          max={28}
                          value={
                            recurringInvoiceDay
                          }
                          onChange={(event) =>
                            setRecurringInvoiceDay(
                              Math.min(
                                Math.max(
                                  Number(
                                    event.target
                                      .value
                                  ) || 1,
                                  1
                                ),
                                28
                              )
                            )
                          }
                        />
                      </label>

                      <label
                        className={
                          styles.toggleRow
                        }
                      >
                        <input
                          type="checkbox"
                          checked={
                            recurringAutoSend
                          }
                          onChange={(event) =>
                            setRecurringAutoSend(
                              event.target
                                .checked
                            )
                          }
                        />

                        <span>
                          <strong>
                            Skicka automatiskt
                          </strong>

                          <small>
                            Fakturan skickas
                            till fakturamejlen
                            efter att den har
                            skapats.
                          </small>
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          {step === 2 && (
            <section className={styles.card}>
              <header>
                <FileText size={19} />

                <div>
                  <h2>Fakturarader</h2>

                  <p>
                    Lägg till tjänster eller
                    egna rader.
                  </p>
                </div>
              </header>

              <div
                className={
                  styles.catalogPicker
                }
              >
                <section
                  className={
                    styles.pickerGroup
                  }
                >
                  <div>
                    <strong>
                      Lägg till paket
                    </strong>

                    <span>
                      Paketets obligatoriska
                      tjänster läggs in som
                      separata fakturarader.
                    </span>
                  </div>

                  <div
                    className={
                      styles.pickerControls
                    }
                  >
                    <select
                      value={
                        catalogPackageId
                      }
                      onChange={(event) =>
                        setCatalogPackageId(
                          event.target.value
                        )
                      }
                    >
                      <option value="">
                        Välj paket
                      </option>

                      {options.packages.map(
                        (item) => (
                          <option
                            key={item.id}
                            value={item.id}
                          >
                            {item.name}
                            {" – "}
                            {item.priceMode ===
                            "fixed"
                              ? money(
                                  item.fixedPriceExVat
                                )
                              : `${item.items.filter(
                                  (packageItem) =>
                                    !packageItem.isOptional
                                ).length} tjänster`}
                          </option>
                        )
                      )}
                    </select>

                    <button
                      type="button"
                      disabled={
                        !catalogPackageId
                      }
                      onClick={
                        addCatalogPackage
                      }
                    >
                      <Plus size={16} />
                      Lägg till paket
                    </button>
                  </div>
                </section>

                <section
                  className={
                    styles.pickerGroup
                  }
                >
                  <div>
                    <strong>
                      Tjänst eller tillägg
                    </strong>

                    <span>
                      Pris, enhet och moms
                      hämtas automatiskt från
                      tjänstekatalogen.
                    </span>
                  </div>

                  <div
                    className={
                      styles.pickerControls
                    }
                  >
                    <select
                      value={
                        catalogServiceId
                      }
                      onChange={(event) =>
                        setCatalogServiceId(
                          event.target.value
                        )
                      }
                    >
                      <option value="">
                        Välj tjänst eller
                        tillägg
                      </option>

                      {options.services.map(
                        (service) => (
                          <option
                            key={
                              service.id
                            }
                            value={
                              service.id
                            }
                          >
                            {service.kind ===
                            "addon"
                              ? "Tillägg"
                              : "Tjänst"}
                            {" · "}
                            {service.name}
                            {" – "}
                            {money(
                              service.unitPriceExVat
                            )}
                          </option>
                        )
                      )}
                    </select>

                    <button
                      type="button"
                      disabled={
                        !catalogServiceId
                      }
                      onClick={
                        addCatalogService
                      }
                    >
                      <Plus size={16} />
                      Lägg till
                    </button>
                  </div>
                </section>

                <button
                  type="button"
                  className={
                    styles.customItemButton
                  }
                  onClick={addCustomItem}
                >
                  <Plus size={16} />
                  Skapa egen fakturarad
                </button>
              </div>

              <div className={styles.items}>
                {items.length === 0 ? (
                  <div
                    className={
                      styles.emptyItems
                    }
                  >
                    <ReceiptText
                      size={30}
                    />

                    <strong>
                      Inga fakturarader
                    </strong>

                    <p>
                      Välj en tjänst eller
                      skapa en egen rad.
                    </p>
                  </div>
                ) : (
                  items.map(
                    (
                      item,
                      index
                    ) => (
                      <article
                        key={
                          item.clientId
                        }
                        className={
                          styles.itemRow
                        }
                      >
                        <span
                          className={
                            styles.rowNumber
                          }
                        >
                          {index + 1}
                        </span>

                        <label
                          className={
                            styles.itemDescription
                          }
                        >
                          <span>
                            Beskrivning
                          </span>

                          <input
                            value={
                              item.description
                            }
                            onChange={(event) =>
                              updateItem(
                                item.clientId,
                                {
                                  description:
                                    event.target
                                      .value,
                                }
                              )
                            }
                          />
                        </label>

                        <label>
                          <span>Antal</span>

                          <input
                            type="number"
                            min={0.01}
                            step={0.25}
                            value={
                              item.quantity
                            }
                            onChange={(event) =>
                              updateItem(
                                item.clientId,
                                {
                                  quantity:
                                    Math.max(
                                      Number(
                                        event.target
                                          .value
                                      ) ||
                                        0.01,
                                      0.01
                                    ),
                                }
                              )
                            }
                          />
                        </label>

                        <label>
                          <span>Enhet</span>

                          <select
                            value={
                              item.unitCode
                            }
                            onChange={(event) =>
                              updateItem(
                                item.clientId,
                                {
                                  unitCode:
                                    event.target
                                      .value,
                                }
                              )
                            }
                          >
                            {options.units.map(
                              (unit) => (
                                <option
                                  key={
                                    unit.code
                                  }
                                  value={
                                    unit.code
                                  }
                                >
                                  {
                                    unit.shortLabel
                                  }
                                </option>
                              )
                            )}
                          </select>
                        </label>

                        <label>
                          <span>
                            Pris exkl. moms
                          </span>

                          <input
                            type="number"
                            min={0}
                            step={100}
                            value={
                              item.unitPriceExVat
                            }
                            onChange={(event) =>
                              updateItem(
                                item.clientId,
                                {
                                  unitPriceExVat:
                                    Math.max(
                                      Number(
                                        event.target
                                          .value
                                      ) || 0,
                                      0
                                    ),
                                }
                              )
                            }
                          />
                        </label>

                        <label>
                          <span>Rabatt %</span>

                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={
                              item.discountPercent
                            }
                            onChange={(event) =>
                              updateItem(
                                item.clientId,
                                {
                                  discountPercent:
                                    Math.min(
                                      Math.max(
                                        Number(
                                          event.target
                                            .value
                                        ) || 0,
                                        0
                                      ),
                                      100
                                    ),
                                }
                              )
                            }
                          />
                        </label>

                        <label>
                          <span>Moms %</span>

                          <select
                            value={
                              item.vatRate
                            }
                            onChange={(event) =>
                              updateItem(
                                item.clientId,
                                {
                                  vatRate:
                                    Number(
                                      event.target
                                        .value
                                    ),
                                }
                              )
                            }
                          >
                            <option value={0}>
                              0 %
                            </option>

                            <option value={6}>
                              6 %
                            </option>

                            <option value={12}>
                              12 %
                            </option>

                            <option value={25}>
                              25 %
                            </option>
                          </select>
                        </label>

                        <div
                          className={
                            styles.lineTotal
                          }
                        >
                          <span>Delsumma</span>

                          <strong>
                            {money(
                              lineSubtotal(
                                item
                              )
                            )}
                          </strong>
                        </div>

                        <button
                          type="button"
                          className={
                            styles.removeButton
                          }
                          onClick={() =>
                            removeItem(
                              item.clientId
                            )
                          }
                        >
                          <Trash2
                            size={16}
                          />
                        </button>
                      </article>
                    )
                  )
                )}
              </div>
            </section>
          )}

          {step === 3 && (
            <section className={styles.card}>
              <header>
                <BadgeCheck size={19} />

                <div>
                  <h2>
                    Granska fakturan
                  </h2>

                  <p>
                    Kontrollera uppgifterna
                    innan utkastet skapas.
                  </p>
                </div>
              </header>

              <div className={styles.review}>
                <div>
                  <span>Kund</span>
                  <strong>
                    {selectedCustomer
                      ?.name ||
                      "Ingen kund"}
                  </strong>
                </div>

                <div>
                  <span>Fakturadatum</span>
                  <strong>
                    {invoiceDate}
                  </strong>
                </div>

                <div>
                  <span>Förfallodatum</span>
                  <strong>
                    {dueDate}
                  </strong>
                </div>

                <div>
                  <span>Fakturamejl</span>
                  <strong>
                    {deliveryEmail ||
                      "Ej angiven"}
                  </strong>
                </div>

                <div>
                  <span>
                    Månadsfakturering
                  </span>

                  <strong>
                    {recurringEnabled
                      ? recurringAutoSend
                        ? "Aktiv – automatisk utskick"
                        : "Aktiv – skapas som utkast"
                      : "Nej"}
                  </strong>
                </div>

                <label
                  className={
                    styles.fullWidth
                  }
                >
                  <span>
                    Intern anteckning
                  </span>

                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(event) =>
                      setNotes(
                        event.target.value
                      )
                    }
                  />
                </label>
              </div>
            </section>
          )}
        </main>

        <aside className={styles.summary}>
          <section>
            <header>
              <ReceiptText size={18} />

              <div>
                <h2>Sammanfattning</h2>

                <p>
                  Fakturans aktuella belopp.
                </p>
              </div>
            </header>

            <dl>
              <div>
                <dt>Fakturarader</dt>
                <dd>{items.length}</dd>
              </div>

              <div>
                <dt>Delsumma</dt>
                <dd>
                  {money(subtotal)}
                </dd>
              </div>

              <div>
                <dt>Moms</dt>
                <dd>
                  {money(vatAmount)}
                </dd>
              </div>

              <div
                className={
                  styles.totalRow
                }
              >
                <dt>Att betala</dt>
                <dd>
                  {money(total)}
                </dd>
              </div>
            </dl>

            {recurringEnabled && (
              <div
                className={
                  styles.recurringBadge
                }
              >
                <RotateCw size={16} />

                <span>
                  Återkommer varje månad
                  från{" "}
                  {recurringStartDate}
                </span>
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}


