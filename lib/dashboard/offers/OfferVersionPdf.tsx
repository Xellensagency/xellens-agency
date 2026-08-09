import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";


type UnknownRow =
  Record<string, unknown>;


type CreateOfferVersionPdfInput = {
  snapshot: unknown;
  versionNumber: number;
};


function asObject(
  value: unknown
): UnknownRow {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as UnknownRow;
  }

  return {};
}


function asArray(
  value: unknown
): unknown[] {
  return Array.isArray(value)
    ? value
    : [];
}


function textValue(
  value: unknown,
  fallback = ""
) {
  if (
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  return String(value);
}


function numberValue(
  value: unknown
) {
  const parsed =
    Number(value ?? 0);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}


function boolValue(
  value: unknown,
  fallback = false
) {
  if (
    typeof value === "boolean"
  ) {
    return value;
  }

  if (
    value === "true"
  ) {
    return true;
  }

  if (
    value === "false"
  ) {
    return false;
  }

  return fallback;
}


function money(
  value: number,
  currency: string
) {
  try {
    return new Intl.NumberFormat(
      "sv-SE",
      {
        style: "currency",
        currency:
          currency || "SEK",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }
    ).format(value);
  }
  catch {
    return `${Math.round(value)} ${currency || "SEK"}`;
  }
}


function formatDate(
  value: unknown
) {
  const raw =
    textValue(value);

  if (!raw) {
    return "Ej angivet";
  }

  const date =
    new Date(raw);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return raw;
  }

  return new Intl.DateTimeFormat(
    "sv-SE",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  ).format(date);
}


const styles =
  StyleSheet.create({

    page: {
      paddingTop: 32,
      paddingBottom: 42,
      paddingHorizontal: 36,
      backgroundColor: "#FFFFFF",
      color: "#0B2F33",
      fontFamily: "Helvetica",
      fontSize: 8.5,
      lineHeight: 1.45,
    },

    brandRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: "#E3EAE8",
    },

    brand: {
      fontSize: 24,
      fontFamily: "Helvetica-Bold",
      letterSpacing: -1,
      color: "#0B2F33",
    },

    tagline: {
      marginTop: 3,
      fontSize: 7,
      color: "#8A9996",
    },

    version: {
      paddingVertical: 5,
      paddingHorizontal: 8,
      borderRadius: 4,
      backgroundColor: "#EAF7F1",
      color: "#22B573",
      fontSize: 7,
      fontFamily: "Helvetica-Bold",
    },

    hero: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 24,
      paddingTop: 20,
      paddingBottom: 18,
    },

    heroMain: {
      flexGrow: 1,
      flexBasis: 0,
    },

    eyebrow: {
      marginBottom: 5,
      color: "#22B573",
      fontSize: 7,
      fontFamily: "Helvetica-Bold",
      letterSpacing: 0.5,
    },

    title: {
      fontSize: 22,
      lineHeight: 1.12,
      fontFamily: "Helvetica-Bold",
      color: "#0B2F33",
    },

    description: {
      marginTop: 8,
      maxWidth: 340,
      color: "#657A77",
      fontSize: 8,
      lineHeight: 1.5,
    },

    totalHero: {
      width: 142,
      padding: 12,
      borderWidth: 1,
      borderColor: "#DFE8E5",
      borderRadius: 6,
      backgroundColor: "#F8FAF9",
    },

    label: {
      color: "#879693",
      fontSize: 6.5,
      fontFamily: "Helvetica-Bold",
      letterSpacing: 0.3,
    },

    heroAmount: {
      marginTop: 5,
      color: "#22B573",
      fontSize: 17,
      fontFamily: "Helvetica-Bold",
    },

    tiny: {
      marginTop: 3,
      color: "#879693",
      fontSize: 6.5,
    },

    infoGrid: {
      flexDirection: "row",
      gap: 7,
      marginBottom: 14,
    },

    infoCard: {
      flexGrow: 1,
      flexBasis: 0,
      minHeight: 48,
      padding: 9,
      borderWidth: 1,
      borderColor: "#E2E9E7",
      borderRadius: 5,
      backgroundColor: "#FFFFFF",
    },

    infoValue: {
      marginTop: 4,
      fontSize: 8,
      fontFamily: "Helvetica-Bold",
      color: "#0B2F33",
    },

    message: {
      marginBottom: 14,
      padding: 10,
      borderWidth: 1,
      borderColor: "#E2E9E7",
      borderRadius: 5,
      backgroundColor: "#FAFBFB",
    },

    messageText: {
      marginTop: 5,
      color: "#5E7470",
      fontSize: 7.5,
      lineHeight: 1.5,
    },

    section: {
      marginBottom: 14,
      borderWidth: 1,
      borderColor: "#E0E8E5",
      borderRadius: 6,
    },

    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      paddingVertical: 9,
      paddingHorizontal: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#E7ECEA",
      backgroundColor: "#FAFBFB",
    },

    numberBadge: {
      width: 23,
      height: 23,
      paddingTop: 7,
      borderRadius: 4,
      backgroundColor: "#EAF7F1",
      color: "#22B573",
      textAlign: "center",
      fontSize: 6.5,
      fontFamily: "Helvetica-Bold",
    },

    sectionTitle: {
      fontSize: 9.5,
      fontFamily: "Helvetica-Bold",
      color: "#0B2F33",
    },

    sectionSubtitle: {
      marginTop: 2,
      color: "#83928F",
      fontSize: 6.5,
    },

    tableHeader: {
      flexDirection: "row",
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#E8EEEC",
      backgroundColor: "#FCFDFD",
    },

    tableRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderBottomWidth: 0.5,
      borderBottomColor: "#ECF0EF",
    },

    serviceColumn: {
      width: "55%",
      paddingRight: 8,
    },

    qtyColumn: {
      width: "13%",
      color: "#6E817D",
      fontSize: 7,
    },

    priceColumn: {
      width: "16%",
      color: "#6E817D",
      fontSize: 7,
      textAlign: "right",
    },

    totalColumn: {
      width: "16%",
      color: "#0B2F33",
      fontSize: 7,
      fontFamily: "Helvetica-Bold",
      textAlign: "right",
    },

    serviceName: {
      fontSize: 7.5,
      fontFamily: "Helvetica-Bold",
      color: "#0B2F33",
    },

    serviceDescription: {
      marginTop: 2,
      paddingRight: 8,
      color: "#7C8D89",
      fontSize: 6.5,
      lineHeight: 1.4,
    },

    optionalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
      paddingVertical: 7,
      paddingHorizontal: 10,
      borderBottomWidth: 0.5,
      borderBottomColor: "#ECEFED",
    },

    optionalName: {
      flexGrow: 1,
      flexBasis: 0,
      fontSize: 7.5,
      fontFamily: "Helvetica-Bold",
    },

    optionalPrice: {
      color: "#22B573",
      fontSize: 7.5,
      fontFamily: "Helvetica-Bold",
    },

    totalsWrap: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginBottom: 14,
    },

    totals: {
      width: 230,
      padding: 11,
      borderWidth: 1,
      borderColor: "#DDE7E3",
      borderRadius: 6,
      backgroundColor: "#F8FAF9",
    },

    totalLine: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 10,
      marginBottom: 5,
    },

    totalLabel: {
      color: "#70837F",
      fontSize: 7,
    },

    totalValue: {
      color: "#0B2F33",
      fontSize: 7,
      fontFamily: "Helvetica-Bold",
    },

    grandTotal: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 10,
      marginTop: 3,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: "#D9E4E0",
    },

    grandLabel: {
      fontSize: 8,
      fontFamily: "Helvetica-Bold",
    },

    grandValue: {
      color: "#22B573",
      fontSize: 12,
      fontFamily: "Helvetica-Bold",
    },

    termsGrid: {
      flexDirection: "row",
      gap: 7,
      marginBottom: 14,
    },

    termCard: {
      flexGrow: 1,
      flexBasis: 0,
      padding: 9,
      borderWidth: 1,
      borderColor: "#E1E9E6",
      borderRadius: 5,
    },

    termText: {
      marginTop: 5,
      color: "#607571",
      fontSize: 6.8,
      lineHeight: 1.45,
    },

    acceptance: {
      padding: 11,
      borderWidth: 1,
      borderColor: "#D8E8E1",
      borderRadius: 6,
      backgroundColor: "#F4FAF7",
    },

    acceptanceTitle: {
      color: "#22B573",
      fontSize: 7,
      fontFamily: "Helvetica-Bold",
    },

    acceptanceText: {
      marginTop: 5,
      color: "#5E7470",
      fontSize: 6.8,
      lineHeight: 1.45,
    },

    footer: {
      position: "absolute",
      left: 36,
      right: 36,
      bottom: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      paddingTop: 7,
      borderTopWidth: 0.5,
      borderTopColor: "#E2E9E7",
      color: "#899794",
      fontSize: 6,
    },
  });


function OfferVersionDocument({
  snapshot,
  versionNumber,
}: CreateOfferVersionPdfInput) {

  const root =
    asObject(snapshot);

  const offer =
    asObject(
      root.offer
    );

  const customer =
    asObject(
      root.customer
    );

  const contact =
    asObject(
      root.contact
    );

  const allItems =
    asArray(
      root.items
    )
      .map(
        asObject
      )
      .filter(
        (
          item
        ) =>
          boolValue(
            item.customer_visible,
            true
          )
      );


  const requiredItems =
    allItems.filter(
      (
        item
      ) =>
        !boolValue(
          item.is_optional
        )
    );


  const optionalItems =
    allItems.filter(
      (
        item
      ) =>
        boolValue(
          item.is_optional
        )
    );


  const currency =
    textValue(
      offer.currency,
      "SEK"
    );


  const offerNumber =
    textValue(
      offer.offer_number,
      "Offert"
    );


  const customerName =
    textValue(
      customer.name,
      "Kund"
    );


  const recipient =
    textValue(
      contact.email ||
      customer.email ||
      offer.recipient_email,
      "Ej angivet"
    );


  const description =
    textValue(
      offer.description
    );


  const customerMessage =
    textValue(
      offer.customer_message
    );


  const paymentTerms =
    textValue(
      offer.payment_terms,
      "Enligt överenskommelse."
    );


  const termsText =
    textValue(
      offer.terms_text,
      "Enligt offert."
    );


  return (
    <Document
      title={`${offerNumber} - Version ${versionNumber}`}
      author="Vorix"
      subject="Offert"
      creator="Vorix"
    >
      <Page
        size="A4"
        style={
          styles.page
        }
        wrap
      >
        <View
          style={
            styles.brandRow
          }
        >
          <View>
            <Text
              style={
                styles.brand
              }
            >
              VORIX
            </Text>

            <Text
              style={
                styles.tagline
              }
            >
              Digital products. Built to last.
            </Text>
          </View>

          <Text
            style={
              styles.version
            }
          >
            VERSION {versionNumber}
          </Text>
        </View>


        <View
          style={
            styles.hero
          }
        >
          <View
            style={
              styles.heroMain
            }
          >
            <Text
              style={
                styles.eyebrow
              }
            >
              OFFERT · {offerNumber}
            </Text>

            <Text
              style={
                styles.title
              }
            >
              {textValue(
                offer.title,
                "Offertförslag"
              )}
            </Text>

            {description && (
              <Text
                style={
                  styles.description
                }
              >
                {description}
              </Text>
            )}
          </View>


          <View
            style={
              styles.totalHero
            }
          >
            <Text
              style={
                styles.label
              }
            >
              TOTALT
            </Text>

            <Text
              style={
                styles.heroAmount
              }
            >
              {money(
                numberValue(
                  offer.total_inc_vat
                ),
                currency
              )}
            </Text>

            <Text
              style={
                styles.tiny
              }
            >
              inklusive moms
            </Text>
          </View>
        </View>


        <View
          style={
            styles.infoGrid
          }
        >
          <View
            style={
              styles.infoCard
            }
          >
            <Text
              style={
                styles.label
              }
            >
              KUND
            </Text>

            <Text
              style={
                styles.infoValue
              }
            >
              {customerName}
            </Text>
          </View>


          <View
            style={
              styles.infoCard
            }
          >
            <Text
              style={
                styles.label
              }
            >
              MOTTAGARE
            </Text>

            <Text
              style={
                styles.infoValue
              }
            >
              {recipient}
            </Text>
          </View>


          <View
            style={
              styles.infoCard
            }
          >
            <Text
              style={
                styles.label
              }
            >
              GILTIG TILL
            </Text>

            <Text
              style={
                styles.infoValue
              }
            >
              {formatDate(
                offer.valid_until
              )}
            </Text>
          </View>
        </View>


        {customerMessage && (
          <View
            style={
              styles.message
            }
            wrap={false}
          >
            <Text
              style={
                styles.label
              }
            >
              MEDDELANDE FRÅN VORIX
            </Text>

            <Text
              style={
                styles.messageText
              }
            >
              {customerMessage}
            </Text>
          </View>
        )}


        <View
          style={
            styles.section
          }
        >
          <View
            style={
              styles.sectionHeader
            }
            wrap={false}
          >
            <Text
              style={
                styles.numberBadge
              }
            >
              01
            </Text>

            <View>
              <Text
                style={
                  styles.sectionTitle
                }
              >
                Tjänster & omfattning
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Det som ingår i grundofferten.
              </Text>
            </View>
          </View>


          <View
            style={
              styles.tableHeader
            }
            wrap={false}
          >
            <Text
              style={
                styles.serviceColumn
              }
            >
              TJÄNST
            </Text>

            <Text
              style={
                styles.qtyColumn
              }
            >
              ANTAL
            </Text>

            <Text
              style={
                styles.priceColumn
              }
            >
              PRIS
            </Text>

            <Text
              style={
                styles.totalColumn
              }
            >
              BELOPP
            </Text>
          </View>


          {requiredItems.map(
            (
              item,
              index
            ) => (
              <View
                key={
                  textValue(
                    item.id,
                    String(index)
                  )
                }
                style={
                  styles.tableRow
                }
                wrap={false}
              >
                <View
                  style={
                    styles.serviceColumn
                  }
                >
                  <Text
                    style={
                      styles.serviceName
                    }
                  >
                    {textValue(
                      item.name,
                      "Tjänst"
                    )}
                  </Text>

                  {textValue(
                    item.description
                  ) && (
                    <Text
                      style={
                        styles.serviceDescription
                      }
                    >
                      {textValue(
                        item.description
                      )}
                    </Text>
                  )}
                </View>

                <Text
                  style={
                    styles.qtyColumn
                  }
                >
                  {numberValue(
                    item.quantity
                  )}{" "}
                  {textValue(
                    item.unit_code
                  )}
                </Text>

                <Text
                  style={
                    styles.priceColumn
                  }
                >
                  {money(
                    numberValue(
                      item.unit_price_ex_vat
                    ),
                    currency
                  )}
                </Text>

                <Text
                  style={
                    styles.totalColumn
                  }
                >
                  {money(
                    numberValue(
                      item.subtotal_ex_vat
                    ),
                    currency
                  )}
                </Text>
              </View>
            )
          )}
        </View>


        {optionalItems.length >
          0 && (
          <View
            style={
              styles.section
            }
          >
            <View
              style={
                styles.sectionHeader
              }
              wrap={false}
            >
              <Text
                style={
                  styles.numberBadge
                }
              >
                02
              </Text>

              <View>
                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Valbara tillägg
                </Text>

                <Text
                  style={
                    styles.sectionSubtitle
                  }
                >
                  Ingår inte i grundpriset.
                </Text>
              </View>
            </View>

            {optionalItems.map(
              (
                item,
                index
              ) => (
                <View
                  key={
                    textValue(
                      item.id,
                      String(index)
                    )
                  }
                  style={
                    styles.optionalRow
                  }
                  wrap={false}
                >
                  <Text
                    style={
                      styles.optionalName
                    }
                  >
                    {textValue(
                      item.name,
                      "Tillägg"
                    )}
                  </Text>

                  <Text
                    style={
                      styles.optionalPrice
                    }
                  >
                    +{" "}
                    {money(
                      numberValue(
                        item.total_inc_vat
                      ),
                      currency
                    )}
                  </Text>
                </View>
              )
            )}
          </View>
        )}


        <View
          style={
            styles.totalsWrap
          }
          wrap={false}
        >
          <View
            style={
              styles.totals
            }
          >
            <View
              style={
                styles.totalLine
              }
            >
              <Text
                style={
                  styles.totalLabel
                }
              >
                Delsumma
              </Text>

              <Text
                style={
                  styles.totalValue
                }
              >
                {money(
                  numberValue(
                    offer.subtotal_before_discount
                  ),
                  currency
                )}
              </Text>
            </View>


            {numberValue(
              offer.discount_amount
            ) >
              0 && (
              <View
                style={
                  styles.totalLine
                }
              >
                <Text
                  style={
                    styles.totalLabel
                  }
                >
                  {textValue(
                    offer.discount_label,
                    "Rabatt"
                  )}
                </Text>

                <Text
                  style={
                    styles.totalValue
                  }
                >
                  -{" "}
                  {money(
                    numberValue(
                      offer.discount_amount
                    ),
                    currency
                  )}
                </Text>
              </View>
            )}


            <View
              style={
                styles.totalLine
              }
            >
              <Text
                style={
                  styles.totalLabel
                }
              >
                Moms
              </Text>

              <Text
                style={
                  styles.totalValue
                }
              >
                {money(
                  numberValue(
                    offer.vat_amount
                  ),
                  currency
                )}
              </Text>
            </View>


            <View
              style={
                styles.grandTotal
              }
            >
              <Text
                style={
                  styles.grandLabel
                }
              >
                Totalt
              </Text>

              <Text
                style={
                  styles.grandValue
                }
              >
                {money(
                  numberValue(
                    offer.total_inc_vat
                  ),
                  currency
                )}
              </Text>
            </View>
          </View>
        </View>


        <View
          style={
            styles.termsGrid
          }
        >
          <View
            style={
              styles.termCard
            }
          >
            <Text
              style={
                styles.label
              }
            >
              BETALNINGSVILLKOR
            </Text>

            <Text
              style={
                styles.termText
              }
            >
              {paymentTerms}
            </Text>
          </View>

          <View
            style={
              styles.termCard
            }
          >
            <Text
              style={
                styles.label
              }
            >
              OFFERTVILLKOR
            </Text>

            <Text
              style={
                styles.termText
              }
            >
              {termsText}
            </Text>
          </View>
        </View>


        <View
          style={
            styles.acceptance
          }
        >
          <Text
            style={
              styles.acceptanceTitle
            }
          >
            DIGITAL OFFERT
          </Text>

          <Text
            style={
              styles.acceptanceText
            }
          >
            Detta dokument representerar den låsta
            offertversion som skickades till kunden.
            Eventuella senare ändringar tillhör en ny
            versionshistorik och påverkar inte detta dokument.
          </Text>
        </View>


        <View
          style={
            styles.footer
          }
          fixed
        >
          <Text>
            Vorix · {offerNumber} · Version {versionNumber}
          </Text>

          <Text
            render={({
              pageNumber,
              totalPages,
            }) =>
              `Sida ${pageNumber} av ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}


export async function createOfferVersionPdf(
  input:
    CreateOfferVersionPdfInput
) {
  return renderToBuffer(
    <OfferVersionDocument
      snapshot={
        input.snapshot
      }
      versionNumber={
        input.versionNumber
      }
    />
  );
}