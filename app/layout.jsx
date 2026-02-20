// ✅ 성능 최적화: CSS는 Next.js가 자동으로 최적화하지만, 명시적으로 처리
import "./globals.css";
import Providers from "./providers";
import ClientShell from "./ClientShell";
import AnalyticsWrapper from "./AnalyticsWrapper";

export const metadata = {
  title: {
    default: "HEALO | Korea's #1 Medical Concierge",
    template: "%s | HEALO",
  },
  description:
    "Find the best clinics in Korea. Free comparison quotes and concierge service.",
  openGraph: {
    title: "HEALO | Korea's #1 Medical Concierge",
    description:
      "Find the best clinics in Korea. Free comparison quotes and concierge service.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="stylesheet" as="style" crossOrigin="anonymous" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
      </head>
      <body className="font-sans text-gray-800 bg-gray-50 min-h-screen">
        {/* ✅ 성능 최적화: Google Analytics 조건부 로딩 */}
        <AnalyticsWrapper />
        <Providers>
          <ClientShell>{children}</ClientShell>
        </Providers>
      </body>
    </html>
  );
}
