"use client";

import { AdminGateClient } from "./_components/AdminGateClient";
import { AdminNav } from "./_components/AdminNav";

/**
 * Admin Layout: 모든 /admin/* 라우트에 적용되는 공통 레이아웃
 * - AdminGateClient: whoami 권한 체크
 * - 2컬럼 구조: 왼쪽 사이드바(AdminNav) + 오른쪽 컨텐츠
 */
export default function AdminLayout({ children }) {
  return (
    <AdminGateClient>
      <div className="flex min-h-screen bg-gray-50">
        {/* 좌측 사이드바 */}
        <AdminNav />
        
        {/* 우측 컨텐츠 영역 */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </AdminGateClient>
  );
}
