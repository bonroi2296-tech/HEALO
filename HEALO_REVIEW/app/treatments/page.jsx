import PaginatedListClient from "../list/PaginatedListClient";
import { t } from "../../src/lib/i18n";

export const metadata = {
  title: t("meta.treatments.title", "en"),
  description: t("meta.treatments.desc", "en"),
  alternates: { canonical: "/treatments" },
};

export default function TreatmentsPage() {
  return (
    <>
      <PaginatedListClient
        type="treatment"
        title={t("list.treatments.title", "en")}
        withCta
      />
    </>
  );
}
