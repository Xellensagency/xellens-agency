import type {
  LucideIcon,
} from "lucide-react";

import {
  CalendarDays,
  Files,
  FolderKanban,
  Home,
  MessageSquare,
  PenLine,
  ReceiptText,
} from "lucide-react";

export type CustomerPortalNavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const customerPortalNavigation:
CustomerPortalNavigationItem[] = [
  {
    label: "Översikt",
    href: "/portal",
    icon: Home,
  },
  {
    label: "Projekt",
    href: "/portal/projekt",
    icon: FolderKanban,
  },
  {
    label: "Design & feedback",
    href: "/portal/design-feedback",
    icon: PenLine,
  },
  {
    label: "Filer",
    href: "/portal/filer",
    icon: Files,
  },
  {
    label: "Fakturor",
    href: "/portal/fakturor",
    icon: ReceiptText,
  },
  {
    label: "Möten",
    href: "/portal/moten",
    icon: CalendarDays,
  },
  {
    label: "Meddelanden",
    href: "/portal/meddelanden",
    icon: MessageSquare,
  },
];
