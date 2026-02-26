import HomeClient from "./home/HomeClient";
import ErrorBoundary from "../src/components/ErrorBoundary";

export const metadata = {
  title: "HEALO | Korea's #1 Medical Concierge",
  description:
    "Find the best clinics in Korea. AI-powered comparison of treatments, doctors, and prices. Free personalized treatment plans.",
  openGraph: {
    title: "HEALO | Korea's #1 Medical Concierge",
    description:
      "Find the best clinics in Korea. AI-powered comparison of treatments, doctors, and prices.",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <ErrorBoundary>
      <HomeClient />
    </ErrorBoundary>
  );
}
