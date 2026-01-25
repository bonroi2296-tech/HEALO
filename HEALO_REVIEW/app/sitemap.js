import { getTreatmentList } from "../src/lib/data/treatments";
import { getHospitalList } from "../src/lib/data/hospitals";

const DEFAULT_LIMIT = 1000;

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap() {
  const baseUrl = getBaseUrl();
  const now = new Date();

  // NOTE: For large datasets, increase limit or paginate in chunks.
  const [treatments, hospitals] = await Promise.all([
    getTreatmentList({ limit: DEFAULT_LIMIT }),
    getHospitalList({ limit: DEFAULT_LIMIT }),
  ]);

  const urls = [];

  for (const t of treatments || []) {
    const slugOrId = t?.slug || t?.id;
    if (!slugOrId) continue;
    urls.push({
      url: `${baseUrl}/treatments/${slugOrId}`,
      lastModified: t?.updated_at || t?.created_at || now,
    });
  }

  for (const h of hospitals || []) {
    const slugOrId = h?.slug || h?.id;
    if (!slugOrId) continue;
    urls.push({
      url: `${baseUrl}/hospitals/${slugOrId}`,
      lastModified: h?.updated_at || h?.created_at || now,
    });
  }

  return urls;
}
