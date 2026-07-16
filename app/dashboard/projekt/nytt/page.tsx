import CreateProjectWizard from "@/components/dashboard/projects/create/CreateProjectWizard";
import { getCreateProjectOptions } from "@/lib/dashboard/projects/get-create-project-options";

export const dynamic = "force-dynamic";

export default async function CreateProjectPage() {
  const options =
    await getCreateProjectOptions();

  return (
    <CreateProjectWizard
      options={options}
    />
  );
}
