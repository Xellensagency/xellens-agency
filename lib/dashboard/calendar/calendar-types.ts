export type CalendarEventType =
  | "meeting"
  | "customer_meeting"
  | "workshop"
  | "deadline"
  | "follow_up"
  | "internal";

export type CalendarEventColor =
  | "blue"
  | "teal"
  | "purple"
  | "red"
  | "orange"
  | "slate";

export type CalendarEventItem = {
  id: string;
  title: string;
  eventType: CalendarEventType;
  description: string | null;

  customerId: string | null;
  customerName: string | null;

  projectId: string | null;
  projectName: string | null;

  ownerId: string | null;

  startAt: string;
  endAt: string;
  allDay: boolean;

  locationType:
    | "none"
    | "physical"
    | "online"
    | "meeting_room";

  locationName: string | null;
  meetingUrl: string | null;

  colorKey: CalendarEventColor;

  status:
    | "scheduled"
    | "completed"
    | "cancelled";
};

export type CalendarCustomerOption = {
  id: string;
  name: string;
};

export type CalendarPageData = {
  events: CalendarEventItem[];
  customers: CalendarCustomerOption[];
  currentUserId: string | null;
  today: string;
};

export type CalendarProjectOption = {
  id: string;
  name: string;
  customerId: string | null;
};

export type CalendarCreateOptions = {
  customers: CalendarCustomerOption[];
  projects: CalendarProjectOption[];
};

export type CalendarEventEditItem =
  CalendarEventItem & {
    reminderMinutes: number[];
  };

export type CalendarEventEditData = {
  event: CalendarEventEditItem;
  options: CalendarCreateOptions;
};
