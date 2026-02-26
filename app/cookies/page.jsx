export const metadata = {
  title: "Cookie Policy | HEALO",
  description: "Learn about how HEALO uses cookies.",
};

export default function CookiePolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Cookie Policy</h1>
      <div className="prose prose-sm text-gray-700 space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-gray-900">Essential Cookies</h2>
          <p>Required for the site to function. These include session management (Supabase authentication) and language preferences. Cannot be disabled.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900">Analytics Cookies</h2>
          <p>Google Analytics helps us understand how visitors use our site. These cookies are only loaded after you consent. Data is anonymized.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900">How to Manage Cookies</h2>
          <p>You can change your cookie preferences at any time by clearing your browser cookies and revisiting our site.</p>
        </section>
        <p className="text-xs text-gray-500">Last updated: February 2026</p>
      </div>
    </div>
  );
}
