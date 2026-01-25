/**
 * HEALO: Attachment 접근 권한 검증 유틸
 * attachments/sign과 referral/summary에서 공통 사용
 */

/**
 * path가 inquiry의 attachment 또는 attachments 배열에 포함되는지 검증
 * @param path 요청한 파일 path
 * @param attachment 단일 attachment 컬럼 값
 * @param attachments 다중 attachments 배열
 * @returns 권한 있으면 true
 */
export function pathAuthorized(
  path: string,
  attachment: string | null,
  attachments: unknown
): boolean {
  if (attachment && String(attachment) === path) return true;
  const arr = Array.isArray(attachments) ? attachments : [];
  return arr.some((a: { path?: string }) => a?.path === path);
}
