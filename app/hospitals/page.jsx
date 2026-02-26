import PaginatedListClient from "../list/PaginatedListClient";
import { t } from "../../src/lib/i18n";
import ErrorBoundary from "../../src/components/ErrorBoundary";

export const metadata = {
  title: t("meta.hospitals.title", "en"),
  description: t("meta.hospitals.desc", "en"),
  alternates: { canonical: "/hospitals" },
};

export default function HospitalsPage() {
  return (
    <ErrorBoundary>
      <PaginatedListClient
        type="hospital"
        title={t("list.hospitals.title", "en")}
        withCta
      />
    </ErrorBoundary>
  );
}
