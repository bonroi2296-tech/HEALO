/**
 * HEALO: 관리자 알림 수신자 API (개별)
 * 
 * 경로: /api/admin/notification-recipients/[id]
 * 권한: 관리자 전용
 * 
 * ✅ P4.1 확장: 수신자 수정/삭제
 */
export const runtime = "nodejs";

import { NextRequest } from "next/server";
import {
  updateRecipient,
  deleteRecipient,
} from "../../../../../src/lib/notifications/recipients";
import { requireAdminAuth } from "../../../../../src/lib/auth/requireAdminAuth";

/**
 * PATCH: 수신자 수정
 * 
 * Body:
 * {
 *   "label": "새 이름",
 *   "is_active": false,
 *   "notes": "메모"
 * }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // ✅ 관리자 인증 확인 (자동 audit log 포함)
  const auth = await requireAdminAuth(request);
  if (!auth.success) {
    return auth.response; // 403 + audit log 자동 처리
  }

  try {
    const id = params.id;
    const body = await request.json();

    const result = await updateRecipient(id, {
      label: body.label,
      is_active: body.is_active,
      notes: body.notes,
    });

    if (!result.success) {
      return Response.json(
        { ok: false, error: result.error },
        { status: 400 }
      );
    }

    return Response.json({ ok: true });
  } catch (error: any) {
    return Response.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE: 수신자 삭제 (Soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // ✅ 관리자 인증 확인 (자동 audit log 포함)
  const auth = await requireAdminAuth(request);
  if (!auth.success) {
    return auth.response; // 403 + audit log 자동 처리
  }

  try {
    const id = params.id;

    const result = await deleteRecipient(id, true); // Soft delete

    if (!result.success) {
      return Response.json(
        { ok: false, error: result.error },
        { status: 400 }
      );
    }

    return Response.json({ ok: true });
  } catch (error: any) {
    return Response.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
