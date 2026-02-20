"use client";

import { useRouter } from "next/navigation";
import { 
  MessageSquare, 
  Building2, 
  Stethoscope, 
  BarChart3, 
  FileText,
  Brain,
  ArrowRight 
} from "lucide-react";

const quickLinks = [
  { title: "문의관리", href: "/admin/inquiries", icon: MessageSquare, description: "고객 문의 관리" },
  { title: "병원관리", href: "/admin/hospitals", icon: Building2, description: "병원 데이터베이스" },
  { title: "시술관리", href: "/admin/treatments", icon: Stethoscope, description: "시술 카탈로그" },
  { title: "통계", href: "/admin/analytics", icon: BarChart3, description: "인사이트 보기" },
  { title: "감사로그", href: "/admin/audit", icon: FileText, description: "활동 기록" },
  { title: "RAG", href: "/admin/rag", icon: Brain, description: "AI 관리" },
];

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">관리자 대시보드</h1>
        <p className="text-gray-500 mt-1 lg:mt-2 text-sm lg:text-base">HEALO 플랫폼 관리</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <button
              key={link.href}
              onClick={() => router.push(link.href)}
              className="bg-white p-4 lg:p-6 rounded-xl border border-gray-200 hover:border-teal-300 hover:shadow-lg transition text-left group"
            >
              <Icon size={28} className="text-teal-600 mb-2 lg:mb-4 lg:w-9 lg:h-9" />
              <h3 className="text-sm lg:text-lg font-bold text-gray-900 mb-1 lg:mb-2 group-hover:text-teal-600 transition">
                {link.title}
              </h3>
              <p className="text-xs lg:text-sm text-gray-500 mb-2 lg:mb-4 hidden sm:block">{link.description}</p>
              <div className="flex items-center text-teal-600 text-xs lg:text-sm font-medium">
                바로가기 <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
