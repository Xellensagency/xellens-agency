"use client";

import type {
  ChangeEvent,
  FormEvent,
} from "react";

import {
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Landmark,
  LoaderCircle,
  Mail,
  Palette,
  ReceiptText,
  Save,
  Trash2,
  Upload,
} from "lucide-react";

import {
  saveCompanySettingsAction,
} from "@/app/dashboard/installningar/actions";

import type {
  CompanySettings,
  CompanySettingsInput,
} from "@/lib/dashboard/settings/company-settings-types";

import {
  createClient,
} from "@/lib/supabase/client";

import styles from "./CompanySettingsForm.module.css";

type CompanySettingsFormProps = {
  initialSettings:
    CompanySettings;
};

type TabKey =
  | "company"
  | "bank"
  | "documents"
  | "branding";

type LogoField =
  | "logoUrl"
  | "logoDarkUrl";

const tabs: Array<{
  key: TabKey;
  label: string;
  icon: typeof Building2;
}> = [
  {
    key: "company",
    label: "Företagsuppgifter",
    icon: Building2,
  },
  {
    key: "bank",
    label: "Bank och betalning",
    icon: Landmark,
  },
  {
    key: "documents",
    label: "Faktura och offert",
    icon: ReceiptText,
  },
  {
    key: "branding",
    label: "Varumärke och e-post",
    icon: Palette,
  },
];

export default function CompanySettingsForm({
  initialSettings,
}: CompanySettingsFormProps) {
  const supabase =
    useMemo(
      () => createClient(),
      []
    );

  const [
    settings,
    setSettings,
  ] =
    useState<CompanySettingsInput>(
      initialSettings
    );

  const [
    activeTab,
    setActiveTab,
  ] =
    useState<TabKey>(
      "company"
    );

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    hasError,
    setHasError,
  ] =
    useState(false);

  const [
    uploadingLogo,
    setUploadingLogo,
  ] =
    useState<
      LogoField | null
    >(null);

  const [
    isPending,
    startTransition,
  ] =
    useTransition();

  function updateField<
    K extends keyof CompanySettingsInput
  >(
    field: K,
    value: CompanySettingsInput[K]
  ) {
    setSettings(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  }

  function saveSettings(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setHasError(false);

    startTransition(
      async () => {
        const result =
          await saveCompanySettingsAction(
            settings
          );

        setMessage(
          result.message
        );

        setHasError(
          !result.success
        );
      }
    );
  }

  async function uploadLogo(
    field: LogoField,
    event:
      ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/svg+xml",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setMessage(
        "Logotypen måste vara PNG, JPG, WebP eller SVG."
      );

      setHasError(true);
      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setMessage(
        "Logotypen får vara högst 5 MB."
      );

      setHasError(true);
      return;
    }

    setUploadingLogo(
      field
    );

    setMessage("");
    setHasError(false);

    const extension =
      file.type ===
      "image/svg+xml"
        ? "svg"
        : file.type ===
            "image/webp"
          ? "webp"
          : file.type ===
              "image/jpeg"
            ? "jpg"
            : "png";

    const logoType =
      field === "logoUrl"
        ? "main"
        : "light";

    const filePath =
      `logos/${logoType}-${Date.now()}-${crypto.randomUUID()}.${extension}`;

    try {
      const {
        error: uploadError,
      } =
        await supabase.storage
          .from(
            "company-branding"
          )
          .upload(
            filePath,
            file,
            {
              cacheControl:
                "3600",

              contentType:
                file.type,

              upsert:
                false,
            }
          );

      if (uploadError) {
        throw uploadError;
      }

      const {
        data,
      } =
        supabase.storage
          .from(
            "company-branding"
          )
          .getPublicUrl(
            filePath
          );

      if (
        !data.publicUrl
      ) {
        throw new Error(
          "Ingen publik logotypadress returnerades."
        );
      }

      updateField(
        field,
        data.publicUrl
      );

      setMessage(
        "Logotypen är uppladdad. Tryck på Spara ändringar för att använda den."
      );

      setHasError(false);
    } catch (error) {
      console.error(
        "Kunde inte ladda upp logotyp:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Logotypen kunde inte laddas upp."
      );

      setHasError(true);
    } finally {
      setUploadingLogo(
        null
      );
    }
  }

  const busy =
    isPending ||
    uploadingLogo !== null;

  return (
    <form
      className={styles.page}
      onSubmit={
        saveSettings
      }
    >
      <header
        className={
          styles.header
        }
      >
        <div>
          <span
            className={
              styles.eyebrow
            }
          >
            ADMININSTÄLLNINGAR
          </span>

          <h1>
            Företagsinställningar
          </h1>

          <p>
            Hantera företagsuppgifter,
            bankinformation, dokument och
            Xellens grafiska profil.
          </p>
        </div>

        <button
          type="submit"
          className={
            styles.saveButton
          }
          disabled={busy}
        >
          {isPending ? (
            <LoaderCircle
              size={18}
              className={
                styles.spinner
              }
            />
          ) : (
            <Save size={18} />
          )}

          {isPending
            ? "Sparar..."
            : "Spara ändringar"}
        </button>
      </header>

      {message && (
        <div
          className={`${styles.message} ${
            hasError
              ? styles.error
              : styles.success
          }`}
          role="status"
        >
          {hasError ? (
            <AlertCircle
              size={18}
            />
          ) : (
            <CheckCircle2
              size={18}
            />
          )}

          {message}
        </div>
      )}

      <nav
        className={
          styles.tabs
        }
        aria-label="Inställningsområden"
      >
        {tabs.map(
          (tab) => {
            const Icon =
              tab.icon;

            return (
              <button
                key={
                  tab.key
                }
                type="button"
                onClick={() =>
                  setActiveTab(
                    tab.key
                  )
                }
                className={`${styles.tab} ${
                  activeTab ===
                  tab.key
                    ? styles.activeTab
                    : ""
                }`}
              >
                <Icon
                  size={18}
                />

                {tab.label}
              </button>
            );
          }
        )}
      </nav>

      {activeTab ===
        "company" && (
        <section
          className={
            styles.panel
          }
        >
          <div
            className={
              styles.panelHeading
            }
          >
            <Building2
              size={24}
            />

            <div>
              <h2>
                Företagsuppgifter
              </h2>

              <p>
                Uppgifterna som identifierar
                Xellens Agency på dokument
                och i kommunikation.
              </p>
            </div>
          </div>

          <div
            className={
              styles.grid
            }
          >
            <label
              className={
                styles.field
              }
            >
              <span>
                Företagsnamn
              </span>

              <input
                value={
                  settings.companyName
                }
                onChange={(event) =>
                  updateField(
                    "companyName",
                    event.target.value
                  )
                }
                required
              />
            </label>

            <label
              className={
                styles.field
              }
            >
              <span>
                Juridiskt namn
              </span>

              <input
                value={
                  settings.legalName
                }
                onChange={(event) =>
                  updateField(
                    "legalName",
                    event.target.value
                  )
                }
              />
            </label>

            <label
              className={
                styles.field
              }
            >
              <span>
                Organisationsnummer
              </span>

              <input
                value={
                  settings.organizationNumber
                }
                onChange={(event) =>
                  updateField(
                    "organizationNumber",
                    event.target.value
                  )
                }
              />
            </label>

            <label
              className={
                styles.field
              }
            >
              <span>
                Momsregistreringsnummer
              </span>

              <input
                value={
                  settings.vatNumber
                }
                onChange={(event) =>
                  updateField(
                    "vatNumber",
                    event.target.value
                  )
                }
              />
            </label>

            <label
              className={`${styles.checkboxField} ${styles.full}`}
            >
              <input
                type="checkbox"
                checked={
                  settings.approvedForFTax
                }
                onChange={(event) =>
                  updateField(
                    "approvedForFTax",
                    event.target.checked
                  )
                }
              />

              <span>
                Företaget är godkänt för
                F-skatt
              </span>
            </label>

            <label
              className={`${styles.field} ${styles.full}`}
            >
              <span>
                Besöks- och postadress
              </span>

              <input
                value={
                  settings.address
                }
                onChange={(event) =>
                  updateField(
                    "address",
                    event.target.value
                  )
                }
              />
            </label>

            <label
              className={
                styles.field
              }
            >
              <span>
                Postnummer
              </span>

              <input
                value={
                  settings.postalCode
                }
                onChange={(event) =>
                  updateField(
                    "postalCode",
                    event.target.value
                  )
                }
              />
            </label>

            <label
              className={
                styles.field
              }
            >
              <span>
                Ort
              </span>

              <input
                value={
                  settings.city
                }
                onChange={(event) =>
                  updateField(
                    "city",
                    event.target.value
                  )
                }
              />
            </label>

            <label
              className={
                styles.field
              }
            >
              <span>
                Land
              </span>

              <input
                value={
                  settings.country
                }
                onChange={(event) =>
                  updateField(
                    "country",
                    event.target.value
                  )
                }
              />
            </label>

            <label
              className={
                styles.field
              }
            >
              <span>
                Telefonnummer
              </span>

              <input
                value={
                  settings.phone
                }
                onChange={(event) =>
                  updateField(
                    "phone",
                    event.target.value
                  )
                }
              />
            </label>

            <label
              className={
                styles.field
              }
            >
              <span>
                Företagsmejl
              </span>

              <input
                type="email"
                value={
                  settings.email
                }
                onChange={(event) =>
                  updateField(
                    "email",
                    event.target.value
                  )
                }
              />
            </label>

            <label
              className={
                styles.field
              }
            >
              <span>
                Webbplats
              </span>

              <input
                value={
                  settings.website
                }
                onChange={(event) =>
                  updateField(
                    "website",
                    event.target.value
                  )
                }
                placeholder="https://"
              />
            </label>
          </div>
        </section>
      )}

      {activeTab ===
        "bank" && (
        <section
          className={
            styles.panel
          }
        >
          <div
            className={
              styles.panelHeading
            }
          >
            <Landmark
              size={24}
            />

            <div>
              <h2>
                Bank och betalning
              </h2>

              <p>
                Konton och betalningsuppgifter
                som senare visas på fakturor.
              </p>
            </div>
          </div>

          <div
            className={
              styles.grid
            }
          >
            <label
              className={
                styles.field
              }
            >
              <span>
                Bank
              </span>

              <input
                value={
                  settings.bankName
                }
                onChange={(event) =>
                  updateField(
                    "bankName",
                    event.target.value
                  )
                }
              />
            </label>

            <label
              className={
                styles.field
              }
            >
              <span>
                Bankgiro
              </span>

              <input
                value={
                  settings.bankgiro
                }
                onChange={(event) =>
                  updateField(
                    "bankgiro",
                    event.target.value
                  )
                }
              />
            </label>

            <label
              className={
                styles.field
              }
            >
              <span>
                Plusgiro
              </span>

              <input
                value={
                  settings.plusgiro
                }
                onChange={(event) =>
                  updateField(
                    "plusgiro",
                    event.target.value
                  )
                }
              />
            </label>

            <label
              className={
                styles.field
              }
            >
              <span>
                Swishnummer
              </span>

              <input
                value={
                  settings.swishNumber
                }
                onChange={(event) =>
                  updateField(
                    "swishNumber",
                    event.target.value
                  )
                }
              />
            </label>

            <label
              className={
                styles.field
              }
            >
              <span>
                Clearingnummer
              </span>

              <input
                value={
                  settings.clearingNumber
                }
                onChange={(event) =>
                  updateField(
                    "clearingNumber",
                    event.target.value
                  )
                }
              />
            </label>

            <label
              className={
                styles.field
              }
            >
              <span>
                Kontonummer
              </span>

              <input
                value={
                  settings.accountNumber
                }
                onChange={(event) =>
                  updateField(
                    "accountNumber",
                    event.target.value
                  )
                }
              />
            </label>

            <label
              className={
                styles.field
              }
            >
              <span>
                IBAN
              </span>

              <input
                value={
                  settings.iban
                }
                onChange={(event) =>
                  updateField(
                    "iban",
                    event.target.value
                  )
                }
              />
            </label>

            <label
              className={
                styles.field
              }
            >
              <span>
                BIC / SWIFT
              </span>

              <input
                value={
                  settings.bicSwift
                }
                onChange={(event) =>
                  updateField(
                    "bicSwift",
                    event.target.value
                  )
                }
              />
            </label>
          </div>
        </section>
      )}

      {activeTab ===
        "documents" && (
        <section
          className={
            styles.panel
          }
        >
          <div
            className={
              styles.panelHeading
            }
          >
            <ReceiptText
              size={24}
            />

            <div>
              <h2>
                Fakturor och offerter
              </h2>

              <p>
                Standardvärden som används
                när nya dokument skapas.
              </p>
            </div>
          </div>

          <div
            className={
              styles.grid
            }
          >
            <label
              className={
                styles.field
              }
            >
              <span>
                Betalningsvillkor
              </span>

              <div
                className={
                  styles.inputSuffix
                }
              >
                <input
                  type="number"
                  min="0"
                  max="365"
                  value={
                    settings.defaultPaymentTerms
                  }
                  onChange={(event) =>
                    updateField(
                      "defaultPaymentTerms",
                      Number(
                        event.target.value
                      )
                    )
                  }
                />

                <small>
                  dagar
                </small>
              </div>
            </label>

            <label
              className={
                styles.field
              }
            >
              <span>
                Standardmoms
              </span>

              <div
                className={
                  styles.inputSuffix
                }
              >
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={
                    settings.defaultVatRate
                  }
                  onChange={(event) =>
                    updateField(
                      "defaultVatRate",
                      Number(
                        event.target.value
                      )
                    )
                  }
                />

                <small>
                  %
                </small>
              </div>
            </label>

            <label
              className={
                styles.field
              }
            >
              <span>
                Dröjsmålsränta
              </span>

              <div
                className={
                  styles.inputSuffix
                }
              >
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={
                    settings.lateInterestPercent
                  }
                  onChange={(event) =>
                    updateField(
                      "lateInterestPercent",
                      Number(
                        event.target.value
                      )
                    )
                  }
                />

                <small>
                  %
                </small>
              </div>
            </label>

            <label
              className={
                styles.field
              }
            >
              <span>
                Påminnelseavgift
              </span>

              <div
                className={
                  styles.inputSuffix
                }
              >
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    settings.reminderFee
                  }
                  onChange={(event) =>
                    updateField(
                      "reminderFee",
                      Number(
                        event.target.value
                      )
                    )
                  }
                />

                <small>
                  kr
                </small>
              </div>
            </label>

            <label
              className={
                styles.field
              }
            >
              <span>
                Fakturaprefix
              </span>

              <input
                value={
                  settings.invoicePrefix
                }
                onChange={(event) =>
                  updateField(
                    "invoicePrefix",
                    event.target.value
                  )
                }
              />
            </label>

            <label
              className={
                styles.field
              }
            >
              <span>
                Offertprefix
              </span>

              <input
                value={
                  settings.offerPrefix
                }
                onChange={(event) =>
                  updateField(
                    "offerPrefix",
                    event.target.value
                  )
                }
              />
            </label>

            <label
              className={`${styles.field} ${styles.full}`}
            >
              <span>
                Standardsidfot på fakturor
              </span>

              <textarea
                rows={4}
                value={
                  settings.invoiceFooterText
                }
                onChange={(event) =>
                  updateField(
                    "invoiceFooterText",
                    event.target.value
                  )
                }
                placeholder="Exempel: Godkänd för F-skatt. Tack för ert förtroende."
              />
            </label>

            <label
              className={`${styles.field} ${styles.full}`}
            >
              <span>
                Standardsidfot på offerter
              </span>

              <textarea
                rows={4}
                value={
                  settings.offerFooterText
                }
                onChange={(event) =>
                  updateField(
                    "offerFooterText",
                    event.target.value
                  )
                }
                placeholder="Exempel: Offerten gäller i 30 dagar."
              />
            </label>
          </div>
        </section>
      )}

      {activeTab ===
        "branding" && (
        <section
          className={
            styles.panel
          }
        >
          <div
            className={
              styles.panelHeading
            }
          >
            <Palette
              size={24}
            />

            <div>
              <h2>
                Varumärke och e-post
              </h2>

              <p>
                Logotyper, färger och
                standardavsändare för
                Xellens kommunikation.
              </p>
            </div>
          </div>

          <div
            className={
              styles.logoGrid
            }
          >
            <article
              className={
                styles.logoCard
              }
            >
              <div>
                <h3>
                  Huvudlogotyp
                </h3>

                <p>
                  Används på ljusa dokument,
                  fakturor och offerter.
                </p>
              </div>

              <div
                className={
                  styles.logoPreview
                }
              >
                {settings.logoUrl ? (
                  <img
                    src={
                      settings.logoUrl
                    }
                    alt="Huvudlogotyp"
                  />
                ) : (
                  <span>
                    Ingen logotyp uppladdad
                  </span>
                )}
              </div>

              <div
                className={
                  styles.logoActions
                }
              >
                <label
                  className={
                    styles.uploadButton
                  }
                >
                  {uploadingLogo ===
                  "logoUrl" ? (
                    <LoaderCircle
                      size={17}
                      className={
                        styles.spinner
                      }
                    />
                  ) : (
                    <Upload
                      size={17}
                    />
                  )}

                  Ladda upp

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={(event) =>
                      uploadLogo(
                        "logoUrl",
                        event
                      )
                    }
                    disabled={busy}
                  />
                </label>

                {settings.logoUrl && (
                  <button
                    type="button"
                    className={
                      styles.removeButton
                    }
                    onClick={() =>
                      updateField(
                        "logoUrl",
                        ""
                      )
                    }
                    disabled={busy}
                  >
                    <Trash2
                      size={16}
                    />

                    Ta bort
                  </button>
                )}
              </div>
            </article>

            <article
              className={`${styles.logoCard} ${styles.darkLogoCard}`}
            >
              <div>
                <h3>
                  Ljus eller vit logotyp
                </h3>

                <p>
                  Används mot mörka bakgrunder
                  i mejl och kundportal.
                </p>
              </div>

              <div
                className={`${styles.logoPreview} ${styles.darkPreview}`}
              >
                {settings.logoDarkUrl ? (
                  <img
                    src={
                      settings.logoDarkUrl
                    }
                    alt="Ljus logotyp"
                  />
                ) : (
                  <span>
                    Ingen ljus logotyp uppladdad
                  </span>
                )}
              </div>

              <div
                className={
                  styles.logoActions
                }
              >
                <label
                  className={
                    styles.uploadButton
                  }
                >
                  {uploadingLogo ===
                  "logoDarkUrl" ? (
                    <LoaderCircle
                      size={17}
                      className={
                        styles.spinner
                      }
                    />
                  ) : (
                    <Upload
                      size={17}
                    />
                  )}

                  Ladda upp

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={(event) =>
                      uploadLogo(
                        "logoDarkUrl",
                        event
                      )
                    }
                    disabled={busy}
                  />
                </label>

                {settings.logoDarkUrl && (
                  <button
                    type="button"
                    className={
                      styles.removeButton
                    }
                    onClick={() =>
                      updateField(
                        "logoDarkUrl",
                        ""
                      )
                    }
                    disabled={busy}
                  >
                    <Trash2
                      size={16}
                    />

                    Ta bort
                  </button>
                )}
              </div>
            </article>
          </div>

          <div
            className={
              styles.grid
            }
          >
            <label
              className={
                styles.field
              }
            >
              <span>
                Huvudfärg
              </span>

              <div
                className={
                  styles.colorField
                }
              >
                <input
                  type="color"
                  value={
                    settings.primaryColor
                  }
                  onChange={(event) =>
                    updateField(
                      "primaryColor",
                      event.target.value
                        .toUpperCase()
                    )
                  }
                />

                <input
                  value={
                    settings.primaryColor
                  }
                  onChange={(event) =>
                    updateField(
                      "primaryColor",
                      event.target.value
                    )
                  }
                  placeholder="#07366F"
                />
              </div>
            </label>

            <label
              className={
                styles.field
              }
            >
              <span>
                Avsändarnamn i mejl
              </span>

              <div
                className={
                  styles.iconInput
                }
              >
                <Mail size={17} />

                <input
                  value={
                    settings.emailSenderName
                  }
                  onChange={(event) =>
                    updateField(
                      "emailSenderName",
                      event.target.value
                    )
                  }
                />
              </div>
            </label>

            <label
              className={`${styles.field} ${styles.full}`}
            >
              <span>
                Standardmejlsignatur
              </span>

              <textarea
                rows={7}
                value={
                  settings.emailSignature
                }
                onChange={(event) =>
                  updateField(
                    "emailSignature",
                    event.target.value
                  )
                }
                placeholder={"Med vänliga hälsningar\nXellens Agency"}
              />
            </label>
          </div>
        </section>
      )}

      <footer
        className={
          styles.footer
        }
      >
        <p>
          Ändringarna används senare som
          grund för fakturor, offerter,
          avtal och e-postmallar.
        </p>

        <button
          type="submit"
          className={
            styles.saveButton
          }
          disabled={busy}
        >
          {isPending ? (
            <LoaderCircle
              size={18}
              className={
                styles.spinner
              }
            />
          ) : (
            <Save size={18} />
          )}

          {isPending
            ? "Sparar..."
            : "Spara ändringar"}
        </button>
      </footer>
    </form>
  );
}
