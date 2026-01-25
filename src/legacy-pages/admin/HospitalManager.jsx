import React from 'react';
import { Plus, Trash2, Loader2, Save, Globe, Coffee, Trophy, Info, User, X } from 'lucide-react';

export const HospitalManager = ({
  hospitalsList,
  hospitalsError,
  handleEditHospital,
  editingHospitalId,
  setEditingHospitalId,
  hospitalForm,
  setHospitalForm,
  uploading,
  loading,
  handleSaveHospital,
  handleDelete,
  fetchHospitals,
  uploadToSupabase,
  DynamicListInput,
  ImageUploader,
  AddressInput,
  toast,
}) => (
  <div className="grid grid-cols-12 gap-8 animate-in fade-in">
    <div className="col-span-4 bg-white rounded-2xl border border-gray-200 p-4 h-[calc(100vh-100px)] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold">등록된 병원</h2>
        <button
          onClick={() => {
            setEditingHospitalId(null);
            setHospitalForm({ name: '', location_kr: '', location_en: '', address_detail: '', description: '', latitude: null, longitude: null, tags: [], images: [], languages: [], amenities: [], hoursMonFri: '', hoursSat: '', doctorName: '', doctorTitle: '', doctorImage: '', doctorSchool: '', doctorYears: '', doctorSpecialties: [], doctorMetricValue: '99%', doctorMetricLabel: '만족도' });
          }}
          className="bg-teal-600 text-white p-1 rounded"
        >
          <Plus size={16}/>
        </button>
      </div>
      {process.env.NODE_ENV !== "production" && hospitalsError && (
        <p className="text-xs text-red-500 mb-2">Hospitals error: {hospitalsError.message}</p>
      )}
      {hospitalsList.map(h => {
        const locationText = h.location_kr || h.location_en || h.location || '';
        return (
          <div key={h.id} onClick={()=>handleEditHospital(h)} className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${editingHospitalId===h.id?'bg-teal-50 border-l-4 border-l-teal-500':''}`}>
            <div className="font-bold">{h.name}</div>
            <div className="text-xs text-gray-500">
              {locationText || (process.env.NODE_ENV !== "production" ? "— (주소 없음)" : "")}
            </div>
          </div>
        );
      })}
    </div>

    <div className="col-span-8 relative">
      {/* 저장 버튼 - 우측 상단 고정 */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4 mb-4 rounded-t-2xl flex justify-between items-center shadow-sm">
        <h2 className="text-xl font-bold">{editingHospitalId?'병원 정보 수정':'신규 병원 등록'}</h2>
        <div className="flex items-center gap-3">
          {editingHospitalId && (
            <button 
              onClick={()=>handleDelete('hospitals', editingHospitalId, fetchHospitals)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
              title="삭제"
            >
              <Trash2 size={20}/>
            </button>
          )}
          <button 
            onClick={handleSaveHospital} 
            disabled={loading}
            className="bg-teal-600 text-white px-6 py-2.5 rounded-lg font-bold shadow-md hover:bg-teal-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={18} className="animate-spin"/> : <Save size={18}/>}
            {loading ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl border border-gray-200 p-8 h-[calc(100vh-180px)] overflow-y-auto">
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-400">기본 정보 (필수)</h3>
            <input type="text" placeholder="병원명 (영어/한국어)" value={hospitalForm.name} onChange={e=>setHospitalForm({...hospitalForm, name: e.target.value})} className="w-full p-2 border rounded"/>
            
            {/* 주소 입력 (Korean search + English auto) */}
            <AddressInput
              value={hospitalForm.location_kr || ''}
              onChange={(address) => setHospitalForm({ ...hospitalForm, location_kr: address })}
              onLocationSelect={(location) => {
                if (location) {
                  setHospitalForm(prev => ({
                    ...prev,
                    location_kr: location.koAddress || prev.location_kr,
                    location_en: location.enAddress || prev.location_en
                  }));
                  toast.success("주소가 입력되었습니다.");
                }
              }}
              placeholder="한국어 주소를 검색하세요 (예: 강남구 테헤란로 123)"
              language="ko"
            />

            <input
              type="text"
              placeholder="영문 주소 (자동 입력됨, 필요 시 수정)"
              value={hospitalForm.location_en || ''}
              onChange={(e) => setHospitalForm({ ...hospitalForm, location_en: e.target.value })}
              className="w-full p-2 border rounded text-sm"
            />

            <input
              type="text"
              placeholder="상세 주소 (층/호수 등)"
              value={hospitalForm.address_detail || ''}
              onChange={(e) => setHospitalForm({ ...hospitalForm, address_detail: e.target.value })}
              className="w-full p-2 border rounded text-sm"
            />

            <textarea placeholder="병원 소개 (상세 페이지용 설명)" value={hospitalForm.description} onChange={e=>setHospitalForm({...hospitalForm, description: e.target.value})} className="w-full p-2 border rounded" rows="3"/>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-bold text-teal-600 mb-2 flex items-center gap-1"><Globe size={14}/> 통역 가능 언어</h3>
              <DynamicListInput items={hospitalForm.languages} onAdd={t=>setHospitalForm({...hospitalForm, languages:[...hospitalForm.languages, t]})} onRemove={i=>setHospitalForm({...hospitalForm, languages:hospitalForm.languages.filter((_,x)=>x!==i)})} placeholder="예: 영어, 중국어"/>
            </div>
            <div>
              <h3 className="text-sm font-bold text-teal-600 mb-2 flex items-center gap-1"><Coffee size={14}/> 편의 시설</h3>
              <DynamicListInput items={hospitalForm.amenities} onAdd={t=>setHospitalForm({...hospitalForm, amenities:[...hospitalForm.amenities, t]})} onRemove={i=>setHospitalForm({...hospitalForm, amenities:hospitalForm.amenities.filter((_,x)=>x!==i)})} placeholder="예: 와이파이, 픽업"/>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-400">이미지 및 태그</h3>
            <DynamicListInput items={hospitalForm.tags} onAdd={t=>setHospitalForm({...hospitalForm, tags:[...hospitalForm.tags, t]})} onRemove={i=>setHospitalForm({...hospitalForm, tags:hospitalForm.tags.filter((_,x)=>x!==i)})} placeholder="태그 입력 (예: 피부과)"/>
            
            <label className="block text-sm font-bold text-gray-500 mt-2">병원 갤러리 이미지</label>
            <p className="text-xs text-teal-600 bg-teal-50 p-2 rounded-lg mb-2 flex items-center gap-2">
              <Info size={14}/> 💡 권장: 1200x900px (4:3 비율)
            </p>
            <ImageUploader 
              images={hospitalForm.images} 
              onUpload={async (file) => {
                const url = await uploadToSupabase(file);
                if (url) setHospitalForm(prev => ({...prev, images: [...prev.images, url]}));
              }}
              onRemove={(idx) => setHospitalForm(prev => ({...prev, images: prev.images.filter((_, i) => i !== idx)}))}
              uploading={uploading}
            />
          </div>

          <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><User size={16}/> 대표 원장 정보</h3>
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="이름 (영문/한글)" value={hospitalForm.doctorName} onChange={e=>setHospitalForm({...hospitalForm, doctorName: e.target.value})} className="border p-2 rounded"/>
              <input placeholder="직함 (예: 대표원장)" value={hospitalForm.doctorTitle} onChange={e=>setHospitalForm({...hospitalForm, doctorTitle: e.target.value})} className="border p-2 rounded"/>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="출신 학교 (예: 서울대)" value={hospitalForm.doctorSchool} onChange={e=>setHospitalForm({...hospitalForm, doctorSchool: e.target.value})} className="border p-2 rounded"/>
              <input placeholder="경력 (예: 15년 이상)" value={hospitalForm.doctorYears} onChange={e=>setHospitalForm({...hospitalForm, doctorYears: e.target.value})} className="border p-2 rounded"/>
            </div>
            <DynamicListInput items={hospitalForm.doctorSpecialties} onAdd={t=>setHospitalForm({...hospitalForm, doctorSpecialties:[...hospitalForm.doctorSpecialties, t]})} onRemove={i=>setHospitalForm({...hospitalForm, doctorSpecialties:hospitalForm.doctorSpecialties.filter((_,x)=>x!==i)})} placeholder="전문 분야 (예: 코성형)" icon={Trophy}/>
            
            <div className="mt-2">
              <label className="text-xs text-gray-400 font-bold mb-1 block">원장님 프로필 사진</label>
              <p className="text-[10px] text-teal-600 mb-2">💡 1:1 정방형 (400x400px) 필수 - 얼굴이 중앙에 오도록</p>
              <div className="flex gap-2 items-center">
                {hospitalForm.doctorImage ? (
                  <div className="relative group w-16 h-16 rounded-full overflow-hidden border">
                    <img src={hospitalForm.doctorImage} alt="doc" className="w-full h-full object-cover"/>
                    <button onClick={() => setHospitalForm({...hospitalForm, doctorImage: ''})} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><X size={16}/></button>
                  </div>
                ) : (
                  <div onClick={() => document.getElementById('doc-upload').click()} className="w-16 h-16 rounded-full border border-dashed flex items-center justify-center text-gray-400 cursor-pointer hover:bg-white hover:border-teal-500">
                    {uploading ? <Loader2 size={16} className="animate-spin"/> : <Plus size={16}/>}
                    <input id="doc-upload" type="file" accept="image/*" className="hidden" disabled={uploading} onChange={async(e)=>{ const url=await uploadToSupabase(e.target.files[0]); if(url) setHospitalForm(prev=>({...prev, doctorImage: url})); }} />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input placeholder="평일 운영시간 (09:00 - 18:00)" value={hospitalForm.hoursMonFri} onChange={e=>setHospitalForm({...hospitalForm, hoursMonFri: e.target.value})} className="border p-2 rounded"/>
            <input placeholder="주말 운영시간 (09:00 - 13:00)" value={hospitalForm.hoursSat} onChange={e=>setHospitalForm({...hospitalForm, hoursSat: e.target.value})} className="border p-2 rounded"/>
          </div>
        </div>
      </div>
    </div>
  </div>
);
