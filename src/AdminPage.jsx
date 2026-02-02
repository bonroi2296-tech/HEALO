"use client";

// src/AdminPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { createSupabaseBrowserClient } from './lib/supabase/browser';

// ✅ SSR-safe browser client (쿠키 기반 세션)
const supabase = createSupabaseBrowserClient();
import {
  RefreshCw, Loader2, Paperclip, X,
  LayoutDashboard, Building2, 
  Stethoscope, MessageSquare, Plus, Save, Trash2,
  ImageIcon, User, LogOut, Globe, Coffee, Trophy, UploadCloud, Info, Settings,
  BarChart3, TrendingUp, DollarSign, Activity, AlertCircle, Target, ArrowRightCircle, Clock
} from 'lucide-react';
import { useToast } from './components/Toast';
import { AddressInput } from './components/AddressInput';
import { AnalyticsTab } from './legacy-pages/admin/AnalyticsTab';
import { InquiryManager } from './legacy-pages/admin/InquiryManager';
import { HospitalManager } from './legacy-pages/admin/HospitalManager';
import { TreatmentManager } from './legacy-pages/admin/TreatmentManager';
import { SiteSettings as SiteSettingsTab } from './legacy-pages/admin/SiteSettings';
import { AdminAuditPage } from './legacy-pages/AdminAuditPage';

// ==========================================
// 1. 텍스트 입력용 동적 리스트
// ==========================================
const DynamicListInput = ({ items, onAdd, onRemove, placeholder, icon: Icon }) => {
    const [newItem, setNewItem] = useState('');
    const handleAdd = () => {
        if (newItem.trim()) {
            onAdd(newItem.trim());
            setNewItem('');
        }
    };
    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    {Icon && <Icon size={16} className="absolute left-3 top-3 text-gray-400"/>}
                    <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())} className={`w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition ${Icon ? 'pl-10' : ''}`} placeholder={placeholder} />
                </div>
                <button type="button" onClick={handleAdd} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 rounded-lg font-bold text-sm transition">추가</button>
            </div>
            <div className="flex flex-wrap gap-2">
                {items.map((item, idx) => (
                    <span key={idx} className="bg-teal-50 text-teal-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 border border-teal-100">
                        {item} <button type="button" onClick={() => onRemove(idx)} className="hover:text-red-500"><X size={12}/></button>
                    </span>
                ))}
            </div>
        </div>
    );
};

// ==========================================
// 2. 이미지 파일 업로더
// ==========================================
const ImageUploader = ({ images, onUpload, onRemove, uploading }) => {
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        await onUpload(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <input 
                        type="file" 
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="hidden" 
                        id="file-upload-input"
                    />
                    <label 
                        onClick={() => fileInputRef.current.click()}
                        className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-gray-300 text-sm text-gray-500 cursor-pointer hover:bg-gray-50 hover:border-teal-500 transition ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {uploading ? <Loader2 size={18} className="animate-spin"/> : <UploadCloud size={18}/>}
                        {uploading ? "업로드 중..." : "클릭하여 이미지 업로드 (JPG, PNG)"}
                    </label>
                </div>
            </div>
            
            {images.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                    {images.map((url, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                            <img src={url} alt="upload" className="w-full h-full object-cover" />
                            <button 
                                onClick={() => onRemove(idx)} 
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-80 hover:opacity-100 transition shadow-sm"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


export const AdminPage = ({ setView }) => {
  const toast = useToast(); // Toast 사용 준비
  const [activeTab, setActiveTab] = useState('analytics'); 
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [accessToken, setAccessToken] = useState(null); // ✅ Admin Audit Page용

  const [inquiries, setInquiries] = useState([]);
  const [hospitalsList, setHospitalsList] = useState([]);
  const [treatmentsList, setTreatmentsList] = useState([]);
  const [hospitalsError, setHospitalsError] = useState(null);
  const [treatmentsError, setTreatmentsError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewError, setPreviewError] = useState(false);
  const [siteSettings, setSiteSettings] = useState({ logo_url: '', hero_background_url: '' });

  // 통계 데이터 상태
  const [analytics, setAnalytics] = useState({
      totalRevenue: 0,
      totalLeads: 0,
      topTreatment: '-',
      hospitalOpportunities: [],
      treatmentTrends: []
  });

  // 병원 폼
  const [editingHospitalId, setEditingHospitalId] = useState(null);
  const [hospitalForm, setHospitalForm] = useState({ 
      name: '', location_kr: '', location_en: '', address_detail: '', description: '', 
      latitude: null, longitude: null,
      tags: [], images: [], 
      languages: [], amenities: [], 
      hoursMonFri: '09:00 - 18:00', hoursSat: '09:00 - 13:00', 
      doctorName: '', doctorTitle: '', doctorImage: '', 
      doctorSchool: '', doctorYears: '', doctorSpecialties: [], 
      doctorMetricValue: '99%', doctorMetricLabel: '만족도',
      displayOrder: null, // ✅ 메인 페이지 표시 순서
      isPublished: true // ✅ 프론트 노출 여부
  });

  // 시술 폼
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [editingTreatmentId, setEditingTreatmentId] = useState(null);
  const [treatmentForm, setTreatmentForm] = useState({ 
      title: '', desc: '', fullDescription: '', 
      priceMin: '', recoveryTime: '', 
      benefits: [], tags: [], images: [],
      displayOrder: null, // ✅ 메인 페이지 표시 순서
      isPublished: true // ✅ 프론트 노출 여부
  });

  // ==========================================
  // API Calls & Logic
  // ==========================================

  // 🚪 로그아웃 핸들러 (완전 세션 정리)
  const handleLogout = async () => {
    try {
      // 1. Supabase 로그아웃
      await supabase.auth.signOut();
      
      // 2. 모든 로컬 스토리지 정리
      localStorage.clear();
      sessionStorage.clear();
      
      // 3. Supabase 쿠키 수동 삭제 (혹시 모를 경우 대비)
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      console.log('[AdminPage] ✅ Logged out - all sessions cleared');
      
      // 4. 홈으로 강제 이동 (캐시 무효화)
      window.location.href = '/?t=' + Date.now();
    } catch (error) {
      console.error('[AdminPage] Logout error:', error);
      // 에러 발생해도 강제로 홈으로 이동
      window.location.href = '/';
    }
  };
  
  const fetchInquiries = async () => { 
    try {
      // ✅ 1. 세션에서 access_token 가져오기
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      
      if (!token) {
        console.warn('[AdminPage] No access token, redirecting to login');
        setView('login');
        return;
      }

      // ✅ Admin Audit Page용 token 저장
      setAccessToken(token);

      // ✅ 2. 관리자 전용 API 호출 (목록은 마스킹, 상세만 복호화)
      // 🔒 보안 강화: 목록 조회 시 decrypt=false (마스킹된 데이터)
      const response = await fetch('/api/admin/inquiries?limit=200&decrypt=false', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (result.ok) {
        const status = result.masked ? 'masked' : 'decrypted';
        console.log(`[AdminPage] ✅ Inquiries loaded (${status}):`, result.inquiries?.length || 0);
        setInquiries(result.inquiries || []);
      } else {
        console.error('[AdminPage] ❌ API failed:', result.error, result.debug);
        if (result.error === 'unauthorized') {
          setView('login');
        } else {
          // 에러 표시 (fallback 제거 - 암호문 표시 방지)
          alert(`문의 로딩 실패: ${result.error}\n\n관리자에게 문의하세요.`);
          setInquiries([]);
        }
      }
    } catch (error) {
      console.error('[AdminPage] ❌ fetchInquiries error:', error);
      // 에러 표시 (fallback 제거 - 암호문 표시 방지)
      alert(`문의 로딩 실패: ${error.message}\n\n새로고침 후 다시 시도하세요.`);
      setInquiries([]);
    }
  };
  const fetchHospitals = async () => {
      const { data, error } = await supabase.from('hospitals').select('*').order('created_at', { ascending: false });
      if (error) {
          console.error('[AdminPage] Hospitals fetch error:', error);
          setHospitalsError(error);
          setHospitalsList([]);
          return;
      }
      setHospitalsError(null);
      setHospitalsList(data || []);
  };
  const fetchTreatments = async (hId) => {
      if(!hId) return;
      const { data, error } = await supabase.from('treatments').select('*').eq('hospital_id', hId).order('created_at', { ascending: false });
      if (error) {
          console.error('[AdminPage] Treatments fetch error:', error);
          setTreatmentsError(error);
          setTreatmentsList([]);
          return;
      }
      setTreatmentsError(null);
      setTreatmentsList(data || []);
  };
  
  const fetchSiteSettings = async () => {
      const { data } = await supabase.from('site_settings').select('*').single();
      if(data) setSiteSettings(data);
  };

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchInquiries(), fetchHospitals(), fetchSiteSettings()]);
    setLoading(false);
  };

  useEffect(() => {
    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || session.user.email !== 'admin@healo.com') {
            toast.error('관리자 권한이 없습니다 🛡️'); setView('login');
        } else {
            fetchAllData();
        }
    };
    checkSession();
  }, []);

  // 🔥 [Analytics] Sales Intelligence Logic (한국어 대응)
  useEffect(() => {
      if (inquiries.length === 0) return;

      const AVG_PRICE = 3500; // 평균 시술 단가 ($3,500 가정)

      // 1. Demand Trends (시술 트렌드)
      const treatmentCounts = {};
      inquiries.forEach(q => {
          const type = q.treatment_type || 'General Inquiry';
          treatmentCounts[type] = (treatmentCounts[type] || 0) + 1;
      });
      const sortedTrends = Object.entries(treatmentCounts)
          .sort(([,a], [,b]) => b - a)
          .map(([name, count]) => ({ name, count, percent: Math.round((count / inquiries.length) * 100) }));

      // 2. Opportunity Analysis (병원별 기회 비용 분석)
      const hospitalCounts = {};
      inquiries.forEach(q => {
          const hId = q.hospital_id || 'unassigned';
          hospitalCounts[hId] = (hospitalCounts[hId] || 0) + 1;
      });

      const opportunities = Object.entries(hospitalCounts).map(([id, count]) => {
          const hospital = hospitalsList.find(h => h.id === id);
          const isUnassigned = id === 'unassigned';
          // 태그에 'Partner'가 있으면 제휴 병원
          const isPartner = hospital?.tags?.some(t => String(t).toLowerCase().includes('partner'));
          
          return {
              id,
              name: hospital ? hospital.name : (isUnassigned ? '미지정 수요 (Floating Demand)' : 'Unknown'),
              count,
              marketValue: count * AVG_PRICE, // 시장 가치
              status: isPartner ? '매칭 완료' : (isUnassigned ? '기회 비용 (Missed)' : '이탈 우려'),
              // 영업 행동 가이드
              action: isPartner ? '관계 유지 관리' : (isUnassigned ? '신규 제휴 제안 시급' : '영업 타겟팅 대상')
          };
      }).sort((a, b) => b.marketValue - a.marketValue);

      setAnalytics({
          totalLeads: inquiries.length,
          totalRevenue: inquiries.length * AVG_PRICE,
          topTreatment: sortedTrends[0]?.name || '-',
          hospitalOpportunities: opportunities,
          treatmentTrends: sortedTrends
      });

  }, [inquiries, hospitalsList]);


  // 🔒 RLS 보안: 클라이언트에서 직접 update 금지
  // Status 변경은 추후 /api/admin/inquiries/[id] PATCH로 구현 필요
  const handleStatusChange = async (id, newStatus) => { 
    alert('⚠️ Status 변경은 현재 비활성화되어 있습니다.\n관리자 API를 통해 구현 예정입니다.');
    // await supabase.from('inquiries').update({ status: newStatus }).eq('id', id); 
    // fetchInquiries(); 
  };
  const handleDelete = async (table, id, cb) => { 
      if(!confirm("정말 삭제하시겠습니까? 복구할 수 없습니다.")) return;
      
      try {
          const { error } = await supabase.from(table).delete().eq('id', id);
          if (error) {
              console.error(`[AdminPage] Delete ${table} error:`, error);
              toast.error("삭제 실패: " + error.message);
              return;
          }
          toast.success("삭제되었습니다.");
          if (cb) cb();
      } catch (err) {
          console.error(`[AdminPage] Delete ${table} exception:`, err);
          toast.error("삭제 실패: " + err.message);
      }
  };
  
  const closeFilePreview = () => {
    setSelectedFile(null);
    setPreviewError(false);
  };
  
  const handleDownload = async () => {
    if (!selectedFile) return;
    
    try {
      console.log('[AdminPage] Starting download:', selectedFile);
      
      // Fetch the file as blob
      const response = await fetch(selectedFile);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      
      // Create blob URL
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Extract filename from URL
      const urlParts = selectedFile.split('/');
      const filename = urlParts[urlParts.length - 1].split('?')[0] || 'attachment';
      
      // Create download link
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      window.URL.revokeObjectURL(blobUrl);
      
      console.log('[AdminPage] Download completed:', filename);
    } catch (error) {
      console.error('[AdminPage] Download error:', error);
      toast.error("다운로드 실패: " + error.message);
    }
  };
  
  const handleFileClick = async (storagePath) => {
    try {
      console.log('[AdminPage] Raw attachment path:', storagePath);
      
      if (!storagePath) {
        toast.error("첨부파일 경로가 없습니다.");
        return;
      }
      
      let normalizedPath = storagePath.trim();
      
      // URL 형식인 경우 path만 추출 (오래된 데이터 대응)
      if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')) {
        console.log('[AdminPage] Detected full URL, extracting path...');
        try {
          const url = new URL(normalizedPath);
          // /storage/v1/object/public/attachments/inquiry/xxx 에서 inquiry/xxx만 추출
          const pathParts = url.pathname.split('/');
          const attachmentsIndex = pathParts.indexOf('attachments');
          if (attachmentsIndex !== -1 && pathParts.length > attachmentsIndex + 1) {
            normalizedPath = pathParts.slice(attachmentsIndex + 1).join('/');
            console.log('[AdminPage] Extracted path from URL:', normalizedPath);
          } else {
            throw new Error('Cannot extract path from URL');
          }
        } catch (urlError) {
          console.error('[AdminPage] URL parsing failed:', urlError);
          toast.error("첨부파일 URL 형식이 잘못되었습니다.");
          return;
        }
      }
      
      // 경로 정규화: 'attachments/' 중복 제거
      if (normalizedPath.startsWith('attachments/')) {
        normalizedPath = normalizedPath.substring('attachments/'.length);
      }
      console.log('[AdminPage] Normalized path:', normalizedPath);
      
      // 1차 시도: Signed URL 생성
      const { data, error } = await supabase
        .storage
        .from('attachments')
        .createSignedUrl(normalizedPath, 3600);
      
      if (error) {
        console.error('[AdminPage] Signed URL error:', error);
        console.error('[AdminPage] Error details:', { 
          message: error.message, 
          statusCode: error.statusCode,
          path: normalizedPath 
        });
        
        // 2차 시도: Public URL 사용 (파일이 public이라면)
        console.log('[AdminPage] Trying public URL as fallback...');
        const { data: publicData } = supabase
          .storage
          .from('attachments')
          .getPublicUrl(normalizedPath);
        
        if (publicData?.publicUrl) {
          console.log('[AdminPage] Using public URL:', publicData.publicUrl);
          setPreviewError(false);
          setSelectedFile(publicData.publicUrl);
          return;
        }
        
        toast.error("첨부파일을 찾을 수 없습니다. 파일이 삭제되었거나 경로가 잘못되었습니다.");
        return;
      }
      
      console.log('[AdminPage] Signed URL generated successfully');
      setPreviewError(false);
      setSelectedFile(data.signedUrl);
    } catch (err) {
      console.error('[AdminPage] handleFileClick exception:', err);
      toast.error("첨부파일 로드 실패: " + (err.message || '알 수 없는 오류'));
    }
  };
  const getFileType = (url) => {
    // Signed URL은 쿼리스트링이 포함되므로 제거
    const clean = url.split('?')[0];
    const ext = clean.split('.').pop().toLowerCase();
    const fileType = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif'].includes(ext) 
      ? 'image' 
      : (ext === 'pdf' ? 'pdf' : 'other');
    
    console.debug('[getFileType]', { url: url.substring(0, 80) + '...', clean, ext, fileType });
    return fileType;
  };

  const uploadToSupabase = async (file) => {
      if (!file) return null;
      setUploading(true);
      try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
          const filePath = `uploads/${fileName}`;

          const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);
          if (uploadError) throw uploadError;

          const { data } = supabase.storage.from('images').getPublicUrl(filePath);
          return data.publicUrl;
      } catch (error) {
          console.error('Upload failed:', error);
          toast.error('이미지 업로드 실패: ' + error.message);
          return null;
      } finally {
          setUploading(false);
      }
  };

  // 저장 로직들...
  const handleSaveHospital = async () => {
      if(!hospitalForm.name) return toast.error("병원명은 필수입니다.");
      setLoading(true);
      const generatedSlug = hospitalForm.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '') || `hospital-${Date.now()}`;
      
      // ✅ 이미지 배열 타입 보장 (text[] 타입에 맞춤)
      const imagesArray = Array.isArray(hospitalForm.images) 
          ? hospitalForm.images 
          : (hospitalForm.images ? [hospitalForm.images] : []);
      
      const payload = {
          name: hospitalForm.name, slug: generatedSlug, 
          location_kr: hospitalForm.location_kr?.trim() || null,
          location_en: hospitalForm.location_en?.trim() || null,
          address_detail: hospitalForm.address_detail?.trim() || null,
          description: hospitalForm.description, 
          latitude: hospitalForm.latitude, longitude: hospitalForm.longitude,
          tags: hospitalForm.tags, images: imagesArray, 
          supported_languages: hospitalForm.languages, amenities: hospitalForm.amenities,
          operating_hours: { mon_fri: hospitalForm.hoursMonFri, sat: hospitalForm.hoursSat },
          doctor_profile: { 
              name: hospitalForm.doctorName, title: hospitalForm.doctorTitle, image: hospitalForm.doctorImage, 
              school: hospitalForm.doctorSchool, years: hospitalForm.doctorYears, specialties: hospitalForm.doctorSpecialties, 
              heroMetric: { value: hospitalForm.doctorMetricValue, label: hospitalForm.doctorMetricLabel } 
          },
          display_order: hospitalForm.displayOrder ? Number(hospitalForm.displayOrder) : null, // ✅ 메인 페이지 표시 순서
          is_published: hospitalForm.isPublished !== undefined ? hospitalForm.isPublished : true // ✅ 프론트 노출 여부
      };
      
      console.log('[AdminPage] Hospital payload:', { ...payload, images: imagesArray });

      try {
          // ✅ display_order 중복 방지: 새로운 순서가 설정되어 있고, 다른 항목이 이미 사용 중이면 재정렬
          if (payload.display_order !== null && payload.display_order !== undefined) {
              // 현재 편집 중인 항목의 기존 순서 확인
              let oldOrder = null;
              if (editingHospitalId) {
                  const { data: current } = await supabase
                      .from('hospitals')
                      .select('display_order')
                      .eq('id', editingHospitalId)
                      .single();
                  oldOrder = current?.display_order || null;
              }
              
              // 중복 확인 (현재 편집 중인 항목 제외)
              const { data: conflicts } = await supabase
                  .from('hospitals')
                  .select('id, display_order')
                  .eq('display_order', payload.display_order)
                  .neq('id', editingHospitalId || '00000000-0000-0000-0000-000000000000');
              
              if (conflicts && conflicts.length > 0) {
                  // 중복이 있으면 재정렬
                  if (oldOrder === null || payload.display_order < oldOrder) {
                      // 순서를 앞으로 이동: 새로운 순서 이상, 기존 순서 미만인 항목들을 +1
                      const { data: toShift } = await supabase
                          .from('hospitals')
                          .select('id, display_order')
                          .gte('display_order', payload.display_order)
                          .lt('display_order', oldOrder || 999999)
                          .neq('id', editingHospitalId || '00000000-0000-0000-0000-000000000000');
                      
                      if (toShift && toShift.length > 0) {
                          for (const item of toShift) {
                              await supabase
                                  .from('hospitals')
                                  .update({ display_order: (item.display_order || 0) + 1 })
                                  .eq('id', item.id);
                          }
                      }
                  } else if (payload.display_order > oldOrder) {
                      // 순서를 뒤로 이동: 기존 순서 초과, 새로운 순서 이하인 항목들을 -1
                      const { data: toShift } = await supabase
                          .from('hospitals')
                          .select('id, display_order')
                          .gt('display_order', oldOrder || -1)
                          .lte('display_order', payload.display_order)
                          .neq('id', editingHospitalId || '00000000-0000-0000-0000-000000000000');
                      
                      if (toShift && toShift.length > 0) {
                          for (const item of toShift) {
                              await supabase
                                  .from('hospitals')
                                  .update({ display_order: (item.display_order || 0) - 1 })
                                  .eq('id', item.id);
                          }
                      }
                  } else {
                      // 같은 순서로 변경하려고 하면 기존 항목을 +1
                      const { data: toShift } = await supabase
                          .from('hospitals')
                          .select('id, display_order')
                          .eq('display_order', payload.display_order)
                          .neq('id', editingHospitalId || '00000000-0000-0000-0000-000000000000');
                      
                      if (toShift && toShift.length > 0) {
                          for (const item of toShift) {
                              await supabase
                                  .from('hospitals')
                                  .update({ display_order: (item.display_order || 0) + 1 })
                                  .eq('id', item.id);
                          }
                      }
                  }
              }
          }
          
          let result;
          if(editingHospitalId) {
              result = await supabase.from('hospitals').update(payload).eq('id', editingHospitalId);
          } else {
              result = await supabase.from('hospitals').insert([payload]);
          }
          
          if (result.error) {
              console.error('[AdminPage] Hospital save error:', result.error);
              toast.error("저장 실패: " + result.error.message);
              return;
          }
          
          toast.success("병원 정보가 저장되었습니다! 🏥");
          setEditingHospitalId(null); 
          await fetchHospitals();
          setHospitalForm({ name: '', location_kr: '', location_en: '', address_detail: '', description: '', latitude: null, longitude: null, tags: [], images: [], languages: [], amenities: [], hoursMonFri: '', hoursSat: '', doctorName: '', doctorTitle: '', doctorImage: '', doctorSchool: '', doctorYears: '', doctorSpecialties: [], doctorMetricValue: '99%', doctorMetricLabel: '만족도', displayOrder: null, isPublished: true });
      } catch (err) { 
          console.error('[AdminPage] Hospital save exception:', err);
          toast.error("저장 실패: " + err.message); 
      } finally { 
          setLoading(false); 
      }
  };

  const handleSaveTreatment = async () => { 
      if(!selectedHospitalId || !treatmentForm.title) return toast.error("병원 선택과 시술명은 필수입니다.");
      setLoading(true);
      // ✅ 이미지 배열 타입 보장 (text[] 타입에 맞춤)
      const imagesArray = Array.isArray(treatmentForm.images) 
          ? treatmentForm.images 
          : (treatmentForm.images ? [treatmentForm.images] : []);
      
      // ✅ recovery_time 컬럼이 DB에 없을 수 있으므로 제외
      const payload = { 
          hospital_id: selectedHospitalId, 
          name: treatmentForm.title, 
          description: treatmentForm.desc, 
          full_description: treatmentForm.fullDescription, 
          price_min: Number(treatmentForm.priceMin)||0, 
          // recovery_time: treatmentForm.recoveryTime, // ❌ DB에 컬럼이 없어서 제거
          benefits: treatmentForm.benefits, 
          tags: treatmentForm.tags, 
          images: imagesArray,
          display_order: treatmentForm.displayOrder ? Number(treatmentForm.displayOrder) : null, // ✅ 메인 페이지 표시 순서
          is_published: treatmentForm.isPublished !== undefined ? treatmentForm.isPublished : true // ✅ 프론트 노출 여부
      };
      
      console.log('[AdminPage] Treatment payload:', { ...payload, images: imagesArray });
      try {
          // ✅ display_order 중복 방지: 새로운 순서가 설정되어 있고, 다른 항목이 이미 사용 중이면 재정렬
          if (payload.display_order !== null && payload.display_order !== undefined) {
              // 현재 편집 중인 항목의 기존 순서 확인
              let oldOrder = null;
              if (editingTreatmentId) {
                  const { data: current } = await supabase
                      .from('treatments')
                      .select('display_order')
                      .eq('id', editingTreatmentId)
                      .single();
                  oldOrder = current?.display_order || null;
              }
              
              // 중복 확인 (현재 편집 중인 항목 제외)
              const { data: conflicts } = await supabase
                  .from('treatments')
                  .select('id, display_order')
                  .eq('display_order', payload.display_order)
                  .neq('id', editingTreatmentId || '00000000-0000-0000-0000-000000000000');
              
              if (conflicts && conflicts.length > 0) {
                  // 중복이 있으면 재정렬
                  if (oldOrder === null || payload.display_order < oldOrder) {
                      // 순서를 앞으로 이동: 새로운 순서 이상, 기존 순서 미만인 항목들을 +1
                      const { data: toShift } = await supabase
                          .from('treatments')
                          .select('id, display_order')
                          .gte('display_order', payload.display_order)
                          .lt('display_order', oldOrder || 999999)
                          .neq('id', editingTreatmentId || '00000000-0000-0000-0000-000000000000');
                      
                      if (toShift && toShift.length > 0) {
                          for (const item of toShift) {
                              await supabase
                                  .from('treatments')
                                  .update({ display_order: (item.display_order || 0) + 1 })
                                  .eq('id', item.id);
                          }
                      }
                  } else if (payload.display_order > oldOrder) {
                      // 순서를 뒤로 이동: 기존 순서 초과, 새로운 순서 이하인 항목들을 -1
                      const { data: toShift } = await supabase
                          .from('treatments')
                          .select('id, display_order')
                          .gt('display_order', oldOrder || -1)
                          .lte('display_order', payload.display_order)
                          .neq('id', editingTreatmentId || '00000000-0000-0000-0000-000000000000');
                      
                      if (toShift && toShift.length > 0) {
                          for (const item of toShift) {
                              await supabase
                                  .from('treatments')
                                  .update({ display_order: (item.display_order || 0) - 1 })
                                  .eq('id', item.id);
                          }
                      }
                  } else {
                      // 같은 순서로 변경하려고 하면 기존 항목을 +1
                      const { data: toShift } = await supabase
                          .from('treatments')
                          .select('id, display_order')
                          .eq('display_order', payload.display_order)
                          .neq('id', editingTreatmentId || '00000000-0000-0000-0000-000000000000');
                      
                      if (toShift && toShift.length > 0) {
                          for (const item of toShift) {
                              await supabase
                                  .from('treatments')
                                  .update({ display_order: (item.display_order || 0) + 1 })
                                  .eq('id', item.id);
                          }
                      }
                  }
              }
          }
          
          let result;
          if(editingTreatmentId) {
              result = await supabase.from('treatments').update(payload).eq('id', editingTreatmentId);
          } else {
              result = await supabase.from('treatments').insert([payload]);
          }
          
          if (result.error) {
              console.error('[AdminPage] Treatment save error:', result.error);
              toast.error("저장 실패: " + result.error.message);
              return;
          }
          
          toast.success("시술 정보가 저장되었습니다! 💉");
          setEditingTreatmentId(null); 
          await fetchTreatments(selectedHospitalId);
          setTreatmentForm({ title: '', desc: '', fullDescription: '', priceMin: '', recoveryTime: '', benefits: [], tags: [], images: [], displayOrder: null, isPublished: true }); 
      } catch (err) { 
          console.error('[AdminPage] Treatment save exception:', err);
          toast.error("저장 실패: " + err.message); 
      } finally { 
          setLoading(false); 
      }
  };

  const handleSaveSettings = async () => {
      setLoading(true);
      const { error } = await supabase.from('site_settings').update({
          logo_url: siteSettings.logo_url,
          hero_background_url: siteSettings.hero_background_url
      }).eq('id', siteSettings.id);

      if(error) toast.error("저장 실패: " + error.message);
      else toast.success("사이트 설정이 저장되었습니다! 🎨");
      setLoading(false);
  };

  const handleEditHospital = (h) => {
      setEditingHospitalId(h.id);
      const doc = h.doctor_profile || {};
      
      // ✅ 이미지 배열 타입 보장 (DB에서 text[]로 오면 이미 배열이지만, 혹시 모를 경우 대비)
      const imagesArray = Array.isArray(h.images) 
          ? h.images 
          : (h.images ? [h.images] : []);
      
      console.log('[AdminPage] Editing hospital:', { id: h.id, name: h.name, images: h.images, imagesArray });
      
      setHospitalForm({
          name: h.name, 
          location_kr: h.location_kr || h.location || '',
          location_en: h.location_en || h.location || '',
          address_detail: h.address_detail || '',
          description: h.description, 
          latitude: h.latitude || null, longitude: h.longitude || null,
          tags: h.tags||[], images: imagesArray, 
          languages: h.supported_languages || [], amenities: h.amenities || [],           
          hoursMonFri: h.operating_hours?.mon_fri||'', hoursSat: h.operating_hours?.sat||'',
          doctorName: doc.name||'', doctorTitle: doc.title||'', doctorImage: doc.image||'', 
          doctorSchool: doc.school||'', doctorYears: doc.years||'', doctorSpecialties: doc.specialties || [], 
          doctorMetricValue: doc.heroMetric?.value || '99%', doctorMetricLabel: doc.heroMetric?.label || '만족도',
          displayOrder: h.display_order || null,
          isPublished: h.is_published !== undefined ? h.is_published : true
      });
  };
  const handleEditTreatment = (t) => { 
      setEditingTreatmentId(t.id); 
      
      // ✅ 이미지 배열 타입 보장 (DB에서 text[]로 오면 이미 배열이지만, 혹시 모를 경우 대비)
      const imagesArray = Array.isArray(t.images) 
          ? t.images 
          : (t.images ? [t.images] : []);
      
      console.log('[AdminPage] Editing treatment:', { id: t.id, name: t.name, images: t.images, imagesArray });
      
      setTreatmentForm({ 
          title: t.name, 
          desc: t.description, 
          fullDescription: t.full_description||'', 
          priceMin: t.price_min, 
          recoveryTime: t.recovery_time||'', 
          benefits: t.benefits||[], 
          tags: t.tags||[], 
          images: imagesArray,
          displayOrder: t.display_order || null,
          isPublished: t.is_published !== undefined ? t.is_published : true
      }); 
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
        <div className="w-64 bg-white border-r border-gray-200 fixed h-full p-6 flex flex-col z-20">
            <div className="text-2xl font-black text-teal-600 mb-10 flex items-center gap-2"><LayoutDashboard /> 관리자 모드</div>
            <nav className="space-y-2 flex-1">
                {/* 🔥 메뉴 한국어화 */}
                <button onClick={() => setActiveTab('analytics')} className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition ${activeTab === 'analytics' ? 'bg-teal-50 text-teal-700' : 'text-gray-500 hover:bg-gray-50'}`}><BarChart3 size={18}/> 시장 분석 (통계)</button>
                <button onClick={() => setActiveTab('inquiries')} className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition ${activeTab === 'inquiries' ? 'bg-teal-50 text-teal-700' : 'text-gray-500 hover:bg-gray-50'}`}><MessageSquare size={18}/> 고객 문의</button>
                <button onClick={() => setActiveTab('hospitals')} className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition ${activeTab === 'hospitals' ? 'bg-teal-50 text-teal-700' : 'text-gray-500 hover:bg-gray-50'}`}><Building2 size={18}/> 병원 관리</button>
                <button onClick={() => setActiveTab('treatments')} className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition ${activeTab === 'treatments' ? 'bg-teal-50 text-teal-700' : 'text-gray-500 hover:bg-gray-50'}`}><Stethoscope size={18}/> 시술 관리</button>
                <div className="pt-4 mt-4 border-t border-gray-100 space-y-2">
                    <button onClick={() => setActiveTab('audit')} className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition ${activeTab === 'audit' ? 'bg-teal-50 text-teal-700' : 'text-gray-500 hover:bg-gray-50'}`}><Clock size={18}/> 감사 로그</button>
                    <button onClick={() => setActiveTab('settings')} className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition ${activeTab === 'settings' ? 'bg-teal-50 text-teal-700' : 'text-gray-500 hover:bg-gray-50'}`}><Settings size={18}/> 사이트 설정</button>
                    <a href="/admin/rag" className="w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition text-gray-500 hover:bg-gray-50">
                      <Target size={18} /> RAG 테스트
                    </a>
                </div>
            </nav>
            <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-red-500 font-bold px-2 py-2"><LogOut size={16}/> 로그아웃</button>
        </div>

        <div className="ml-64 flex-1 p-8 md:p-12 max-w-7xl">
            
            {/* 🔥 [Sales Intelligence Dashboard] - Internal Only */}
            {activeTab === 'analytics' && <AnalyticsTab analytics={analytics} />}

            {/* 나머지 탭들은 기존 코드 유지 (번역만 적용됨) */}
            {activeTab === 'inquiries' && (
                <InquiryManager
                    inquiries={inquiries}
                    fetchInquiries={fetchInquiries}
                    handleStatusChange={handleStatusChange}
                    handleFileClick={handleFileClick}
                />
            )}

            {activeTab === 'audit' && (
                <AdminAuditPage authToken={accessToken} />
            )}

            {activeTab === 'hospitals' && (
                <HospitalManager
                    hospitalsList={hospitalsList}
                    hospitalsError={hospitalsError}
                    handleEditHospital={handleEditHospital}
                    editingHospitalId={editingHospitalId}
                    setEditingHospitalId={setEditingHospitalId}
                    hospitalForm={hospitalForm}
                    setHospitalForm={setHospitalForm}
                    uploading={uploading}
                    loading={loading}
                    handleSaveHospital={handleSaveHospital}
                    handleDelete={handleDelete}
                    fetchHospitals={fetchHospitals}
                    uploadToSupabase={uploadToSupabase}
                    DynamicListInput={DynamicListInput}
                    ImageUploader={ImageUploader}
                    AddressInput={AddressInput}
                    toast={toast}
                />
            )}

            {activeTab === 'treatments' && (
                <TreatmentManager
                    hospitalsList={hospitalsList}
                    selectedHospitalId={selectedHospitalId}
                    setSelectedHospitalId={setSelectedHospitalId}
                    fetchTreatments={fetchTreatments}
                    treatmentsList={treatmentsList}
                    treatmentsError={treatmentsError}
                    editingTreatmentId={editingTreatmentId}
                    setEditingTreatmentId={setEditingTreatmentId}
                    treatmentForm={treatmentForm}
                    setTreatmentForm={setTreatmentForm}
                    handleEditTreatment={handleEditTreatment}
                    handleSaveTreatment={handleSaveTreatment}
                    handleDelete={handleDelete}
                    loading={loading}
                    uploadToSupabase={uploadToSupabase}
                    uploading={uploading}
                    DynamicListInput={DynamicListInput}
                    ImageUploader={ImageUploader}
                />
            )}

            {activeTab === 'settings' && (
                <SiteSettingsTab
                    siteSettings={siteSettings}
                    setSiteSettings={setSiteSettings}
                    uploadToSupabase={uploadToSupabase}
                    uploading={uploading}
                    handleSaveSettings={handleSaveSettings}
                    ImageUploader={ImageUploader}
                />
            )}
        </div>
        {selectedFile && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100]" onClick={closeFilePreview}>
                <div className="bg-white rounded-xl p-5 max-w-6xl w-full h-[85vh] flex flex-col relative" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">첨부파일 미리보기</h3>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleDownload}
                                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition flex items-center gap-1"
                            >
                                <UploadCloud size={14} className="rotate-180" />
                                다운로드
                            </button>
                            <a 
                                href={selectedFile} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white text-sm rounded-lg transition flex items-center gap-1"
                            >
                                새 창에서 열기
                            </a>
                            <button onClick={closeFilePreview} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto border rounded-lg bg-gray-50 p-4">
                        {getFileType(selectedFile) === 'image' && (
                            <>
                                {!previewError ? (
                                    <div className="w-full flex justify-center">
                                        <img 
                                            src={selectedFile} 
                                            className="w-full h-auto" 
                                            alt="preview"
                                            style={{ maxWidth: '100%' }}
                                            onError={() => {
                                                console.warn('[AdminPage] Image preview failed:', selectedFile);
                                                setPreviewError(true);
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center p-8">
                                            <AlertCircle size={48} className="mx-auto text-yellow-500 mb-4" />
                                            <p className="text-gray-700 font-bold mb-2">이미지 미리보기 실패</p>
                                            <p className="text-sm text-gray-500 mb-6">
                                                이 브라우저에서 미리보기가 제한될 수 있습니다.<br/>
                                                새 창에서 열기 또는 다운로드를 이용하세요.
                                            </p>
                                            <a 
                                                href={selectedFile} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="inline-block px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-bold"
                                            >
                                                새 창에서 열기
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                        {getFileType(selectedFile) === 'pdf' && <iframe src={selectedFile} className="w-full h-full border" title="pdf"/>}
                        {getFileType(selectedFile) === 'other' && (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <p className="text-gray-600 mb-4">이 파일은 미리보기를 지원하지 않습니다.</p>
                                    <a href={selectedFile} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg">
                                        다운로드
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};