import PaginatedListClient from "../list/PaginatedListClient";
import { t } from "../../src/lib/i18n";

export const metadata = {
  title: t("meta.hospitals.title", "en"),
  description: t("meta.hospitals.desc", "en"),
  alternates: { canonical: "/hospitals" },
};

export default function HospitalsPage() {
  return (
    <>
      <PaginatedListClient
        type="hospital"
        title={t("list.hospitals.title", "en")}
        withCta
      />
    </>
  );
}
