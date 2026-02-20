/**
 * HEALO: 관리자 알림 설정 페이지
 * 
 * 경로: /admin/settings/notifications
 * 
 * 기능:
 * - 수신자 목록 표시
 * - 수신자 추가
 * - 활성화/비활성화 토글
 * - 삭제
 * 
 * ✅ P4.1 확장: DB 기반 수신자 관리 UI
 */
"use client";

import { useState, useEffect } from "react";
import AdminFormFooter from "../../_components/AdminFormFooter";
import { formatPhoneInput, cleanPhone, isValidKoreanMobile, isValidEmail } from "../../../../src/lib/utils/phoneFormat";

interface Recipient {
  id: string;
  label: string;
  phone_masked: string | null;
  email: string | null;
  destination: string; // 채널에 따라 phone_masked 또는 email
  channel: string;
  is_active: boolean;
  last_sent_at: string | null;
  sent_count: number;
  failed_count: number;
  created_at: string;
}

export default function NotificationsSettingsPage() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  // 추가 폼 상태 (P0: 다채널 수신자 생성)
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newChannels, setNewChannels] = useState<string[]>(["sms"]); // 다채널 선택
  const [newPhone, setNewPhone] = useState(""); // 전화번호 (SMS/Alimtalk용)
  const [newEmail, setNewEmail] = useState(""); // 이메일 (Email용)
  const [newIsActive, setNewIsActive] = useState(true);
  const [newNotes, setNewNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 수정 모달 상태 (전체 필드 수정 가능 + email 지원)
  const [editModal, setEditModal] = useState<{
    id: string;
    label: string;
    channel: "sms" | "alimtalk" | "email";
    phone: string;
    email: string;
    isActive: boolean;
    notes: string;
  } | null>(null);

  // 채널 토글 헬퍼
  const toggleChannel = (channel: string) => {
    setNewChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel]
    );
  };

  // Toast 상태
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Toast 표시 헬퍼
  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // 수신자 목록 조회
  const fetchRecipients = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/notification-recipients");
      const data = await res.json();

      if (data.ok) {
        setRecipients(data.recipients || []);
        setError(null);
        setErrorCode(null);
      } else {
        setError(data.error || "Failed to load recipients");
        setErrorCode(data.errorCode || null);
      }
    } catch (err: any) {
      setError(err.message);
      setErrorCode("FETCH_ERROR");
    } finally {
      setLoading(false);
    }
  };

  // 수신자 추가 (멀티 채널 bulk insert)
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newLabel.trim()) {
      showToast("error", "❌ 이름을 입력하세요");
      return;
    }

    if (newChannels.length === 0) {
      showToast("error", "❌ 최소 1개 채널을 선택하세요");
      return;
    }

    // 채널별 필수 입력 검증
    const hasPhoneChannel = newChannels.some((ch) => ch === "sms" || ch === "alimtalk");
    const hasEmailChannel = newChannels.includes("email");

    // 전화번호 검증 (SMS/알림톡 선택 시)
    if (hasPhoneChannel) {
      if (!newPhone.trim()) {
        showToast("error", "❌ 전화번호를 입력하세요");
        return;
      }
      const cleanedPhone = cleanPhone(newPhone);
      if (!isValidKoreanMobile(cleanedPhone)) {
        showToast("error", "❌ 010으로 시작하는 11자리 전화번호를 입력하세요");
        return;
      }
    }

    // 이메일 검증 (Email 선택 시)
    if (hasEmailChannel) {
      if (!newEmail.trim()) {
        showToast("error", "❌ 이메일 주소를 입력하세요");
        return;
      }
      if (!isValidEmail(newEmail.trim())) {
        showToast("error", "❌ 유효한 이메일 주소를 입력하세요 (예: admin@healo.com)");
        return;
      }
    }

    try {
      setSubmitting(true);

      // 멀티 채널 bulk insert (API가 channels 배열 처리)
      const body: any = {
        label: newLabel,
        channels: newChannels,
        notes: newNotes,
        is_active: newIsActive,
      };

      // phone/email 필드 추가
      if (hasPhoneChannel) {
        // 전화번호는 하이픈 제거한 숫자만 전송
        body.phone = cleanPhone(newPhone);
      }
      if (hasEmailChannel) {
        body.email = newEmail.trim();
      }

      const res = await fetch("/api/admin/notification-recipients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.ok) {
        showToast("success", `✅ 수신자가 추가되었습니다`);
        setNewLabel("");
        setNewChannels(["sms"]);
        setNewPhone("");
        setNewEmail("");
        setNewIsActive(true);
        setNewNotes("");
        setShowAddForm(false);
        fetchRecipients();
      } else {
        const errorMsg = data.error || data.details?.join(", ") || "알 수 없는 오류";
        showToast("error", `❌ 추가 실패: ${errorMsg}`);
        console.error("[Add] 서버 응답:", data);
      }
    } catch (err: any) {
      showToast("error", `❌ 오류: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // 활성화/비활성화 토글
  const handleToggle = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/notification-recipients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_active: !currentActive,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        showToast("success", "✅ 상태가 변경되었습니다");
        fetchRecipients();
      } else {
        showToast("error", `❌ 토글 실패: ${data.error}`);
      }
    } catch (err: any) {
      showToast("error", `❌ 오류: ${err.message}`);
    }
  };

  // 삭제 (Hard delete)
  const handleDelete = async (id: string, label: string) => {
    console.log("[Delete] 시작:", { id, label });
    
    if (!confirm(`${label} 수신자를 삭제하시겠습니까?`)) {
      console.log("[Delete] 취소됨");
      return;
    }

    try {
      console.log("[Delete] API 호출:", `/api/admin/notification-recipients/${id}`);
      
      const res = await fetch(`/api/admin/notification-recipients/${id}`, {
        method: "DELETE",
      });

      console.log("[Delete] 응답 상태:", res.status);
      
      const data = await res.json();
      console.log("[Delete] 응답 데이터:", data);

      if (data.ok) {
        showToast("success", "✅ 삭제되었습니다");
        fetchRecipients();
      } else {
        console.error("[Delete] 실패:", data.error);
        showToast("error", `❌ 삭제 실패: ${data.error}`);
      }
    } catch (err: any) {
      console.error("[Delete] 예외 발생:", err);
      showToast("error", `❌ 오류: ${err.message}`);
    }
  };

  // 수정 모달 열기 (전체 필드 수정 가능 + email 지원)
  const handleEditStart = (recipient: Recipient) => {
    setEditModal({
      id: recipient.id,
      label: recipient.label,
      channel: recipient.channel as "sms" | "alimtalk" | "email",
      phone: "", // 보안상 기존 번호는 표시 안 함 (마스킹됨)
      email: recipient.email || "", // 이메일은 마스킹 없이 표시 가능
      isActive: recipient.is_active,
      notes: "",
    });
  };

  // 수정 모달 닫기
  const handleEditCancel = () => {
    setEditModal(null);
  };

  // 수정 저장
  const handleEditSave = async () => {
    if (!editModal) return;

    try {
      const body: any = {
        label: editModal.label,
        channel: editModal.channel,
        is_active: editModal.isActive,
      };

      // phone이 입력된 경우에만 전송 (비어있으면 기존 유지)
      if (editModal.phone.trim()) {
        // 전화번호는 하이픈 제거한 숫자만 전송
        body.phone_e164 = cleanPhone(editModal.phone);
      }

      // email이 입력된 경우에만 전송 (비어있으면 기존 유지)
      if (editModal.email.trim()) {
        body.email = editModal.email.trim();
      }

      // notes가 입력된 경우에만 전송
      if (editModal.notes.trim()) {
        body.notes = editModal.notes.trim();
      }

      const res = await fetch(`/api/admin/notification-recipients/${editModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.ok) {
        showToast("success", "✅ 수정되었습니다");
        handleEditCancel();
        fetchRecipients();
      } else {
        showToast("error", `❌ 수정 실패: ${data.error}`);
      }
    } catch (err: any) {
      showToast("error", `❌ 오류: ${err.message}`);
    }
  };

  // 테스트 알림 발송
  const handleTestNotification = async (recipientId?: string) => {
    if (!confirm("테스트 알림을 발송하시겠습니까?")) {
      return;
    }

    try {
      const res = await fetch("/api/admin/notification-recipients/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient_id: recipientId || undefined,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        showToast("success", `✅ ${data.message} (서버 콘솔 확인)`);
      } else {
        showToast("error", `❌ 발송 실패: ${data.error}`);
      }
    } catch (err: any) {
      showToast("error", `❌ 오류: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchRecipients();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">알림 설정</h1>
        <p>로딩 중...</p>
      </div>
    );
  }

  const tableMissing = errorCode === "TABLE_NOT_FOUND";

  return (
    <div className="p-8 max-w-6xl">
      {/* 헤더: 제목 + 추가 버튼 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">알림 수신자 관리</h1>
          <p className="text-gray-600">문의 접수 시 알림을 받을 관리자를 설정합니다.</p>
        </div>
        
        {/* 주요 액션 버튼 */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          disabled={tableMissing}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            tableMissing
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : showAddForm
              ? "bg-gray-500 text-white hover:bg-gray-600"
              : "bg-teal-600 text-white hover:bg-teal-700 shadow-md hover:shadow-lg"
          }`}
          title={tableMissing ? "⚠️ 마이그레이션 실행 후 사용 가능" : ""}
        >
          {showAddForm ? "✕ 취소" : "+ 수신자 추가"}
        </button>
      </div>

      {error && errorCode === "TABLE_NOT_FOUND" && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-300 rounded">
          <h3 className="font-bold text-yellow-800 mb-2">⚠️ 데이터베이스 마이그레이션 필요</h3>
          <p className="text-yellow-700 mb-2">{error}</p>
          <div className="text-sm text-yellow-600">
            <p className="font-medium mb-1">해결 방법:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Supabase SQL Editor 접속</li>
              <li><code className="bg-yellow-100 px-2 py-0.5 rounded">migrations/20260129_add_admin_notification_recipients.sql</code> 파일 실행</li>
              <li><code className="bg-yellow-100 px-2 py-0.5 rounded">migrations/20260204_add_admin_notification_logs.sql</code> 파일 실행</li>
              <li>이 페이지 새로고침</li>
            </ol>
            <p className="mt-2">
              📋 테이블 확인 스크립트: <code className="bg-yellow-100 px-2 py-0.5 rounded">scripts/check-notification-tables.sql</code>
            </p>
          </div>
        </div>
      )}

      {error && errorCode !== "TABLE_NOT_FOUND" && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          오류: {error}
        </div>
      )}

      {/* 추가 폼 */}
      {showAddForm && (
        <div className="mb-6 border border-gray-200 rounded-lg bg-white shadow-sm flex flex-col max-h-[80vh]">
          {/* 헤더: 제목 + 닫기 버튼 */}
          <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 flex-shrink-0">
            <h3 className="font-bold text-lg text-gray-900">새 수신자 추가</h3>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setNewLabel("");
                setNewChannels(["sms"]);
                setNewPhone("");
                setNewEmail("");
                setNewIsActive(true);
                setNewNotes("");
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="닫기"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 본문 (스크롤 가능) */}
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            {/* 이름 */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="예: 김주영"
                required
              />
            </div>

            {/* 채널 선택 (체크박스 UI) */}
            <div>
              <label className="block mb-3 text-sm font-medium text-gray-700">
                알림 채널 선택 <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-2">(다채널 선택 가능)</span>
              </label>
              <div className="space-y-3">
                {/* SMS */}
                <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={newChannels.includes("sms")}
                    onChange={() => toggleChannel("sms")}
                    className="mt-0.5 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">SMS</div>
                    <div className="text-xs text-gray-500 mt-0.5">문자 메시지 (전 세계 지원)</div>
                  </div>
                </label>

                {/* Alimtalk */}
                <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={newChannels.includes("alimtalk")}
                    onChange={() => toggleChannel("alimtalk")}
                    className="mt-0.5 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">알림톡 (Alimtalk)</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      💡 카카오 비즈 계정 + 템플릿 승인 필요 | 한국 전용
                    </div>
                  </div>
                </label>

                {/* Email */}
                <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={newChannels.includes("email")}
                    onChange={() => toggleChannel("email")}
                    className="mt-0.5 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Email</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      이메일 알림 (SMTP 설정 필요)
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* 전화번호 입력 (SMS/Alimtalk 선택 시) */}
            {(newChannels.includes("sms") || newChannels.includes("alimtalk")) && (
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  전화번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => {
                    const value = e.target.value;
                    // 숫자만 추출
                    const cleaned = value.replace(/\D/g, "");
                    // 최대 11자리로 제한
                    const limited = cleaned.slice(0, 11);
                    // 자동 포맷팅 (010-1234-5678)
                    setNewPhone(formatPhoneInput(limited));
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pastedText = e.clipboardData.getData("text");
                    // 숫자만 추출하고 최대 11자리
                    const cleaned = pastedText.replace(/\D/g, "").slice(0, 11);
                    setNewPhone(formatPhoneInput(cleaned));
                  }}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="010-1234-5678"
                  required
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  💡 010으로 시작하는 11자리 숫자 (자동으로 하이픈이 추가됩니다)
                </p>
              </div>
            )}

            {/* 이메일 입력 (Email 선택 시) */}
            {newChannels.includes("email") && (
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  이메일 주소 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="예: admin@healo.com"
                  required
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  📧 유효한 이메일 주소 형식으로 입력하세요
                </p>
              </div>
            )}

            {/* 활성화 체크박스 */}
            <div className="pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newIsActive}
                  onChange={(e) => setNewIsActive(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <span className="text-sm font-medium text-gray-700">활성화 (즉시 알림 수신)</span>
              </label>
            </div>

            {/* 메모 (선택) */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                메모 <span className="text-gray-400 text-xs">(선택)</span>
              </label>
              <textarea
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                placeholder="예: 야간 당직, 영업시간 외 담당자"
                rows={2}
              />
            </div>
          </div>

          {/* Footer (공용 컴포넌트) - 항상 하단 고정 */}
          <div className="flex-shrink-0 rounded-b-lg">
            <AdminFormFooter
              onPrimary={() => {
                // form submit 이벤트 시뮬레이션
                const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                handleAdd(fakeEvent);
              }}
              onCancel={() => {
                setShowAddForm(false);
                setNewLabel("");
                setNewChannels(["sms"]);
                setNewPhone("");
                setNewEmail("");
                setNewIsActive(true);
                setNewNotes("");
              }}
              primaryLabel="추가"
              primaryLoadingLabel="추가 중..."
              isLoading={submitting}
              isDisabled={false}
            />
          </div>
        </div>
      )}

      {/* 빈 상태 안내 */}
      {!tableMissing && recipients.length === 0 && !showAddForm && (
        <div className="mb-6 p-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">등록된 수신자가 없습니다</h3>
          <p className="text-gray-600 mb-4">
            문의 접수 시 알림을 받을 관리자를 추가하세요.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 shadow-md"
          >
            + 첫 번째 수신자 추가하기
          </button>
          <p className="mt-4 text-sm text-gray-500">
            ⚠️ 활성 수신자가 없으면 알림이 발송되지 않습니다.
          </p>
        </div>
      )}

      {/* 수신자 목록 */}
      {(recipients.length > 0 || tableMissing) && (
        <div className="border border-gray-300 rounded overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">이름</th>
                <th className="px-4 py-3 text-left">연락처</th>
                <th className="px-4 py-3 text-left">이메일</th>
                <th className="px-4 py-3 text-center">활성</th>
                <th className="px-4 py-3 text-center">발송</th>
                <th className="px-4 py-3 text-center">실패</th>
                <th className="px-4 py-3 text-left">마지막 발송</th>
                <th className="px-4 py-3 text-center">작업</th>
              </tr>
            </thead>
            <tbody>
              {recipients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    {tableMissing
                      ? "테이블이 존재하지 않습니다. 위 안내를 따라 마이그레이션을 실행하세요."
                      : "등록된 수신자가 없습니다."}
                  </td>
                </tr>
              ) : (
              recipients.map((recipient) => (
                  <tr key={recipient.id} className="border-t border-gray-200">
                    <td className="px-4 py-3">{recipient.label}</td>
                    <td className="px-4 py-3 font-mono text-sm">
                      {recipient.phone_masked || <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm">
                      {recipient.email ? (
                        <span className="text-blue-600">{recipient.email}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggle(recipient.id, recipient.is_active)}
                        className={`px-3 py-1 rounded text-sm ${
                          recipient.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {recipient.is_active ? "활성" : "비활성"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">{recipient.sent_count}</td>
                    <td className="px-4 py-3 text-center">
                      {recipient.failed_count > 0 ? (
                        <span className="text-red-600">{recipient.failed_count}</span>
                      ) : (
                        0
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {recipient.last_sent_at
                        ? new Date(recipient.last_sent_at).toLocaleString("ko-KR")
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEditStart(recipient)}
                          className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm hover:bg-yellow-200"
                          title="수신자 정보 수정"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleTestNotification(recipient.id)}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200"
                          title="이 수신자에게만 테스트 발송"
                        >
                          테스트
                        </button>
                        <button
                          onClick={() => handleDelete(recipient.id, recipient.label)}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
            )}
            </tbody>
          </table>
        </div>
      )}

      {/* ENV Fallback 경고 (활성 수신자 0명일 때만 표시) */}
      {recipients.filter(r => r.is_active).length === 0 && !tableMissing && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded">
          <h3 className="font-bold mb-2 text-red-800">⚠️ 경고: 활성 수신자가 없습니다</h3>
          <p className="text-sm text-red-700 mb-2">
            현재 활성화된 수신자가 없어 <strong>알림이 발송되지 않습니다</strong>.
          </p>
          <p className="text-sm text-red-600">
            비상 시 ADMIN_PHONE_NUMBERS 환경변수로 대체 가능합니다.
          </p>
        </div>
      )}

      {/* 테스트 알림 */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={() => handleTestNotification()}
          disabled={errorCode === "TABLE_NOT_FOUND" || recipients.length === 0}
          className={`px-4 py-2 rounded ${
            errorCode === "TABLE_NOT_FOUND" || recipients.length === 0
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
          title={
            errorCode === "TABLE_NOT_FOUND"
              ? "마이그레이션 실행 후 사용 가능"
              : recipients.length === 0
              ? "수신자를 먼저 추가하세요"
              : ""
          }
        >
          📱 전체 수신자 테스트 발송
        </button>
        
        <p className="text-sm text-gray-600 self-center">
          {errorCode === "TABLE_NOT_FOUND"
            ? "(마이그레이션 실행 후 사용 가능)"
            : recipients.length === 0
            ? "(수신자를 먼저 추가하세요)"
            : "활성화된 모든 수신자에게 테스트 알림을 발송합니다."}
        </p>
      </div>

      {/* Toast 알림 */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
          <div
            className="px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]"
            style={{ 
              backgroundColor: toast.type === "success" ? "#16a34a" : "#dc2626",
              color: '#ffffff'
            }}
          >
            <span className="text-xl" style={{ color: '#ffffff' }}>
              {toast.type === "success" ? "✓" : "✕"}
            </span>
            <span className="font-medium" style={{ color: '#ffffff' }}>
              {toast.message}
            </span>
          </div>
        </div>
      )}

      {/* 수정 모달 (P0: 전체 필드 수정 가능) */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
            {/* 헤더 */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-xl font-bold text-gray-900">수신자 수정</h3>
              <button
                onClick={handleEditCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="닫기"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 본문 (스크롤 가능) */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* 이름 */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editModal.label}
                  onChange={(e) => setEditModal({ ...editModal, label: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="예: 김주영"
                  required
                />
              </div>

              {/* 채널 (라디오 버튼 UI) */}
              <div>
                <label className="block mb-3 text-sm font-medium text-gray-700">
                  채널 <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  {/* SMS */}
                  <label className="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="edit-channel"
                      checked={editModal.channel === "sms"}
                      onChange={() => setEditModal({ ...editModal, channel: "sms" })}
                      className="mt-0.5 w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">SMS</div>
                      <div className="text-xs text-gray-500 mt-0.5">문자 메시지 (전 세계 지원)</div>
                    </div>
                  </label>

                  {/* Alimtalk */}
                  <label className="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="edit-channel"
                      checked={editModal.channel === "alimtalk"}
                      onChange={() => setEditModal({ ...editModal, channel: "alimtalk" })}
                      className="mt-0.5 w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">알림톡 (Alimtalk)</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        💡 카카오 비즈 계정 + 템플릿 승인 필요 | 한국 전용
                      </div>
                    </div>
                  </label>

                  {/* Email */}
                  <label className="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="edit-channel"
                      checked={editModal.channel === "email"}
                      onChange={() => setEditModal({ ...editModal, channel: "email" })}
                      className="mt-0.5 w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Email</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        이메일 알림 (SMTP 설정 필요)
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* 전화번호 (선택적 변경 - SMS/Alimtalk만) */}
              {(editModal.channel === "sms" || editModal.channel === "alimtalk") && (
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    전화번호 <span className="text-gray-400 text-xs">(변경 시에만 입력)</span>
                  </label>
                  <input
                    type="text"
                    value={editModal.phone}
                    onChange={(e) => {
                      const value = e.target.value;
                      // 숫자만 추출
                      const cleaned = value.replace(/\D/g, "");
                      // 최대 11자리로 제한
                      const limited = cleaned.slice(0, 11);
                      // 자동 포맷팅 (010-1234-5678)
                      setEditModal({ ...editModal, phone: formatPhoneInput(limited) });
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedText = e.clipboardData.getData("text");
                      // 숫자만 추출하고 최대 11자리
                      const cleaned = pastedText.replace(/\D/g, "").slice(0, 11);
                      setEditModal({ ...editModal, phone: formatPhoneInput(cleaned) });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="010-1234-5678 (비워두면 기존 번호 유지)"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">
                    💡 비워두면 기존 번호가 유지됩니다 | 010으로 시작하는 11자리 숫자
                  </p>
                </div>
              )}

              {/* 이메일 (선택적 변경 - Email만) */}
              {editModal.channel === "email" && (
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    이메일 주소 <span className="text-gray-400 text-xs">(변경 시에만 입력)</span>
                  </label>
                  <input
                    type="email"
                    value={editModal.email}
                    onChange={(e) => setEditModal({ ...editModal, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="예: admin@healo.com (비워두면 기존 이메일 유지)"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">
                    📧 비워두면 기존 이메일이 유지됩니다
                  </p>
                </div>
              )}

              {/* 활성화 */}
              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editModal.isActive}
                    onChange={(e) => setEditModal({ ...editModal, isActive: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium text-gray-700">활성화 (즉시 알림 수신)</span>
                </label>
              </div>

              {/* 메모 */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  메모 <span className="text-gray-400 text-xs">(선택)</span>
                </label>
                <textarea
                  value={editModal.notes}
                  onChange={(e) => setEditModal({ ...editModal, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  placeholder="예: 야간 당직, 영업시간 외 담당자"
                  rows={2}
                />
              </div>
            </div>

            {/* Footer (공용 컴포넌트) */}
            <div className="flex-shrink-0">
              <AdminFormFooter
                onPrimary={handleEditSave}
                onCancel={handleEditCancel}
                primaryLabel="저장"
                primaryLoadingLabel="저장 중..."
                isLoading={false}
                isDisabled={!editModal.label.trim()}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
