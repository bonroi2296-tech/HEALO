/**
 * HEALO: 이메일 마스킹 유틸
 *
 * 서버 로그에 이메일 원문이 노출되지 않도록
 * 첫 글자만 남기고 나머지를 마스킹합니다.
 * 예: "john@gmail.com" → "j***@gmail.com"
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return '(none)';
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  return `${local[0]}***@${domain}`;
}
