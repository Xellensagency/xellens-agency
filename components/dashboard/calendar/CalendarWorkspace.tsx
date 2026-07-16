"use client";

import Link from "next/link";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Monitor,
  Plus,
  Search,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import type {
  CalendarEventColor,
  CalendarEventItem,
  CalendarEventType,
  CalendarPageData,
} from "@/lib/dashboard/calendar/calendar-types";

import styles from "./CalendarWorkspace.module.css";

type CalendarWorkspaceProps = {
  data: CalendarPageData;
};

type CalendarView =
  | "day"
  | "week"
  | "month"
  | "agenda";

const DAY_START = 8;
const DAY_END = 18;
const HOUR_HEIGHT = 68;

const weekdayNames = [
  "Mån",
  "Tis",
  "Ons",
  "Tors",
  "Fre",
  "Lör",
  "Sön",
];

const eventLabels: Record<
  CalendarEventType,
  string
> = {
  meeting: "Möte",
  customer_meeting: "Kundmöte",
  workshop: "Workshop",
  deadline: "Deadline",
  follow_up: "Uppföljning",
  internal: "Internt",
};

function dateKey(
  date: Date
) {
  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function startOfDay(
  value: Date
) {
  const date =
    new Date(value);

  date.setHours(0, 0, 0, 0);

  return date;
}

function startOfWeek(
  value: Date
) {
  const date =
    startOfDay(value);

  const weekday =
    (date.getDay() + 6) % 7;

  date.setDate(
    date.getDate() - weekday
  );

  return date;
}

function addDays(
  value: Date,
  amount: number
) {
  const date =
    new Date(value);

  date.setDate(
    date.getDate() + amount
  );

  return date;
}

function addMonths(
  value: Date,
  amount: number
) {
  const date =
    new Date(value);

  date.setDate(1);

  date.setMonth(
    date.getMonth() + amount
  );

  return date;
}

function sameDay(
  first: Date,
  second: Date
) {
  return (
    first.getFullYear() ===
      second.getFullYear() &&
    first.getMonth() ===
      second.getMonth() &&
    first.getDate() ===
      second.getDate()
  );
}

function formatTime(
  value: string
) {
  return new Intl.DateTimeFormat(
    "sv-SE",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(new Date(value));
}

function formatFullDate(
  value: Date
) {
  return new Intl.DateTimeFormat(
    "sv-SE",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(value);
}

function formatMonth(
  value: Date
) {
  return new Intl.DateTimeFormat(
    "sv-SE",
    {
      month: "long",
      year: "numeric",
    }
  ).format(value);
}

function weekLabel(
  weekStart: Date
) {
  const weekEnd =
    addDays(weekStart, 6);

  const startMonth =
    weekStart.toLocaleDateString(
      "sv-SE",
      {
        month: "short",
      }
    );

  const endMonth =
    weekEnd.toLocaleDateString(
      "sv-SE",
      {
        month: "short",
      }
    );

  if (
    weekStart.getMonth() ===
    weekEnd.getMonth()
  ) {
    return `${weekStart.getDate()}–${weekEnd.getDate()} ${endMonth} ${weekEnd.getFullYear()}`;
  }

  return `${weekStart.getDate()} ${startMonth} – ${weekEnd.getDate()} ${endMonth} ${weekEnd.getFullYear()}`;
}

function eventColorClass(
  color: CalendarEventColor
) {
  switch (color) {
    case "teal":
      return styles.eventTeal;

    case "purple":
      return styles.eventPurple;

    case "red":
      return styles.eventRed;

    case "orange":
      return styles.eventOrange;

    case "slate":
      return styles.eventSlate;

    default:
      return styles.eventBlue;
  }
}

function eventPosition(
  event: CalendarEventItem
) {
  const start =
    new Date(event.startAt);

  const end =
    new Date(event.endAt);

  const startMinutes =
    start.getHours() * 60 +
    start.getMinutes();

  const endMinutes =
    end.getHours() * 60 +
    end.getMinutes();

  const calendarStart =
    DAY_START * 60;

  const visibleStart =
    Math.max(
      startMinutes,
      calendarStart
    );

  const visibleEnd =
    Math.min(
      endMinutes,
      DAY_END * 60
    );

  const top =
    ((visibleStart -
      calendarStart) /
      60) *
    HOUR_HEIGHT;

  const height =
    Math.max(
      ((visibleEnd -
        visibleStart) /
        60) *
        HOUR_HEIGHT,
      38
    );

  return {
    top,
    height,
  };
}

function eventFitsTimeline(
  event: CalendarEventItem
) {
  const start =
    new Date(event.startAt);

  const end =
    new Date(event.endAt);

  const startMinutes =
    start.getHours() * 60 +
    start.getMinutes();

  const endMinutes =
    end.getHours() * 60 +
    end.getMinutes();

  return (
    endMinutes > DAY_START * 60 &&
    startMinutes < DAY_END * 60
  );
}

function eventSubtitle(
  event: CalendarEventItem
) {
  return (
    event.projectName ||
    event.customerName ||
    event.description ||
    eventLabels[event.eventType]
  );
}

export default function CalendarWorkspace({
  data,
}: CalendarWorkspaceProps) {
  const [
    selectedDate,
    setSelectedDate,
  ] = useState(
    new Date(
      `${data.today}T12:00:00`
    )
  );

  const [
    activeView,
    setActiveView,
  ] = useState<CalendarView>(
    "week"
  );

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    typeFilter,
    setTypeFilter,
  ] = useState("all");

  const [
    customerFilter,
    setCustomerFilter,
  ] = useState("all");

  const [
    onlyMine,
    setOnlyMine,
  ] = useState(false);

  const now =
    new Date();

  const weekStart =
    useMemo(
      () =>
        startOfWeek(
          selectedDate
        ),
      [selectedDate]
    );

  const weekDays =
    useMemo(
      () =>
        Array.from(
          { length: 7 },
          (_, index) =>
            addDays(
              weekStart,
              index
            )
        ),
      [weekStart]
    );

  const filteredEvents =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return data.events
        .filter((event) => {
          if (
            event.status ===
            "cancelled"
          ) {
            return false;
          }

          if (
            typeFilter !== "all" &&
            event.eventType !==
              typeFilter
          ) {
            return false;
          }

          if (
            customerFilter !==
              "all" &&
            event.customerId !==
              customerFilter
          ) {
            return false;
          }

          if (
            onlyMine &&
            event.ownerId !==
              data.currentUserId
          ) {
            return false;
          }

          if (!query) {
            return true;
          }

          return [
            event.title,
            event.customerName ?? "",
            event.projectName ?? "",
            event.description ?? "",
          ]
            .join(" ")
            .toLowerCase()
            .includes(query);
        })
        .sort(
          (first, second) =>
            new Date(
              first.startAt
            ).getTime() -
            new Date(
              second.startAt
            ).getTime()
        );
    }, [
      customerFilter,
      data.currentUserId,
      data.events,
      onlyMine,
      search,
      typeFilter,
    ]);

  const weekEvents =
    filteredEvents.filter(
      (event) => {
        const eventDate =
          new Date(event.startAt);

        return (
          eventDate >=
            startOfDay(weekStart) &&
          eventDate <
            startOfDay(
              addDays(
                weekStart,
                7
              )
            )
        );
      }
    );

  const dayEvents =
    filteredEvents.filter(
      (event) =>
        sameDay(
          new Date(event.startAt),
          selectedDate
        )
    );

  const monthStart =
    new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      1,
      12
    );

  const monthCalendarStart =
    startOfWeek(monthStart);

  const monthDays =
    Array.from(
      { length: 42 },
      (_, index) =>
        addDays(
          monthCalendarStart,
          index
        )
    );

  const agendaStart =
    startOfDay(selectedDate);

  const agendaEnd =
    addDays(
      agendaStart,
      90
    );

  const agendaEvents =
    filteredEvents.filter(
      (event) => {
        const eventDate =
          new Date(event.startAt);

        return (
          eventDate >=
            agendaStart &&
          eventDate <
            agendaEnd
        );
      }
    );

  const upcomingEvents =
    filteredEvents
      .filter(
        (event) =>
          new Date(event.endAt) >=
          now
      )
      .slice(0, 5);

  const deadlines =
    filteredEvents
      .filter(
        (event) =>
          event.eventType ===
            "deadline" &&
          new Date(event.endAt) >=
            now
      )
      .slice(0, 4);

  const miniCalendarStart =
    startOfWeek(monthStart);

  const miniCalendarDays =
    Array.from(
      { length: 42 },
      (_, index) =>
        addDays(
          miniCalendarStart,
          index
        )
    );

  const showWeekCurrentTime =
    activeView === "week" &&
    now >=
      startOfDay(weekStart) &&
    now <
      startOfDay(
        addDays(
          weekStart,
          7
        )
      ) &&
    now.getHours() >=
      DAY_START &&
    now.getHours() <=
      DAY_END;

  const showDayCurrentTime =
    activeView === "day" &&
    sameDay(
      selectedDate,
      now
    ) &&
    now.getHours() >=
      DAY_START &&
    now.getHours() <=
      DAY_END;

  const currentTimeTop =
    ((now.getHours() * 60 +
      now.getMinutes() -
      DAY_START * 60) /
      60) *
    HOUR_HEIGHT;

  function movePeriod(
    direction: -1 | 1
  ) {
    switch (activeView) {
      case "day":
        setSelectedDate(
          addDays(
            selectedDate,
            direction
          )
        );
        break;

      case "month":
        setSelectedDate(
          addMonths(
            selectedDate,
            direction
          )
        );
        break;

      case "agenda":
        setSelectedDate(
          addDays(
            selectedDate,
            direction * 30
          )
        );
        break;

      default:
        setSelectedDate(
          addDays(
            selectedDate,
            direction * 7
          )
        );
    }
  }

  function currentPeriodLabel() {
    switch (activeView) {
      case "day":
        return formatFullDate(
          selectedDate
        );

      case "month":
        return formatMonth(
          selectedDate
        );

      case "agenda":
        return `Agenda från ${selectedDate.toLocaleDateString(
          "sv-SE"
        )}`;

      default:
        return weekLabel(
          weekStart
        );
    }
  }

  function openDay(
    date: Date
  ) {
    setSelectedDate(
      new Date(date)
    );

    setActiveView("day");
  }

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <div>
          <h1>Kalender</h1>

          <p>
            Översikt av möten,
            deadlines och viktiga
            händelser.
          </p>
        </div>

        <Link
          href="/dashboard/kalender/ny"
          className={
            styles.createButton
          }
        >
          <Plus size={17} />
          Ny händelse
        </Link>
      </header>

      <div className={styles.toolbar}>
        <div
          className={
            styles.dateNavigation
          }
        >
          <button
            type="button"
            onClick={() =>
              setSelectedDate(
                new Date(
                  `${data.today}T12:00:00`
                )
              )
            }
          >
            Idag
          </button>

          <button
            type="button"
            aria-label="Föregående period"
            onClick={() =>
              movePeriod(-1)
            }
          >
            <ChevronLeft
              size={17}
            />
          </button>

          <button
            type="button"
            aria-label="Nästa period"
            onClick={() =>
              movePeriod(1)
            }
          >
            <ChevronRight
              size={17}
            />
          </button>

          <strong>
            {currentPeriodLabel()}
          </strong>
        </div>

        <div className={styles.views}>
          {[
            [
              "day",
              "Dag",
            ],
            [
              "week",
              "Vecka",
            ],
            [
              "month",
              "Månad",
            ],
            [
              "agenda",
              "Agenda",
            ],
          ].map(
            ([value, label]) => (
              <button
                key={value}
                type="button"
                className={
                  activeView === value
                    ? styles.activeView
                    : ""
                }
                onClick={() =>
                  setActiveView(
                    value as CalendarView
                  )
                }
              >
                {label}
              </button>
            )
          )}
        </div>
      </div>

      <div className={styles.layout}>
        <main className={styles.mainColumn}>
          {activeView === "week" && (
            <section
              className={
                styles.calendarCard
              }
            >
              <div
                className={
                  styles.weekHeader
                }
              >
                <div />

                {weekDays.map(
                  (day, index) => (
                    <button
                      type="button"
                      key={dateKey(day)}
                      className={
                        sameDay(
                          day,
                          now
                        )
                          ? styles.todayHeader
                          : ""
                      }
                      onClick={() =>
                        openDay(day)
                      }
                    >
                      <span>
                        {
                          weekdayNames[
                            index
                          ]
                        }
                      </span>

                      <strong>
                        {day.getDate()}
                      </strong>
                    </button>
                  )
                )}
              </div>

              <div
                className={
                  styles.weekBody
                }
              >
                <div
                  className={
                    styles.timeColumn
                  }
                >
                  {Array.from(
                    {
                      length:
                        DAY_END -
                        DAY_START +
                        1,
                    },
                    (_, index) => {
                      const hour =
                        DAY_START +
                        index;

                      return (
                        <span
                          key={hour}
                          style={{
                            top:
                              index *
                              HOUR_HEIGHT,
                          }}
                        >
                          {String(
                            hour
                          ).padStart(
                            2,
                            "0"
                          )}
                          :00
                        </span>
                      );
                    }
                  )}
                </div>

                <div
                  className={
                    styles.daysGrid
                  }
                >
                  {weekDays.map(
                    (day) => {
                      const dayItems =
                        weekEvents.filter(
                          (event) =>
                            sameDay(
                              new Date(
                                event.startAt
                              ),
                              day
                            ) &&
                            eventFitsTimeline(
                              event
                            )
                        );

                      return (
                        <div
                          key={dateKey(
                            day
                          )}
                          className={
                            styles.dayColumn
                          }
                        >
                          {dayItems.map(
                            (event) => {
                              const position =
                                eventPosition(
                                  event
                                );

                              return (
                                <Link
                                  key={
                                    event.id
                                  }
                                  href={`/dashboard/kalender/${event.id}`}
                                  className={[
                                    styles.event,
                                    eventColorClass(
                                      event.colorKey
                                    ),
                                    event.status ===
                                    "completed"
                                      ? styles.completedEvent
                                      : "",
                                  ]
                                    .filter(
                                      Boolean
                                    )
                                    .join(
                                      " "
                                    )}
                                  style={{
                                    top:
                                      position.top,
                                    height:
                                      position.height,
                                  }}
                                >
                                  <time>
                                    {formatTime(
                                      event.startAt
                                    )}{" "}
                                    –{" "}
                                    {formatTime(
                                      event.endAt
                                    )}
                                  </time>

                                  <strong>
                                    {
                                      event.title
                                    }
                                  </strong>

                                  <span>
                                    {eventSubtitle(
                                      event
                                    )}
                                  </span>

                                  {event.locationType !==
                                    "none" && (
                                    <small>
                                      {event.locationType ===
                                      "online" ? (
                                        <Monitor
                                          size={
                                            11
                                          }
                                        />
                                      ) : (
                                        <MapPin
                                          size={
                                            11
                                          }
                                        />
                                      )}

                                      {event.locationName ||
                                        (event.locationType ===
                                        "online"
                                          ? "Online"
                                          : "Plats angiven")}
                                    </small>
                                  )}
                                </Link>
                              );
                            }
                          )}
                        </div>
                      );
                    }
                  )}

                  {showWeekCurrentTime && (
                    <div
                      className={
                        styles.currentTimeLine
                      }
                      style={{
                        top:
                          currentTimeTop,
                      }}
                    >
                      <span />
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {activeView === "day" && (
            <section
              className={
                styles.calendarCard
              }
            >
              <header
                className={
                  styles.dayViewHeader
                }
              >
                <div>
                  <span>
                    {selectedDate.toLocaleDateString(
                      "sv-SE",
                      {
                        weekday:
                          "long",
                      }
                    )}
                  </span>

                  <strong>
                    {selectedDate.getDate()}
                  </strong>
                </div>

                <p>
                  {dayEvents.length}{" "}
                  {dayEvents.length === 1
                    ? "händelse"
                    : "händelser"}
                </p>
              </header>

              <div
                className={
                  styles.dayViewBody
                }
              >
                <div
                  className={
                    styles.timeColumn
                  }
                >
                  {Array.from(
                    {
                      length:
                        DAY_END -
                        DAY_START +
                        1,
                    },
                    (_, index) => {
                      const hour =
                        DAY_START +
                        index;

                      return (
                        <span
                          key={hour}
                          style={{
                            top:
                              index *
                              HOUR_HEIGHT,
                          }}
                        >
                          {String(
                            hour
                          ).padStart(
                            2,
                            "0"
                          )}
                          :00
                        </span>
                      );
                    }
                  )}
                </div>

                <div
                  className={
                    styles.dayTimeline
                  }
                >
                  {dayEvents
                    .filter(
                      eventFitsTimeline
                    )
                    .map((event) => {
                      const position =
                        eventPosition(
                          event
                        );

                      return (
                        <Link
                          key={event.id}
                          href={`/dashboard/kalender/${event.id}`}
                          className={[
                            styles.event,
                            styles.dayEvent,
                            eventColorClass(
                              event.colorKey
                            ),
                          ].join(" ")}
                          style={{
                            top:
                              position.top,
                            height:
                              position.height,
                          }}
                        >
                          <time>
                            {formatTime(
                              event.startAt
                            )}{" "}
                            –{" "}
                            {formatTime(
                              event.endAt
                            )}
                          </time>

                          <strong>
                            {event.title}
                          </strong>

                          <span>
                            {eventSubtitle(
                              event
                            )}
                          </span>

                          {event.locationName && (
                            <small>
                              <MapPin
                                size={11}
                              />

                              {
                                event.locationName
                              }
                            </small>
                          )}
                        </Link>
                      );
                    })}

                  {showDayCurrentTime && (
                    <div
                      className={
                        styles.currentTimeLine
                      }
                      style={{
                        top:
                          currentTimeTop,
                      }}
                    >
                      <span />
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {activeView === "month" && (
            <section
              className={
                styles.calendarCard
              }
            >
              <div
                className={
                  styles.monthWeekdays
                }
              >
                {weekdayNames.map(
                  (weekday) => (
                    <span
                      key={weekday}
                    >
                      {weekday}
                    </span>
                  )
                )}
              </div>

              <div
                className={
                  styles.monthGrid
                }
              >
                {monthDays.map(
                  (day) => {
                    const dayItems =
                      filteredEvents.filter(
                        (event) =>
                          sameDay(
                            new Date(
                              event.startAt
                            ),
                            day
                          )
                      );

                    return (
                      <article
                        key={dateKey(
                          day
                        )}
                        className={[
                          styles.monthCell,
                          day.getMonth() !==
                          selectedDate.getMonth()
                            ? styles.monthOutside
                            : "",
                          sameDay(
                            day,
                            now
                          )
                            ? styles.monthToday
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        <button
                          type="button"
                          className={
                            styles.monthDayButton
                          }
                          onClick={() =>
                            openDay(day)
                          }
                        >
                          {day.getDate()}
                        </button>

                        <div
                          className={
                            styles.monthEvents
                          }
                        >
                          {dayItems
                            .slice(0, 3)
                            .map(
                              (event) => (
                                <Link
                                  key={
                                    event.id
                                  }
                                  href={`/dashboard/kalender/${event.id}`}
                                  className={[
                                    styles.monthEvent,
                                    eventColorClass(
                                      event.colorKey
                                    ),
                                  ].join(
                                    " "
                                  )}
                                >
                                  <time>
                                    {formatTime(
                                      event.startAt
                                    )}
                                  </time>

                                  <span>
                                    {
                                      event.title
                                    }
                                  </span>
                                </Link>
                              )
                            )}

                          {dayItems.length >
                            3 && (
                            <button
                              type="button"
                              className={
                                styles.monthMore
                              }
                              onClick={() =>
                                openDay(day)
                              }
                            >
                              +
                              {dayItems.length -
                                3}{" "}
                              fler
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            </section>
          )}

          {activeView === "agenda" && (
            <section
              className={
                styles.calendarCard
              }
            >
              <header
                className={
                  styles.agendaHeader
                }
              >
                <div>
                  <h2>Agenda</h2>

                  <p>
                    Händelser under de
                    kommande 90 dagarna.
                  </p>
                </div>

                <strong>
                  {
                    agendaEvents.length
                  }{" "}
                  händelser
                </strong>
              </header>

              {agendaEvents.length ===
              0 ? (
                <div
                  className={
                    styles.emptyState
                  }
                >
                  Inga händelser under
                  vald period.
                </div>
              ) : (
                <div
                  className={
                    styles.agendaList
                  }
                >
                  {agendaEvents.map(
                    (event) => (
                      <Link
                        key={event.id}
                        href={`/dashboard/kalender/${event.id}`}
                        className={
                          styles.agendaItem
                        }
                      >
                        <div
                          className={
                            styles.agendaDate
                          }
                        >
                          <span>
                            {new Date(
                              event.startAt
                            ).toLocaleDateString(
                              "sv-SE",
                              {
                                month:
                                  "short",
                              }
                            )}
                          </span>

                          <strong>
                            {new Date(
                              event.startAt
                            ).getDate()}
                          </strong>
                        </div>

                        <span
                          className={[
                            styles.agendaColor,
                            eventColorClass(
                              event.colorKey
                            ),
                          ].join(" ")}
                        />

                        <div
                          className={
                            styles.agendaContent
                          }
                        >
                          <strong>
                            {event.title}
                          </strong>

                          <small>
                            {eventSubtitle(
                              event
                            )}
                          </small>
                        </div>

                        <time>
                          {formatTime(
                            event.startAt
                          )}{" "}
                          –{" "}
                          {formatTime(
                            event.endAt
                          )}
                        </time>

                        <div
                          className={
                            styles.agendaType
                          }
                        >
                          {
                            eventLabels[
                              event
                                .eventType
                            ]
                          }
                        </div>

                        <div
                          className={
                            styles.agendaLocation
                          }
                        >
                          {event.locationType ===
                          "online" ? (
                            <Monitor
                              size={14}
                            />
                          ) : event.locationName ? (
                            <MapPin
                              size={14}
                            />
                          ) : null}

                          <span>
                            {event.locationName ||
                              (event.locationType ===
                              "online"
                                ? "Online"
                                : "Ingen plats")}
                          </span>
                        </div>
                      </Link>
                    )
                  )}
                </div>
              )}
            </section>
          )}

          <section
            className={
              styles.deadlineSection
            }
          >
            <header>
              <div>
                <h2>
                  Kommande deadlines
                </h2>

                <p>
                  Viktiga leveranser och
                  slutdatum.
                </p>
              </div>
            </header>

            <div
              className={
                styles.deadlineGrid
              }
            >
              {deadlines.length ===
              0 ? (
                <div
                  className={
                    styles.emptyState
                  }
                >
                  Inga kommande deadlines.
                </div>
              ) : (
                deadlines.map(
                  (event) => {
                    const daysLeft =
                      Math.max(
                        Math.ceil(
                          (new Date(
                            event.startAt
                          ).getTime() -
                            now.getTime()) /
                            86400000
                        ),
                        0
                      );

                    return (
                      <Link
                        href={`/dashboard/kalender/${event.id}`}
                        key={event.id}
                      >
                        <span>
                          <CalendarDays
                            size={18}
                          />
                        </span>

                        <div>
                          <strong>
                            {event.title}
                          </strong>

                          <small>
                            {event.customerName ||
                              event.projectName ||
                              "Intern deadline"}
                          </small>
                        </div>

                        <time>
                          {new Date(
                            event.startAt
                          ).toLocaleDateString(
                            "sv-SE"
                          )}
                        </time>

                        <em>
                          {daysLeft === 0
                            ? "Idag"
                            : `${daysLeft} dagar kvar`}
                        </em>
                      </Link>
                    );
                  }
                )
              )}
            </div>
          </section>
        </main>

        <aside className={styles.sidebar}>
          <section className={styles.sideCard}>
            <header>
              <strong>
                {formatMonth(
                  selectedDate
                )}
              </strong>

              <div>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedDate(
                      addMonths(
                        selectedDate,
                        -1
                      )
                    )
                  }
                >
                  <ChevronLeft
                    size={15}
                  />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedDate(
                      addMonths(
                        selectedDate,
                        1
                      )
                    )
                  }
                >
                  <ChevronRight
                    size={15}
                  />
                </button>
              </div>
            </header>

            <div
              className={
                styles.miniWeekdays
              }
            >
              {[
                "M",
                "T",
                "O",
                "T",
                "F",
                "L",
                "S",
              ].map(
                (
                  label,
                  index
                ) => (
                  <span
                    key={`${label}-${index}`}
                  >
                    {label}
                  </span>
                )
              )}
            </div>

            <div
              className={
                styles.miniCalendar
              }
            >
              {miniCalendarDays.map(
                (day) => (
                  <button
                    key={dateKey(day)}
                    type="button"
                    className={[
                      day.getMonth() !==
                      selectedDate.getMonth()
                        ? styles.outsideMonth
                        : "",
                      sameDay(
                        day,
                        selectedDate
                      )
                        ? styles.selectedMiniDay
                        : "",
                      sameDay(
                        day,
                        now
                      )
                        ? styles.todayMiniDay
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() =>
                      setSelectedDate(
                        new Date(day)
                      )
                    }
                  >
                    {day.getDate()}
                  </button>
                )
              )}
            </div>
          </section>

          <section className={styles.sideCard}>
            <header>
              <strong>Filter</strong>
            </header>

            <div className={styles.filters}>
              <label>
                <Search size={16} />

                <input
                  type="search"
                  value={search}
                  placeholder="Sök händelse..."
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                />
              </label>

              <select
                value={customerFilter}
                onChange={(event) =>
                  setCustomerFilter(
                    event.target.value
                  )
                }
              >
                <option value="all">
                  Alla kunder
                </option>

                {data.customers.map(
                  (customer) => (
                    <option
                      key={
                        customer.id
                      }
                      value={
                        customer.id
                      }
                    >
                      {customer.name}
                    </option>
                  )
                )}
              </select>

              <select
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(
                    event.target.value
                  )
                }
              >
                <option value="all">
                  Alla händelsetyper
                </option>

                {Object.entries(
                  eventLabels
                ).map(
                  ([value, label]) => (
                    <option
                      key={value}
                      value={value}
                    >
                      {label}
                    </option>
                  )
                )}
              </select>

              <label
                className={
                  styles.checkbox
                }
              >
                <input
                  type="checkbox"
                  checked={onlyMine}
                  onChange={(event) =>
                    setOnlyMine(
                      event.target
                        .checked
                    )
                  }
                />

                <span>
                  Visa endast mina
                  händelser
                </span>
              </label>
            </div>
          </section>

          <section className={styles.sideCard}>
            <header>
              <strong>
                Händelsetyper
              </strong>
            </header>

            <div className={styles.legend}>
              {[
                [
                  "blue",
                  "Möte",
                ],
                [
                  "teal",
                  "Kundmöte",
                ],
                [
                  "purple",
                  "Workshop",
                ],
                [
                  "red",
                  "Deadline",
                ],
                [
                  "orange",
                  "Uppföljning",
                ],
                [
                  "slate",
                  "Internt",
                ],
              ].map(
                ([color, label]) => (
                  <div key={color}>
                    <span
                      className={
                        styles[
                          `legend${color
                            .charAt(0)
                            .toUpperCase()}${color.slice(
                            1
                          )}`
                        ]
                      }
                    />

                    {label}
                  </div>
                )
              )}
            </div>
          </section>

          <section className={styles.sideCard}>
            <header>
              <strong>
                Kommande händelser
              </strong>
            </header>

            <div
              className={
                styles.upcomingList
              }
            >
              {upcomingEvents.length ===
              0 ? (
                <div
                  className={
                    styles.emptyState
                  }
                >
                  Inga kommande händelser.
                </div>
              ) : (
                upcomingEvents.map(
                  (event) => (
                    <Link
                      href={`/dashboard/kalender/${event.id}`}
                      key={event.id}
                    >
                      <span
                        className={
                          eventColorClass(
                            event.colorKey
                          )
                        }
                      />

                      <div>
                        <strong>
                          {event.title}
                        </strong>

                        <small>
                          {event.customerName ||
                            event.projectName ||
                            eventLabels[
                              event
                                .eventType
                            ]}
                        </small>
                      </div>

                      <time>
                        {new Date(
                          event.startAt
                        ).toLocaleDateString(
                          "sv-SE",
                          {
                            day: "numeric",
                            month: "short",
                          }
                        )}

                        <small>
                          {formatTime(
                            event.startAt
                          )}
                        </small>
                      </time>
                    </Link>
                  )
                )
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
