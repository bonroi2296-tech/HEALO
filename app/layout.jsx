// ✅ 성능 최적화: CSS는 Next.js가 자동으로 최적화하지만, 명시적으로 처리
import "./globals.css";
import { Inter } from "next/font/google";
import Providers from "./providers";
import ClientShell from "./ClientShell";
import GoogleAnalytics from "./GoogleAnalytics";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-sans" });

export const metadata = {
  title: {
    default: "HEALO | Your Medical Concierge in Korea",
    template: "%s | HEALO",
  },
  description:
    "Find the right clinic in Korea. Free comparison quotes and concierge service.",
  openGraph: {
    title: "HEALO | Your Medical Concierge in Korea",
    description:
      "Find the right clinic in Korea. Free comparison quotes and concierge service.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} font-sans text-gray-800 bg-gray-50 min-h-screen`}>
        {/* GA loads only when user accepts all cookies (GDPR) */}
        {gaId && <GoogleAnalytics gaId={gaId} />}
        <Providers>
          <ClientShell>{children}</ClientShell>
        </Providers>
      </body>
    </html>
  );
}
