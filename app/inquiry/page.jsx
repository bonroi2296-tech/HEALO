import InquiryWrapper from "./InquiryWrapper";
import ErrorBoundary from "../../src/components/ErrorBoundary";

export const metadata = {
  title: "Inquiry",
  description:
    "Start a medical inquiry with HEALO's AI or human concierge team.",
};

export default function InquiryPage() {
  return (
    <ErrorBoundary>
      <InquiryWrapper />
    </ErrorBoundary>
  );
}
