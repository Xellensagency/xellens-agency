import type {
  DashboardDeadlineData,
  DashboardProjectOverview,
} from "@/lib/dashboard/dashboard-types";
import ProjectOverview from "./ProjectOverview";
import DeadlinesSection from "./DeadlinesSection";
import styles from "./OverviewSection.module.css";

type OverviewSectionProps = {
  overview: DashboardProjectOverview;
  deadlines: DashboardDeadlineData[];
};

export default function OverviewSection({
  overview,
  deadlines,
}: OverviewSectionProps) {
  return (
    <section
      className={styles.grid}
      aria-label="Projekt och deadlines"
    >
      <ProjectOverview
        overview={overview}
      />

      <DeadlinesSection
        deadlines={deadlines}
      />
    </section>
  );
}
