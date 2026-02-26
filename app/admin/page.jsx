import AdminWrapper from "./AdminWrapper";
import ErrorBoundary from "../../src/components/ErrorBoundary";

export const metadata = {
  title: "Admin",
  description: "Manage HEALO treatments, hospitals, and inquiries.",
};

export default function AdminPage() {
  return (
    <ErrorBoundary>
      <AdminWrapper />
    </ErrorBoundary>
  );
}
