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
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
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
