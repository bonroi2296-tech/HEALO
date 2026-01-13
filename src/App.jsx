// src/App.jsx

import React, { useState, useEffect } from 'react';
import { TREATMENTS, INITIAL_HOSPITALS } from './data';
import { Header, HeroSection, CardListSection, FloatingInquiryBtn, PersonalConciergeCTA, MobileBottomNav } from './components.jsx';
import { TreatmentDetailPage, HospitalDetailPage, InquiryPage, LoginPage, SignUpPage, SuccessPage } from './pages.jsx';
import { AdminPage } from './AdminPage';

function App() {
  const [view, setView] = useState('home');
  const [selectedId, setSelectedId] = useState(null);
  const [inquiryMode, setInquiryMode] = useState('select');
  const [lastView, setLastView] = useState('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, [view]);

  // ✅ 메뉴 이동 시 검색어를 깔끔하게 초기화하는 헬퍼 함수
  const handleNavClick = (targetView) => {
    setSearchTerm(''); 
    setView(targetView);
    setIsMobileMenuOpen(false); 
  };

  const handleTreatmentClick = (id) => { setSelectedId(id); setView('detail_treatment'); };
  const handleHospitalClick = (id) => { setSelectedId(id); setView('detail_hospital'); };
  
  const handleGlobalInquiry = () => { 
    setLastView(view); 
    setInquiryMode('select'); 
    setView('inquiry'); 
    setIsMobileMenuOpen(false);
  };

  const handleInquiryClose = () => { setView(lastView); };

  // ✅ 검색 필터링 로직
  const filteredTreatments = TREATMENTS.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.hospital.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredHospitals = INITIAL_HOSPITALS.filter(h => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    h.dept.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="font-sans text-gray-800 bg-gray-50 min-h-screen relative">
      <Header 
        setView={setView} 
        view={view} 
        handleGlobalInquiry={handleGlobalInquiry}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        onNavClick={handleNavClick}
      />
      
      <main className="pb-24">
        {view === 'home' && (
          <>
            <HeroSection setView={setView} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <CardListSection title="HEALO's Signature Collection" items={TREATMENTS} onCardClick={handleTreatmentClick} type="treatment" />
            <CardListSection title="Official Medical Partners" items={INITIAL_HOSPITALS} onCardClick={handleHospitalClick} type="hospital" />
            <div className="mt-10"><PersonalConciergeCTA onClick={handleGlobalInquiry} /></div>
          </>
        )}
        
        {/* ✅ 관리자 페이지 뷰 추가 */}
        {view === 'admin' && <AdminPage setView={setView} />}

        {view === 'list_treatment' && (
          <>
            {searchTerm ? (
              <>
                <div className="pt-4 px-4 text-center">
                    <p className="text-gray-500 text-sm">Search results for <span className="text-teal-600 font-bold">"{searchTerm}"</span></p>
                </div>

                {filteredTreatments.length > 0 && (
                  <CardListSection
                    title={`Treatments (${filteredTreatments.length})`}
                    items={filteredTreatments}
                    onCardClick={handleTreatmentClick}
                    type="treatment"
                  />
                )}

                {filteredHospitals.length > 0 && (
                  <CardListSection
                    title={`Hospitals (${filteredHospitals.length})`}
                    items={filteredHospitals}
                    onCardClick={handleHospitalClick}
                    type="hospital"
                  />
                )}

                {filteredTreatments.length === 0 && filteredHospitals.length === 0 && (
                  <div className="text-center py-20">
                    <p className="text-gray-400 font-bold text-lg">No results found.</p>
                    <button onClick={() => setSearchTerm('')} className="mt-4 text-teal-600 underline text-sm">Clear Search</button>
                  </div>
                )}
              </>
            ) : (
              <CardListSection
                title="Curated Treatments"
                items={TREATMENTS}
                onCardClick={handleTreatmentClick}
                type="treatment"
              />
            )}
            
            <div className="mt-10"><PersonalConciergeCTA onClick={handleGlobalInquiry} /></div>
          </>
        )}

        {view === 'list_hospital' && (
          <>
            <CardListSection title="Centers of Excellence" items={INITIAL_HOSPITALS} onCardClick={handleHospitalClick} type="hospital" />
            <div className="mt-10"><PersonalConciergeCTA onClick={handleGlobalInquiry} /></div>
          </>
        )}

        {view === 'detail_treatment' && <TreatmentDetailPage selectedId={selectedId} setView={setView} setInquiryMode={setInquiryMode} onTreatmentClick={handleTreatmentClick} onHospitalClick={handleHospitalClick} />}
        {view === 'detail_hospital' && <HospitalDetailPage selectedId={selectedId} setView={setView} onTreatmentClick={handleTreatmentClick} />}
        
        {view === 'inquiry' && <InquiryPage setView={setView} mode={inquiryMode} setMode={setInquiryMode} onClose={handleInquiryClose} />}
        {view === 'success' && <SuccessPage setView={setView} />}
        {view === 'login' && <LoginPage setView={setView} />}
        {view === 'signup' && <SignUpPage setView={setView} />}
      </main>

      {view !== 'success' && (
        <>
           <MobileBottomNav 
              setView={setView} 
              view={view} 
              onInquiry={handleGlobalInquiry} 
              onNavClick={handleNavClick}
           />
           <div className="hidden md:block">
              <FloatingInquiryBtn onClick={handleGlobalInquiry} />
           </div>
        </>
      )}

      <button 
        onClick={() => setView('admin')} 
        className="fixed bottom-2 right-2 w-4 h-4 bg-transparent z-[9999]" 
        title="Admin"
      ></button>

    </div>
  );
}

export default App;