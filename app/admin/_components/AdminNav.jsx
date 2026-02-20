"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
  Upload,
  Menu,
  X
} from "lucide-react";
import { createSupabaseBrowserClient } from "../../../src/lib/supabase/browser";

const navGroups = [
  {
    title: "운영",
    items: [
      { id: "dashboard", label: "대시보드", icon: LayoutDashboard, href: "/admin" },
      { id: "inquiries", label: "문의관리", icon: MessageSquare, href: "/admin/inquiries" },
      { id: "leads", label: "리드관리", icon: Users, href: "/admin/leads" },
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
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const NavContent = () => (
    <>
      <div className="p-4 lg:p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
              <LayoutDashboard size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-base lg:text-lg font-bold text-gray-900">HEALO</h1>
              <p className="text-[10px] lg:text-xs text-gray-500">관리자 포털</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <nav className="flex-1 p-3 lg:p-4 space-y-4 lg:space-y-6 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.title}>
            <h3 className="px-3 lg:px-4 mb-1.5 lg:mb-2 text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-wider">
              {group.title}
            </h3>
            <div className="space-y-0.5 lg:space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`w-full flex items-center gap-3 px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-teal-50 text-teal-700 shadow-sm"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon size={18} className={isActive ? "text-teal-600" : "text-gray-400"} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 lg:p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut size={18} />
          <span>로그아웃</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile: top bar with hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
            <LayoutDashboard size={16} className="text-white" />
          </div>
          <span className="font-bold text-gray-900">HEALO Admin</span>
        </div>
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile: overlay sidebar */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
            <NavContent />
          </aside>
        </div>
      )}

      {/* Desktop: fixed sidebar */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-gray-200 min-h-screen flex-col sticky top-0 h-screen">
        <NavContent />
      </aside>
    </>
  );
}
