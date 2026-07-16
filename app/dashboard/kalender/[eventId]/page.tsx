import {
  notFound,
} from "next/navigation";

import EditCalendarEventForm from "@/components/dashboard/calendar/edit/EditCalendarEventForm";

import {
  getCalendarEventEditData,
} from "@/lib/dashboard/calendar/get-calendar-event-edit-data";

type CalendarEventPageProps = {
  params: Promise<{
    eventId: string;
  }>;
};

export default async function CalendarEventPage({
  params,
}: CalendarEventPageProps) {
  const {
    eventId,
  } = await params;

  const data =
    await getCalendarEventEditData(
      eventId
    );

  if (!data) {
    notFound();
  }

  return (
    <EditCalendarEventForm
      data={data}
    />
  );
}
