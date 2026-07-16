import CreateCalendarEventForm from "@/components/dashboard/calendar/create/CreateCalendarEventForm";

import {
  getCalendarCreateOptions,
} from "@/lib/dashboard/calendar/get-calendar-create-options";

function stockholmDate() {
  return new Intl.DateTimeFormat(
    "sv-SE",
    {
      timeZone: "Europe/Stockholm",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).format(new Date());
}

export default async function NewCalendarEventPage() {
  const options =
    await getCalendarCreateOptions();

  return (
    <CreateCalendarEventForm
      options={options}
      defaultDate={stockholmDate()}
    />
  );
}
