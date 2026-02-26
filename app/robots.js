const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL || "https://healo.com";

export default function robots() {
  const baseUrl = getBaseUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/treatments", "/hospitals", "/treatments/", "/hospitals/"],
        disallow: ["/admin", "/api/", "/auth/", "/login", "/signup", "/inquiry"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
