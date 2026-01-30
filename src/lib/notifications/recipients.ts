/**
 * HEALO: 알림 수신자 관리
 * 
 * 목적:
 * - DB에서 활성 수신자 조회
 * - ENV fallback 지원
 * - 전화번호 마스킹 (로그용)
 * 
 * 우선순위:
 * 1. DB 활성 수신자 (is_active=true)
 * 2. ENV fallback (ADMIN_PHONE_NUMBERS)
 */

import { supabaseAdmin } from "../rag/supabaseAdmin";

/**
 * 알림 수신자
 */
export interface NotificationRecipient {
  id?: string; // DB에서 온 경우 UUID, ENV는 undefined
  label: string;
  phone: string; // E.164 형식
  channel: "sms" | "alimtalk" | "email";
  source: "db" | "env"; // 출처
}

/**
 * 전화번호 마스킹 (로그용)
 * 예: +82-10-1234-5678 → +82-**-****-5678
 */
export function maskPhone(phone: string): string {
  const cleaned = phone.replace(/[^0-9+\-]/g, "");
  if (cleaned.length <= 4) return "****";
  const lastFour = cleaned.slice(-4);
  const masked = cleaned.slice(0, -4).replace(/[0-9]/g, "*");
  return masked + lastFour;
}

/**
 * E.164 형식 검증
 * 예: +821012345678
 */
export function isValidE164(phone: string): boolean {
  // 기본 E.164 형식: + 로 시작, 1-15자리 숫자
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phone);
}

/**
 * ✅ DB에서 활성 수신자 조회
 */
async function getRecipientsFromDB(): Promise<NotificationRecipient[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("admin_notification_recipients")
      .select("id, label, phone_e164, channel")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[Recipients] DB 조회 실패:", error.message);
      return [];
    }

    if (!data || data.length === 0) {
      console.log("[Recipients] DB에 활성 수신자 없음");
      return [];
    }

    const recipients: NotificationRecipient[] = data.map((row) => ({
      id: row.id,
      label: row.label,
      phone: row.phone_e164,
      channel: row.channel as "sms" | "alimtalk" | "email",
      source: "db",
    }));

    console.log(`[Recipients] DB에서 ${recipients.length}명 조회`);
    return recipients;
  } catch (error: any) {
    console.error("[Recipients] DB 조회 오류:", error.message);
    return [];
  }
}

/**
 * ✅ ENV에서 수신자 조회 (fallback)
 */
function getRecipientsFromEnv(): NotificationRecipient[] {
  const envPhones = process.env.ADMIN_PHONE_NUMBERS?.split(",").map((p) => p.trim()) || [];

  if (envPhones.length === 0) {
    console.warn("[Recipients] ENV ADMIN_PHONE_NUMBERS 미설정");
    return [];
  }

  const recipients: NotificationRecipient[] = envPhones.map((phone, index) => ({
    label: `ENV-${index + 1}`,
    phone,
    channel: "sms",
    source: "env",
  }));

  console.log(`[Recipients] ENV에서 ${recipients.length}명 조회`);
  return recipients;
}

/**
 * ✅ 활성 수신자 조회 (메인 함수)
 * 
 * 우선순위:
 * 1. DB 활성 수신자
 * 2. ENV fallback
 * 
 * Fail-safe:
 * - DB 오류 → ENV 사용
 * - 둘 다 없음 → 빈 배열 (알림 건너뜀)
 */
export async function getActiveRecipients(): Promise<NotificationRecipient[]> {
  // 1. DB 시도
  const dbRecipients = await getRecipientsFromDB();

  if (dbRecipients.length > 0) {
    console.log(`[Recipients] DB 사용: ${dbRecipients.length}명`);
    return dbRecipients;
  }

  // 2. ENV fallback
  console.log("[Recipients] DB 비어있음 → ENV fallback");
  const envRecipients = getRecipientsFromEnv();

  if (envRecipients.length > 0) {
    console.log(`[Recipients] ENV 사용: ${envRecipients.length}명`);
    return envRecipients;
  }

  // 3. 둘 다 없음
  console.warn("[Recipients] 수신자 없음 (DB + ENV 모두 비어있음)");
  return [];
}

/**
 * ✅ 수신자 통계 업데이트 (발송 후 호출)
 */
export async function updateRecipientStats(
  recipientId: string | undefined,
  success: boolean
): Promise<void> {
  if (!recipientId) {
    // ENV 출처는 통계 업데이트 안 함
    return;
  }

  try {
    await supabaseAdmin.rpc("update_recipient_stats", {
      p_recipient_id: recipientId,
      p_success: success,
    });
  } catch (error: any) {
    // 통계 업데이트 실패는 무시 (메인 로직 영향 없게)
    console.error("[Recipients] 통계 업데이트 실패 (무시):", error.message);
  }
}

/**
 * ✅ 수신자 추가 (관리자 API용)
 */
export async function addRecipient(data: {
  label: string;
  phone: string;
  channel?: "sms" | "alimtalk" | "email";
  notes?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    // E.164 검증
    if (!isValidE164(data.phone)) {
      return {
        success: false,
        error: "Invalid E.164 format (예: +821012345678)",
      };
    }

    const { data: result, error } = await supabaseAdmin
      .from("admin_notification_recipients")
      .insert({
        label: data.label,
        phone_e164: data.phone,
        channel: data.channel || "sms",
        notes: data.notes || null,
        is_active: true,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[Recipients] 추가 실패:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log(`[Recipients] 추가 성공: ${maskPhone(data.phone)}`);
    return {
      success: true,
      id: result.id,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * ✅ 수신자 수정 (관리자 API용)
 */
export async function updateRecipient(
  id: string,
  data: {
    label?: string;
    is_active?: boolean;
    notes?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const updateData: any = {};
    if (data.label !== undefined) updateData.label = data.label;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const { error } = await supabaseAdmin
      .from("admin_notification_recipients")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("[Recipients] 수정 실패:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log(`[Recipients] 수정 성공: ${id}`);
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * ✅ 수신자 삭제 (Soft Delete 권장)
 */
export async function deleteRecipient(
  id: string,
  softDelete = true
): Promise<{ success: boolean; error?: string }> {
  try {
    if (softDelete) {
      // Soft delete: is_active=false
      const { error } = await supabaseAdmin
        .from("admin_notification_recipients")
        .update({ is_active: false })
        .eq("id", id);

      if (error) {
        console.error("[Recipients] Soft delete 실패:", error.message);
        return {
          success: false,
          error: error.message,
        };
      }

      console.log(`[Recipients] Soft delete 성공: ${id}`);
    } else {
      // Hard delete: 실제 삭제
      const { error } = await supabaseAdmin
        .from("admin_notification_recipients")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("[Recipients] Hard delete 실패:", error.message);
        return {
          success: false,
          error: error.message,
        };
      }

      console.log(`[Recipients] Hard delete 성공: ${id}`);
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * ✅ 모든 수신자 조회 (관리자 UI용)
 */
export async function getAllRecipients(): Promise<{
  success: boolean;
  recipients?: Array<{
    id: string;
    label: string;
    phone_masked: string;
    channel: string;
    is_active: boolean;
    last_sent_at: string | null;
    sent_count: number;
    failed_count: number;
    created_at: string;
  }>;
  error?: string;
}> {
  try {
    const { data, error } = await supabaseAdmin
      .from("admin_notification_recipients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Recipients] 전체 조회 실패:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    const recipients = (data || []).map((row) => ({
      id: row.id,
      label: row.label,
      phone_masked: maskPhone(row.phone_e164),
      channel: row.channel,
      is_active: row.is_active,
      last_sent_at: row.last_sent_at,
      sent_count: row.sent_count,
      failed_count: row.failed_count,
      created_at: row.created_at,
    }));

    return {
      success: true,
      recipients,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}
