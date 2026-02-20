"use client";

import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Building2, 
  Stethoscope, 
  BarChart3, 
  FileText,
  Brain,
  LogOut,
  Users,
  Bell,
  Palette,
  Upload
} from "lucide-react";
import { createSupabaseBrowserClient } from "../../../src/lib/supabase/browser";

const navGroups = [
  {
    title: "운영",
    items: [
      { id: "dashboard", label: "대시보드", icon: LayoutDashboard, href: "/admin" },
      { id: "inquiries", label: "문의관리", icon: MessageSquare, href: "/admin/inquiries" },
      { id: "leads", label: "리드관리(현재 미구현)", icon: Users, href: "/admin/leads" },
    ]
  },
  {
    title: "데이터 관리",
    items: [
      { id: "hospitals", label: "병원관리", icon: Building2, href: "/admin/hospitals" },
      { id: "treatments", label: "시술관리", icon: Stethoscope, href: "/admin/treatments" },
      { id: "import", label: "대량 Import", icon: Upload, href: "/admin/import" },
    ]
  },
  {
    title: "분석 및 도구",
    items: [
      { id: "analytics", label: "문의 현황", icon: BarChart3, href: "/admin/analytics" },
      { id: "rag", label: "RAG 관리", icon: Brain, href: "/admin/rag" },
    ]
  },
  {
    title: "시스템",
    items: [
      { id: "audit", label: "감사로그", icon: FileText, href: "/admin/audit" },
      { id: "notifications", label: "알림 관리", icon: Bell, href: "/admin/settings/notifications" },
      { id: "branding", label: "브랜딩 설정", icon: Palette, href: "/admin/settings/branding" },
    ]
  }
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <aside className="w-72 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Logo/Title */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
            <LayoutDashboard size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">HEALO</h1>
            <p className="text-xs text-gray-500">관리자 포털</p>
          </div>
        </div>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.title}>
            <h3 className="px-4 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                
                return (
                  <button
                    key={item.id}
                    onClick={() => router.push(item.href)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-teal-50 text-teal-700 shadow-sm"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon size={20} className={isActive ? "text-teal-600" : "text-gray-400"} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut size={20} />
          <span>로그아웃</span>
        </button>
      </div>
    </aside>
  );
}
