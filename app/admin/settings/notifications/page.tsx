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

interface Recipient {
  id: string;
  label: string;
  phone_masked: string;
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

  // 추가 폼 상태
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 수신자 목록 조회
  const fetchRecipients = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/notification-recipients");
      const data = await res.json();

      if (data.ok) {
        setRecipients(data.recipients || []);
        setError(null);
      } else {
        setError(data.error || "Failed to load recipients");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 수신자 추가
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newLabel || !newPhone) {
      alert("이름과 전화번호를 입력하세요");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch("/api/admin/notification-recipients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: newLabel,
          phone: newPhone,
          channel: "sms",
          notes: newNotes,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        alert("수신자가 추가되었습니다");
        setNewLabel("");
        setNewPhone("");
        setNewNotes("");
        setShowAddForm(false);
        fetchRecipients();
      } else {
        alert(`추가 실패: ${data.error}`);
      }
    } catch (err: any) {
      alert(`오류: ${err.message}`);
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
        fetchRecipients();
      } else {
        alert(`토글 실패: ${data.error}`);
      }
    } catch (err: any) {
      alert(`오류: ${err.message}`);
    }
  };

  // 삭제
  const handleDelete = async (id: string, label: string) => {
    if (!confirm(`${label} 수신자를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/notification-recipients/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.ok) {
        alert("삭제되었습니다");
        fetchRecipients();
      } else {
        alert(`삭제 실패: ${data.error}`);
      }
    } catch (err: any) {
      alert(`오류: ${err.message}`);
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

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">알림 수신자 관리</h1>
        <p className="text-gray-600">문의 접수 시 알림을 받을 관리자를 설정합니다.</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          오류: {error}
        </div>
      )}

      {/* 추가 버튼 */}
      <div className="mb-6">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showAddForm ? "취소" : "+ 수신자 추가"}
        </button>
      </div>

      {/* 추가 폼 */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="mb-6 p-4 border border-gray-300 rounded">
          <h3 className="font-bold mb-4">새 수신자 추가</h3>

          <div className="mb-4">
            <label className="block mb-1 font-medium">이름 *</label>
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              placeholder="예: 김주영"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">전화번호 (E.164 형식) *</label>
            <input
              type="text"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              placeholder="예: +821012345678"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              + 기호로 시작, 국가코드 포함 (예: +82-10-1234-5678)
            </p>
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">메모 (선택)</label>
            <textarea
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              placeholder="예: 야간 당직"
              rows={2}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {submitting ? "추가 중..." : "추가"}
          </button>
        </form>
      )}

      {/* 수신자 목록 */}
      <div className="border border-gray-300 rounded overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">이름</th>
              <th className="px-4 py-3 text-left">전화번호</th>
              <th className="px-4 py-3 text-left">채널</th>
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
                  등록된 수신자가 없습니다. ENV fallback이 작동합니다.
                </td>
              </tr>
            ) : (
              recipients.map((recipient) => (
                <tr key={recipient.id} className="border-t border-gray-200">
                  <td className="px-4 py-3">{recipient.label}</td>
                  <td className="px-4 py-3 font-mono text-sm">{recipient.phone_masked}</td>
                  <td className="px-4 py-3">{recipient.channel}</td>
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
                    <button
                      onClick={() => handleDelete(recipient.id, recipient.label)}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ENV Fallback 안내 */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-bold mb-2">💡 ENV Fallback</h3>
        <p className="text-sm text-gray-700 mb-2">
          DB에 활성 수신자가 없거나 오류 시 환경변수(ADMIN_PHONE_NUMBERS)로 자동 전환됩니다.
        </p>
        <p className="text-sm text-gray-700">
          현재 ENV: <code className="bg-gray-100 px-2 py-1 rounded">
            {process.env.ADMIN_PHONE_NUMBERS || "(미설정)"}
          </code>
        </p>
      </div>

      {/* 테스트 알림 */}
      <div className="mt-6">
        <button
          onClick={() => {
            if (confirm("테스트 알림을 발송하시겠습니까?")) {
              alert("테스트 알림 기능은 별도 구현이 필요합니다.");
              // TODO: 테스트 알림 API 호출
            }
          }}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          📱 테스트 알림 발송
        </button>
      </div>
    </div>
  );
}
