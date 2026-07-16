import CalendarWorkspace from "@/components/dashboard/calendar/CalendarWorkspace";

import {
  getCalendarPageData,
} from "@/lib/dashboard/calendar/get-calendar-page-data";

export default async function CalendarPage() {
  const data =
    await getCalendarPageData();

  return (
    <CalendarWorkspace
      data={data}
    />
  );
}
