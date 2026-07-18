import {
  redirect,
} from "next/navigation";

import CompanySettingsForm from "@/components/dashboard/settings/CompanySettingsForm";

import {
  getCompanySettings,
} from "@/lib/dashboard/settings/get-company-settings";

export default async function SettingsPage() {
  const settings =
    await getCompanySettings();

  if (!settings) {
    redirect("/dashboard");
  }

  return (
    <CompanySettingsForm
      initialSettings={
        settings
      }
    />
  );
}
