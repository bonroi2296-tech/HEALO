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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
        <p className="text-gray-500 mt-2">HEALO 플랫폼 관리</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <button
              key={link.href}
              onClick={() => router.push(link.href)}
              className="bg-white p-6 rounded-xl border border-gray-200 hover:border-teal-300 hover:shadow-lg transition text-left group"
            >
              <Icon size={36} className="text-teal-600 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition">
                {link.title}
              </h3>
              <p className="text-sm text-gray-500 mb-4">{link.description}</p>
              <div className="flex items-center text-teal-600 text-sm font-medium">
                바로가기 <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
