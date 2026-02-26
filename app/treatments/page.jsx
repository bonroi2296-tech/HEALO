import PaginatedListClient from "../list/PaginatedListClient";
import { t } from "../../src/lib/i18n";
import ErrorBoundary from "../../src/components/ErrorBoundary";

export const metadata = {
  title: t("meta.treatments.title", "en"),
  description: t("meta.treatments.desc", "en"),
  alternates: { canonical: "/treatments" },
};

export default function TreatmentsPage() {
  return (
    <ErrorBoundary>
      <PaginatedListClient
        type="treatment"
        title={t("list.treatments.title", "en")}
        withCta
      />
    </ErrorBoundary>
  );
}
