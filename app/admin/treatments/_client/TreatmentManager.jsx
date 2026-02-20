import { Plus, Trash2, Loader2, Save, Info } from 'lucide-react';

export const TreatmentManager = ({
  hospitalsList,
  selectedHospitalId,
  setSelectedHospitalId,
  fetchTreatments,
  treatmentsList,
  treatmentsError,
  editingTreatmentId,
  setEditingTreatmentId,
  treatmentForm,
  setTreatmentForm,
  handleEditTreatment,
  handleSaveTreatment,
  handleDelete,
  loading,
  uploadToSupabase,
  uploading,
}) => (
  <div className="grid grid-cols-12 gap-8 animate-in fade-in">
    <div className="col-span-4 bg-white rounded-2xl border border-gray-200 p-4 h-[calc(100vh-100px)] overflow-y-auto">
      <select
        className="w-full border p-2 rounded mb-4"
        value={selectedHospitalId}
        onChange={e=>{setSelectedHospitalId(e.target.value); fetchTreatments(e.target.value);}}
      >
        <option value="">병원을 먼저 선택하세요</option>
        {hospitalsList.map(h=><option key={h.id} value={h.id}>{h.name}</option>)}
      </select>
      {process.env.NODE_ENV !== "production" && treatmentsError && (
        <p className="text-xs text-red-500 mb-2">Treatments error: {treatmentsError.message}</p>
      )}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold">시술 목록</h2>
        {selectedHospitalId && (
          <button onClick={()=>{setEditingTreatmentId(null); setTreatmentForm({ title: '', desc: '', fullDescription: '', priceMin: '', recoveryTime: '', benefits: [], tags: [], images: [], displayOrder: null, isPublished: true });}} className="bg-teal-600 text-white p-1 rounded">
            <Plus size={16}/>
          </button>
        )}
      </div>
      {treatmentsList.map(t=>(
        <div key={t.id} onClick={()=>handleEditTreatment(t)} className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${editingTreatmentId===t.id?'bg-teal-50 border-l-4 border-l-teal-500':''}`}>
          <div className="font-bold">{t.name}</div>
          <div className="text-xs text-teal-600">${t.price_min}</div>
        </div>
      ))}
    </div>

    <div className="col-span-8 relative">
      {!selectedHospitalId ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 h-[calc(100vh-100px)] flex items-center justify-center">
          <div className="text-center text-gray-400">왼쪽에서 병원을 먼저 선택해주세요.</div>
        </div>
      ) : (
        <>
          {/* 저장 버튼 - 우측 상단 고정 */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4 mb-4 rounded-t-2xl flex justify-between items-center shadow-sm">
            <h2 className="text-xl font-bold">{editingTreatmentId?'시술 정보 수정':'신규 시술 등록'}</h2>
            <div className="flex items-center gap-3">
              {editingTreatmentId && (
                <button 
                  onClick={()=>handleDelete('treatments', editingTreatmentId, ()=>fetchTreatments(selectedHospitalId))}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                  title="삭제"
                >
                  <Trash2 size={20}/>
                </button>
              )}
              <button 
                onClick={handleSaveTreatment} 
                disabled={loading}
                className="bg-teal-600 text-white px-6 py-2.5 rounded-lg font-bold shadow-md hover:bg-teal-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={18} className="animate-spin"/> : <Save size={18}/>}
                {loading ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-200 p-8 h-[calc(100vh-180px)] overflow-y-auto">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <input placeholder="시술명 (영어/한글)" value={treatmentForm.title} onChange={e=>setTreatmentForm({...treatmentForm, title: e.target.value})} className="w-full p-2 border rounded"/>
                </div>
                <div>
                  <input type="number" placeholder="최소 가격 ($)" value={treatmentForm.priceMin} onChange={e=>setTreatmentForm({...treatmentForm, priceMin: e.target.value})} className="w-full p-2 border rounded"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="number" 
                  placeholder="메인 페이지 표시 순서 (숫자가 작을수록 앞에 표시, 비워두면 최신순)" 
                  value={treatmentForm.displayOrder || ''} 
                  onChange={e=>setTreatmentForm({...treatmentForm, displayOrder: e.target.value ? e.target.value : null})} 
                  className="w-full p-2 border rounded text-sm"
                />
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <label className="text-sm font-bold text-gray-700 flex-1">프론트 노출 여부</label>
                <button
                  type="button"
                  onClick={() => setTreatmentForm({...treatmentForm, isPublished: !treatmentForm.isPublished})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    treatmentForm.isPublished ? 'bg-teal-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      treatmentForm.isPublished ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-xs text-gray-600 w-16">
                  {treatmentForm.isPublished ? '노출' : '숨김'}
                </span>
              </div>
              <input placeholder="간략 설명 (카드용)" value={treatmentForm.desc} onChange={e=>setTreatmentForm({...treatmentForm, desc: e.target.value})} className="w-full p-2 border rounded"/>
              <textarea placeholder="상세 설명 (페이지용)" rows="4" value={treatmentForm.fullDescription} onChange={e=>setTreatmentForm({...treatmentForm, fullDescription: e.target.value})} className="w-full p-2 border rounded"/>
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="소요 시간 (예: 1시간)" value={treatmentForm.recoveryTime} onChange={e=>setTreatmentForm({...treatmentForm, recoveryTime: e.target.value})} className="w-full p-2 border rounded"/>
                <input placeholder="마취 방법" value={treatmentForm.anesthesia} onChange={e=>setTreatmentForm({...treatmentForm, anesthesia: e.target.value})} className="w-full p-2 border rounded"/>
              </div>
              <DynamicListInput items={treatmentForm.benefits} onAdd={t=>setTreatmentForm({...treatmentForm, benefits:[...treatmentForm.benefits, t]})} onRemove={i=>setTreatmentForm({...treatmentForm, benefits:treatmentForm.benefits.filter((_,x)=>x!==i)})} placeholder="주요 효과 (Benefit)"/>
              <DynamicListInput items={treatmentForm.tags} onAdd={t=>setTreatmentForm({...treatmentForm, tags:[...treatmentForm.tags, t]})} onRemove={i=>setTreatmentForm({...treatmentForm, tags:treatmentForm.tags.filter((_,x)=>x!==i)})} placeholder="검색 태그"/>
              
              <label className="block text-sm font-bold text-gray-500 mt-2">시술 관련 이미지</label>
              <p className="text-xs text-teal-600 bg-teal-50 p-2 rounded-lg mb-2 flex items-center gap-2">
                <Info size={14}/> 💡 권장: 800x600px (4:3 비율)
              </p>
              <ImageUploader 
                images={treatmentForm.images} 
                onUpload={async (file) => {
                  const url = await uploadToSupabase(file);
                  if (url) setTreatmentForm(prev => ({...prev, images: [...prev.images, url]}));
                }}
                onRemove={(idx) => setTreatmentForm(prev => ({...prev, images: prev.images.filter((_, i) => i !== idx)}))}
                uploading={uploading}
              />
            </div>
          </div>
        </>
      )}
    </div>
  </div>
);
