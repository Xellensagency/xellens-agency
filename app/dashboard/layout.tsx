import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { createClient } from "@/lib/supabase/server";

const allowedRoles = [
  "super_admin",
  "admin",
  "staff",
];

const roleLabels: Record<string, string> = {
  super_admin: "Superadmin",
  admin: "Admin",
  staff: "Medarbetare",
};

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    redirect("/");
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("full_name, role, is_active")
    .eq("id", userId)
    .single();

  if (
    profileError ||
    !profile ||
    !profile.is_active ||
    !allowedRoles.includes(profile.role)
  ) {
    redirect("/");
  }

  const fullName =
    profile.full_name?.trim() || "Användare";

  const firstName =
    fullName.split(/\s+/)[0] || "Användare";

  return (
    <DashboardShell
      user={{
        fullName,
        firstName,
        roleLabel:
          roleLabels[profile.role] ??
          profile.role,
      }}
    >
      {children}
    </DashboardShell>
  );
}
