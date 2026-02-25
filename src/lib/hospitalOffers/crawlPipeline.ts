/**
 * HOSPITAL_OFFER_IMPORT_V1: 병원 웹사이트 크롤 파이프라인
 * - 메인 URL + 키워드 링크 상위 N개 페이지만 수집 (SSRF 안전)
 * - Playwright는 선택 사항(동적 렌더링 필요 시); 기본은 fetch로 HTML 수집
 */

import { ssrfSafeFetch } from "./ssrfSafeFetch";
import type { OfferSource } from "./types";

const KEYWORDS = /treatment|procedure|program|price|시술|가격|프로그램|상담/i;
const MAX_CANDIDATE_PAGES = 30;
const MAX_PAGE_BYTES = 2 * 1024 * 1024; // 2MB per page
const PAGE_TIMEOUT_MS = 15_000;

function extractTextFromHtml(html: string): string {
  const noScript = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  const noStyle = noScript.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
  const text = noStyle
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, 500_000); // 상한
}

function extractLinks(html: string, baseUrl: string): string[] {
  const hrefRe = /<a\s+[^>]*href\s*=\s*["']([^"']+)["']/gi;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  const base = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const origin = (() => {
    try {
      const u = new URL(base);
      return u.origin;
    } catch {
      return base;
    }
  })();

  while ((m = hrefRe.exec(html)) !== null) {
    const raw = m[1].trim();
    if (!raw || raw.startsWith("#") || raw.startsWith("javascript:")) continue;
    try {
      const u = new URL(raw, base);
      if (u.origin !== origin) continue; // 같은 도메인만
      const href = u.href;
      if (KEYWORDS.test(href) || KEYWORDS.test(u.pathname)) {
        out.push(href);
      }
    } catch {
      // ignore invalid URL
    }
  }
  return [...new Set(out)].slice(0, MAX_CANDIDATE_PAGES);
}

export interface CrawlResult {
  sources: OfferSource[];
  combinedText: string;
  error?: string;
}

/**
 * 병원 웹사이트에서 텍스트 수집 (fetch 기반, SSRF 안전)
 */
export async function crawlHospitalWebsite(websiteUrl: string): Promise<CrawlResult> {
  const sources: OfferSource[] = [];
  const textChunks: string[] = [];

  const main = await ssrfSafeFetch(websiteUrl, {
    timeoutMs: PAGE_TIMEOUT_MS,
    maxBytes: MAX_PAGE_BYTES,
  });

  if (!main.ok || main.body == null) {
    return {
      sources: [],
      combinedText: "",
      error: main.error ?? "main_page_fetch_failed",
    };
  }

  sources.push({
    url: websiteUrl,
    type: "html",
    title: undefined,
  });
  textChunks.push(extractTextFromHtml(main.body));

  const links = extractLinks(main.body, websiteUrl);
  let fetched = 0;
  for (const href of links) {
    if (fetched >= 10) break; // 상위 10개만 추가 수집
    const page = await ssrfSafeFetch(href, {
      timeoutMs: PAGE_TIMEOUT_MS,
      maxBytes: MAX_PAGE_BYTES,
    });
    if (page.ok && page.body) {
      sources.push({ url: href, type: "html", title: undefined });
      textChunks.push(extractTextFromHtml(page.body));
      fetched++;
    }
  }

  const combinedText = textChunks.join("\n\n").replace(/\s+/g, " ").trim().slice(0, 300_000);
  return { sources, combinedText };
}
