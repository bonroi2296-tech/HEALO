"use client";

import { useState, useEffect, useRef } from "react";
import { HospitalManager } from "./_client/HospitalManager";
import { createSupabaseBrowserClient } from "../../../src/lib/supabase/browser";
import { useToast } from "../../../src/components/Toast";
import { AddressInput } from "../../../src/components/AddressInput";
import { X, UploadCloud, Loader2 } from "lucide-react";

// ✅ Supabase는 이미지 업로드와 세션 확인용으로만 사용
const supabase = createSupabaseBrowserClient();

// Helper: DynamicListInput
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
          <input 
            type="text" 
            value={newItem} 
            onChange={(e) => setNewItem(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())} 
            className={`w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition ${Icon ? 'pl-10' : ''}`} 
            placeholder={placeholder} 
          />
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

// Helper: ImageUploader
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
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} disabled={uploading} className="hidden" id="file-upload-input" />
          <label onClick={() => fileInputRef.current.click()} className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-gray-300 text-sm text-gray-500 cursor-pointer hover:bg-gray-50 hover:border-teal-500 transition ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
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
              <button onClick={() => onRemove(idx)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-80 hover:opacity-100 transition shadow-sm">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function HospitalsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [hospitalsList, setHospitalsList] = useState([]);
  const [hospitalsError, setHospitalsError] = useState(null);
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
    displayOrder: null,
    isPublished: true
  });

  // ✅ Admin API를 통한 병원 목록 조회
  const fetchHospitals = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        console.error('[Hospitals] No access token');
        setHospitalsError({ message: 'No access token' });
        setHospitalsList([]);
        return;
      }

      const response = await fetch('/api/admin/hospitals', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include'
      });

      const result = await response.json();

      if (result.ok) {
        console.log('[Hospitals] ✅ Loaded:', result.hospitals?.length || 0);
        setHospitalsError(null);
        setHospitalsList(result.hospitals || []);
      } else {
        console.error('[Hospitals] ❌ API failed:', result.error);
        setHospitalsError({ message: result.error });
        setHospitalsList([]);
      }
    } catch (error) {
      console.error('[Hospitals] ❌ Fetch exception:', error);
      setHospitalsError(error);
      setHospitalsList([]);
    }
  };

  // ✅ Admin API를 통한 이미지 업로드 (브라우저에서 직접 Storage 접근 차단)
  const uploadToSupabase = async (file) => {
    if (!file) return null;
    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        toast.error("세션이 만료되었습니다.");
        return null;
      }

      // FormData 생성
      const formData = new FormData();
      formData.append('file', file);

      // Admin API 호출
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: formData,
      });

      const result = await response.json();

      if (result.ok) {
        console.log('[Hospitals] ✅ Image uploaded:', result.fileName);
        return result.url;
      } else {
        console.error('[Hospitals] Upload error:', result.error);
        toast.error('이미지 업로드 실패: ' + (result.detail || result.error));
        return null;
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('이미지 업로드 실패: ' + error.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleEditHospital = (h) => {
    setEditingHospitalId(h.id);
    const doc = h.doctor_profile || {};
    const imagesArray = Array.isArray(h.images) ? h.images : (h.images ? [h.images] : []);
    setHospitalForm({
      name: h.name || '',
      location_kr: h.location_kr || '',
      location_en: h.location_en || '',
      address_detail: h.address_detail || '',
      description: h.description || '',
      latitude: h.latitude,
      longitude: h.longitude,
      tags: h.tags || [],
      images: imagesArray,
      languages: h.supported_languages || [],
      amenities: h.amenities || [],
      hoursMonFri: h.operating_hours?.mon_fri || '',
      hoursSat: h.operating_hours?.sat || '',
      doctorName: doc.name || '',
      doctorTitle: doc.title || '',
      doctorImage: doc.image || '',
      doctorSchool: doc.school || '',
      doctorYears: doc.years || '',
      doctorSpecialties: doc.specialties || [],
      doctorMetricValue: doc.heroMetric?.value || '99%',
      doctorMetricLabel: doc.heroMetric?.label || '만족도',
      displayOrder: h.display_order,
      isPublished: h.is_published !== undefined ? h.is_published : true
    });
  };

  // ✅ Admin API를 통한 병원 저장 (생성/수정)
  const handleSaveHospital = async () => {
    if (!hospitalForm.name) return toast.error("병원명은 필수입니다.");
    setLoading(true);
    
    const imagesArray = Array.isArray(hospitalForm.images) ? hospitalForm.images : (hospitalForm.images ? [hospitalForm.images] : []);
    
    // ✅ slug는 서버에서 자동 생성 (UPDATE시 기존 slug 유지)
    const payload = {
      name: hospitalForm.name, 
      location_kr: hospitalForm.location_kr?.trim() || null,
      location_en: hospitalForm.location_en?.trim() || null,
      address_detail: hospitalForm.address_detail?.trim() || null,
      description: hospitalForm.description, 
      latitude: hospitalForm.latitude, 
      longitude: hospitalForm.longitude,
      tags: hospitalForm.tags, 
      images: imagesArray, 
      supported_languages: hospitalForm.languages, 
      amenities: hospitalForm.amenities,
      operating_hours: { mon_fri: hospitalForm.hoursMonFri, sat: hospitalForm.hoursSat },
      doctor_profile: { 
        name: hospitalForm.doctorName, 
        title: hospitalForm.doctorTitle, 
        image: hospitalForm.doctorImage, 
        school: hospitalForm.doctorSchool, 
        years: hospitalForm.doctorYears, 
        specialties: hospitalForm.doctorSpecialties, 
        heroMetric: { value: hospitalForm.doctorMetricValue, label: hospitalForm.doctorMetricLabel } 
      },
      display_order: hospitalForm.displayOrder ? Number(hospitalForm.displayOrder) : null,
      is_published: hospitalForm.isPublished !== undefined ? hospitalForm.isPublished : true
    };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        toast.error("세션이 만료되었습니다. 다시 로그인하세요.");
        return;
      }

      // ✅ CREATE vs UPDATE
      const url = editingHospitalId 
        ? `/api/admin/hospitals?id=${editingHospitalId}` 
        : '/api/admin/hospitals';
      const method = editingHospitalId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.ok) {
        toast.success("병원 정보가 저장되었습니다! 🏥");
        setEditingHospitalId(null); 
        await fetchHospitals();
        setHospitalForm({ name: '', location_kr: '', location_en: '', address_detail: '', description: '', latitude: null, longitude: null, tags: [], images: [], languages: [], amenities: [], hoursMonFri: '', hoursSat: '', doctorName: '', doctorTitle: '', doctorImage: '', doctorSchool: '', doctorYears: '', doctorSpecialties: [], doctorMetricValue: '99%', doctorMetricLabel: '만족도', displayOrder: null, isPublished: true });
      } else {
        console.error('[Hospitals] Save error:', result.error);
        toast.error("저장 실패: " + (result.detail || result.error));
      }
    } catch (err) { 
      console.error('[Hospitals] Save exception:', err);
      toast.error("저장 실패: " + err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  // ✅ Admin API를 통한 병원 삭제
  const handleDelete = async (table, id, cb) => {
    if (!confirm("정말 삭제하시겠습니까? 복구할 수 없습니다.")) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        toast.error("세션이 만료되었습니다.");
        return;
      }

      const response = await fetch(`/api/admin/${table}?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      const result = await response.json();

      if (result.ok) {
        toast.success("삭제되었습니다.");
        if (cb) cb();
      } else {
        console.error(`[Hospitals] Delete error:`, result.error);
        toast.error("삭제 실패: " + (result.detail || result.error));
      }
    } catch (err) {
      console.error(`[Hospitals] Delete exception:`, err);
      toast.error("삭제 실패: " + err.message);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  return (
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
  );
}
