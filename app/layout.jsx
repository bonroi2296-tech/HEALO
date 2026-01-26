// ✅ 성능 최적화: CSS는 Next.js가 자동으로 최적화하지만, 명시적으로 처리
import "./globals.css";
import Script from "next/script";
import Providers from "./providers";
import ClientShell from "./ClientShell";

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
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en">
      <body className="font-sans text-gray-800 bg-gray-50 min-h-screen">
        {/* ✅ 성능 최적화: Google Analytics 지연 로딩 */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="lazyOnload"
            />
            <Script id="ga-init" strategy="lazyOnload">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}', { send_page_view: false });`}
            </Script>
          </>
        )}
        <Providers>
          <ClientShell>{children}</ClientShell>
        </Providers>
      </body>
    </html>
  );
}
