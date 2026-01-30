/**
 * HEALO: 관리자 알림 수신자 API
 * 
 * 경로: /api/admin/notification-recipients
 * 권한: 관리자 전용
 * 
 * ✅ P4.1 확장: DB 기반 수신자 관리
 */
export const runtime = "nodejs";

import { NextRequest } from "next/server";
import {
  getAllRecipients,
  addRecipient,
} from "../../../../src/lib/notifications/recipients";
import { requireAdminAuth } from "../../../../src/lib/auth/requireAdminAuth";

/**
 * GET: 수신자 목록 조회
 */
export async function GET(request: NextRequest) {
  // ✅ 관리자 인증 확인 (자동 audit log 포함)
  const auth = await requireAdminAuth(request);
  if (!auth.success) {
    return auth.response; // 403 + audit log 자동 처리
  }

  const result = await getAllRecipients();

  if (!result.success) {
    return Response.json(
      { ok: false, error: result.error },
      { status: 500 }
    );
  }

  return Response.json({
    ok: true,
    recipients: result.recipients,
  });
}

/**
 * POST: 수신자 추가
 * 
 * Body:
 * {
 *   "label": "김주영",
 *   "phone": "+821012345678",
 *   "channel": "sms",
 *   "notes": "메모"
 * }
 */
export async function POST(request: NextRequest) {
  // ✅ 관리자 인증 확인 (자동 audit log 포함)
  const auth = await requireAdminAuth(request);
  if (!auth.success) {
    return auth.response; // 403 + audit log 자동 처리
  }

  try {
    const body = await request.json();

    if (!body.label || !body.phone) {
      return Response.json(
        { ok: false, error: "label and phone are required" },
        { status: 400 }
      );
    }

    const result = await addRecipient({
      label: body.label,
      phone: body.phone,
      channel: body.channel || "sms",
      notes: body.notes,
    });

    if (!result.success) {
      return Response.json(
        { ok: false, error: result.error },
        { status: 400 }
      );
    }

    return Response.json({
      ok: true,
      id: result.id,
    });
  } catch (error: any) {
    return Response.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
