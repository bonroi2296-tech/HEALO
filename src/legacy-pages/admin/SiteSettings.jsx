import React from 'react';
import { Settings } from 'lucide-react';

export const SiteSettings = ({
  siteSettings,
  setSiteSettings,
  uploadToSupabase,
  uploading,
  handleSaveSettings,
  ImageUploader,
}) => (
  <div className="max-w-2xl bg-white rounded-2xl border border-gray-200 p-8 shadow-sm animate-in fade-in">
    <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Settings className="text-teal-600"/> 사이트 디자인 설정</h2>
    <div className="space-y-8">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">상단 로고 이미지 (Logo)</label>
        <p className="text-xs text-gray-400 mb-3">비워두면 텍스트(HEALO)가 표시됩니다. 투명 배경 PNG 추천.</p>
        <div className="flex items-center gap-4 mb-3 p-4 bg-teal-600 rounded-lg">
          <span className="text-white text-xs opacity-70">미리보기 (Dark 배경):</span>
          {siteSettings.logo_url ? (
            <img src={siteSettings.logo_url} className="h-8 object-contain" alt="Logo Preview" />
          ) : (
            <span className="text-xl font-extrabold text-white">HEALO</span>
          )}
        </div>
        <ImageUploader 
          images={siteSettings.logo_url ? [siteSettings.logo_url] : []} 
          onUpload={async (file) => {
            const url = await uploadToSupabase(file);
            if (url) setSiteSettings(prev => ({...prev, logo_url: url}));
          }}
          onRemove={() => setSiteSettings(prev => ({...prev, logo_url: null}))}
          uploading={uploading}
        />
      </div>
      <hr className="border-gray-100"/>
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">메인 배경 이미지 (Hero Background)</label>
        <p className="text-xs text-gray-400 mb-3">메인 검색창 뒤에 깔리는 이미지입니다.</p>
        {siteSettings.hero_background_url && (
          <div className="mb-3 w-full h-40 rounded-lg overflow-hidden relative">
            <img src={siteSettings.hero_background_url} className="w-full h-full object-cover" alt="Hero BG" />
          </div>
        )}
        <ImageUploader 
          images={siteSettings.hero_background_url ? [siteSettings.hero_background_url] : []} 
          onUpload={async (file) => {
            const url = await uploadToSupabase(file);
            if (url) setSiteSettings(prev => ({...prev, hero_background_url: url}));
          }}
          onRemove={() => setSiteSettings(prev => ({...prev, hero_background_url: null}))}
          uploading={uploading}
        />
      </div>
      <button onClick={handleSaveSettings} className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 transition shadow-lg">
        설정 저장하기
      </button>
    </div>
  </div>
);
