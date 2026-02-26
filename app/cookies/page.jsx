import { EFFECTIVE_DATE } from "../../src/lib/policies";

export const metadata = {
  title: "Cookie Policy | HEALO",
  description:
    "Learn how HEALO uses cookies to provide a secure and personalized medical concierge experience.",
  alternates: { canonical: "/cookies" },
};

const COOKIE_SECTIONS = [
  {
    title: "What Are Cookies?",
    content: [
      "Cookies are small text files stored on your device when you visit a website. They help us provide a better experience by remembering your preferences and understanding how you use our platform.",
    ],
  },
  {
    title: "Essential Cookies",
    content: [
      "These cookies are required for the platform to function and cannot be disabled.",
      "Supabase session cookies: used to maintain your authentication state and keep you securely logged in.",
      "CSRF protection cookies: used to prevent cross-site request forgery attacks.",
    ],
  },
  {
    title: "Analytics Cookies",
    content: [
      "We use Google Analytics to understand how visitors interact with our platform. These cookies collect anonymized data such as pages visited, time spent, and referral sources.",
      "You can opt out of Google Analytics by installing the Google Analytics Opt-out Browser Add-on.",
    ],
  },
  {
    title: "Functional Cookies",
    content: [
      "These cookies enable enhanced functionality and personalization.",
      "Language preference: remembers your selected language (English, Japanese, Korean) so you don't have to choose it every time you visit.",
    ],
  },
  {
    title: "Managing Cookies",
    content: [
      "Most web browsers allow you to control cookies through their settings. You can choose to block or delete cookies, but this may affect your ability to use certain features of our platform.",
      "For more information about managing cookies, visit your browser's help documentation.",
    ],
  },
  {
    title: "Contact Us",
    content: [
      "If you have questions about our use of cookies, please contact us at contact@healo.com.",
    ],
  },
];

export default function CookiePolicyPage() {
  return (
    <div className="bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12 text-gray-800">
        <h1 className="text-3xl font-bold text-gray-900">Cookie Policy</h1>
        <p className="text-sm text-gray-500 mt-2">
          Last Updated: {EFFECTIVE_DATE}
        </p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed">
          {COOKIE_SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold text-gray-900">
                {section.title}
              </h2>
              <div className="mt-2 space-y-3 text-gray-600">
                {section.content.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
