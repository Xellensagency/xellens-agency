import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  FileText,
  ReceiptText,
  Users,
  CalendarDays,
  ListChecks,
  Files,
  CircleDollarSign,
  ChartNoAxesCombined,
  PackageCheck,
} from "lucide-react";

export type DashboardNavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const dashboardNavigation: DashboardNavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Projekt",
    href: "/dashboard/projekt",
    icon: BriefcaseBusiness,
  },
  {
    label: "Offerter",
    href: "/dashboard/offerter",
    icon: FileText,
  },
  {
    label: "Fakturor",
    href: "/dashboard/fakturor",
    icon: ReceiptText,
  },
  {
    label: "Kunder",
    href: "/dashboard/kunder",
    icon: Users,
  },
  {
    label: "Kalender",
    href: "/dashboard/kalender",
    icon: CalendarDays,
  },
  {
    label: "Uppgifter",
    href: "/dashboard/uppgifter",
    icon: ListChecks,
  },
  {
    label: "Filer",
    href: "/dashboard/filer",
    icon: Files,
  },
  {
    label: "Ekonomi",
    href: "/dashboard/ekonomi",
    icon: CircleDollarSign,
  },
  {
    label: "Rapporter",
    href: "/dashboard/rapporter",
    icon: ChartNoAxesCombined,
  },
  {
    label: "Mallar & Paket",
    href: "/dashboard/mallar",
    icon: PackageCheck,
  },
];

