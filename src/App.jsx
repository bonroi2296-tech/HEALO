"use client";

// src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './supabase';
import {
  Header, HeroSection, CardListSection, FloatingInquiryBtn, PersonalConciergeCTA, MobileBottomNav
} from './components.jsx';
// ✅ 성능 최적화: 페이지 컴포넌트 동적 import (코드 스플리팅)
import { lazy, Suspense } from 'react';

const TreatmentDetailPage = lazy(() => import('./pages.jsx').then(mod => ({ default: mod.TreatmentDetailPage })));
const HospitalDetailPage = lazy(() => import('./pages.jsx').then(mod => ({ default: mod.HospitalDetailPage })));
const InquiryPage = lazy(() => import('./pages.jsx').then(mod => ({ default: mod.InquiryPage })));
const InquiryIntakePage = lazy(() => import('./pages.jsx').then(mod => ({ default: mod.InquiryIntakePage })));
const LoginPage = lazy(() => import('./pages.jsx').then(mod => ({ default: mod.LoginPage })));
const SignUpPage = lazy(() => import('./pages.jsx').then(mod => ({ default: mod.SignUpPage })));
const SuccessPage = lazy(() => import('./pages.jsx').then(mod => ({ default: mod.SuccessPage })));
const AdminPage = lazy(() => import('./AdminPage').then(mod => ({ default: mod.AdminPage })));
import { Loader2 } from 'lucide-react';
// 🔥 Mapper & ErrorBoundary import
import { mapHospitalRow, mapTreatmentRow } from './lib/mapper';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider, useToast } from './components/Toast';
import { getLocationColumn } from './lib/language';
import { logError } from './lib/logger';

// ==========================================
// 1. 페이지네이션 리스트 (Mapper 적용됨)
// ==========================================
const PaginatedList = ({ type, searchTerm, onCardClick, title }) => {
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
  const [itemsError, setItemsError] = useState(null);
    const ITEMS_PER_PAGE = 6;

    const fetchItems = useCallback(async (isLoadMore = false) => {
        if (!isLoadMore) setLoading(true);
        
        const from = isLoadMore ? (page + 1) * ITEMS_PER_PAGE : 0;
        const to = from + ITEMS_PER_PAGE - 1;
        const table = type === 'treatment' ? 'treatments' : 'hospitals';
        const locCol = getLocationColumn();
        
        try {
            let query = supabase
                .from(table)
                // 필요한 컬럼만 선택 - 언어별 location 컬럼 사용
                .select(type === 'treatment' 
                    ? `*, hospitals(name, location:${locCol})` 
                    : `*, location:${locCol}`
                )
                .eq('is_published', true)
                .order('display_order', { ascending: true, nullsFirst: false })
                .order('created_at', { ascending: false })
                .range(from, to);

            if (searchTerm) {
                query = query.ilike('name', `%${searchTerm}%`);
            }

        const { data, error } = await query;
        if (error) {
            logError(`PaginatedList ${type}`, error);
            setItemsError(error);
            throw error;
        }
        setItemsError(null);

            // 🔥 [핵심] Mapper를 통해 데이터 표준화
            const mappedData = data.map(item => 
                type === 'treatment' ? mapTreatmentRow(item) : mapHospitalRow(item)
            ).filter(item => item !== null); // null 제거

            if (isLoadMore) {
                setItems(prev => [...prev, ...mappedData]);
                setPage(prev => prev + 1);
            } else {
                setItems(mappedData);
                setPage(0);
            }

            setHasMore(data.length === ITEMS_PER_PAGE);

        } catch (err) {
            logError(`PaginatedList ${type}`, err);
            setItemsError(err);
        } finally {
            setLoading(false);
        }
    }, [type, searchTerm, page]);

    // 탭이 바뀌면(type 변경) 리스트 초기화
    useEffect(() => {
        setItems([]);
        setPage(0);
        setHasMore(true);
        fetchItems(false);
    }, [type, searchTerm, fetchItems]);

    return (
        <>
            <CardListSection 
                title={searchTerm ? `Search Results for "${searchTerm}"` : title} 
                items={items} 
                onCardClick={onCardClick} 
                type={type} 
            />
            {import.meta.env.DEV && itemsError && (
                <div className="max-w-6xl mx-auto px-4 mt-2">
                    <p className="text-xs text-red-500">Error: {itemsError.message}</p>
                </div>
            )}
            
            <div className="flex justify-center mt-4 md:mt-8 mb-6 md:mb-12">
                {loading && page === 0 ? (
                    <div className="flex items-center gap-2 text-teal-600 font-bold"><Loader2 className="animate-spin"/> Loading...</div>
                ) : hasMore ? (
                    <button 
                        onClick={() => fetchItems(true)} 
                        className="px-8 py-3 bg-white border border-gray-200 text-gray-600 rounded-full font-bold shadow-sm hover:bg-gray-50 hover:border-teal-500 hover:text-teal-600 transition"
                    >
                        {loading ? <Loader2 className="animate-spin"/> : "Load More +"}
                    </button>
                ) : null}
            </div>
        </>
    );
};

// ==========================================
// 2. 홈 화면 (Mapper 적용)
// ==========================================
const HomeView = ({ setView, searchTerm, setSearchTerm, siteConfig, navigate }) => {
    const [featuredTreatments, setFeaturedTreatments] = useState([]);
    const [featuredHospitals, setFeaturedHospitals] = useState([]);
    const [treatmentsError, setTreatmentsError] = useState(null);
    const [hospitalsError, setHospitalsError] = useState(null);

    useEffect(() => {
        const fetchFeatured = async () => {
            const locCol = getLocationColumn();
            
            // Fetch treatments with language-aware location
            const { data: tData, error: tError } = await supabase
                .from('treatments')
                .select(`*, hospitals(name, location:${locCol})`)
                .eq('is_published', true)
                .order('display_order', { ascending: true, nullsFirst: false })
                .order('created_at', { ascending: false })
                .limit(4);
            
            if (tError) {
                logError('HomeView Treatments', tError);
                setTreatmentsError(tError);
            } else {
                setTreatmentsError(null);
                if(tData) setFeaturedTreatments(tData.map(mapTreatmentRow).filter(i => i));
            }

            // Fetch hospitals with language-aware location
            const { data: hData, error: hError } = await supabase
                .from('hospitals')
                .select(`*, location:${locCol}`)
                .eq('is_published', true)
                .order('display_order', { ascending: true, nullsFirst: false })
                .order('created_at', { ascending: false })
                .limit(4);
            
            if (hError) {
                logError('HomeView Hospitals', hError);
                setHospitalsError(hError);
            } else {
                setHospitalsError(null);
                if(hData) setFeaturedHospitals(hData.map(mapHospitalRow).filter(i => i));
            }
        };
        fetchFeatured();
    }, []);

    return (
        <>
            <HeroSection setView={setView} searchTerm={searchTerm} setSearchTerm={setSearchTerm} siteConfig={siteConfig} />
            
            <div>
                <CardListSection 
                    title="HEALO's Signature Collection" 
                    items={featuredTreatments} 
                    onCardClick={(id) => navigate(`/treatments/${id}`)} 
                    type="treatment" 
                />
                {/* DEV: Debug visibility */}
                {import.meta.env.DEV && (
                    <div className="max-w-6xl mx-auto px-4 mt-2">
                        {featuredTreatments.length === 0 && !treatmentsError && (
                            <p className="text-xs text-gray-500">No treatments loaded</p>
                        )}
                        {treatmentsError && (
                            <p className="text-xs text-red-500">Error: {treatmentsError.message}</p>
                        )}
                    </div>
                )}
            </div>
            
            <CardListSection 
                title="Official Medical Partners" 
                items={featuredHospitals} 
                onCardClick={(id) => navigate(`/hospitals/${id}`)} 
                type="hospital" 
            />
            {import.meta.env.DEV && (
                <div className="max-w-6xl mx-auto px-4 mt-2">
                    {featuredHospitals.length === 0 && !hospitalsError && (
                        <p className="text-xs text-gray-500">No hospitals loaded</p>
                    )}
                    {hospitalsError && (
                        <p className="text-xs text-red-500">Error: {hospitalsError.message}</p>
                    )}
                </div>
            )}
        </>
    );
};

// Wrapper Components (기존 유지)
const TreatmentDetailWrapper = ({ setView, setInquiryMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  return <TreatmentDetailPage selectedId={id} setView={setView} setInquiryMode={setInquiryMode} onTreatmentClick={(tid) => navigate(`/treatments/${tid}`)} onHospitalClick={(hid) => navigate(`/hospitals/${hid}`)} />;
};

const HospitalDetailWrapper = ({ setView }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  return <HospitalDetailPage selectedId={id} setView={setView} onTreatmentClick={(tid) => navigate(`/treatments/${tid}`)} />;
};

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast(); // Toast 사용 준비
  const [session, setSession] = useState(null);
  const [inquiryMode, setInquiryMode] = useState('select');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [siteConfig, setSiteConfig] = useState({ logo: '', hero: '' });
  const [simpleList, setSimpleList] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    supabase.from("site_settings").select("*").single().then(({data}) => { if(data) setSiteConfig({ logo: data.logo_url, hero: data.hero_background_url }); });
    const locCol = getLocationColumn();
    supabase.from("treatments").select(`id, name, hospital_id, price_min, hospitals(name)`).eq("is_published", true).then(({data, error}) => { 
        if (error) {
            logError('AppContent Simple list', error);
        } else if(data) {
            setSimpleList(data.map(t => ({ id: t.id, title: t.name, hospitalId: t.hospital_id, hospital: t.hospitals?.name, price: t.price_min ? `$${t.price_min}` : '' }))); 
        }
    });
    return () => { if(data?.subscription) data.subscription.unsubscribe(); };
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  const handleSetView = (viewName) => {
    setIsMobileMenuOpen(false);
    if(viewName === 'home') setSearchTerm('');
    switch(viewName) {
        case 'home': navigate('/'); break;
        case 'admin': navigate('/admin'); break;
        case 'list_treatment': navigate('/treatments'); break;
        case 'list_hospital': navigate('/hospitals'); break;
        case 'inquiry': navigate('/inquiry'); break;
        case 'login': navigate('/login'); break;
        case 'signup': navigate('/signup'); break;
        case 'success': navigate('/success'); break;
        default: navigate('/'); 
    }
  };

  const handleNavClick = (targetView) => { if(targetView !== 'list_treatment') setSearchTerm(''); handleSetView(targetView); };
  const handleLogout = async () => { await supabase.auth.signOut(); toast.success("Logged out successfully!"); navigate('/'); };
  const handleGlobalInquiry = () => { setInquiryMode('select'); navigate('/inquiry'); setIsMobileMenuOpen(false); };
  const handleInquiryClose = () => { navigate(-1); };
  const getCurrentView = () => { const path = location.pathname; if (path === '/') return 'home'; if (path.includes('treatments')) return 'list_treatment'; if (path.includes('hospitals')) return 'list_hospital'; return ''; };

  return (
    <div className="font-sans text-gray-800 bg-gray-50 min-h-screen relative">
      <Header setView={handleSetView} view={getCurrentView()} handleGlobalInquiry={handleGlobalInquiry} isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} onNavClick={handleNavClick} session={session} onLogout={handleLogout} siteConfig={siteConfig} />
      
      {/* 🔥 ErrorBoundary로 감싸서 앱 보호 */}
      <ErrorBoundary>
        <main className="pb-24">
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-teal-600" size={32} /></div>}>
            <Routes>
            <Route path="/" element={<><HomeView setView={handleSetView} searchTerm={searchTerm} setSearchTerm={setSearchTerm} siteConfig={siteConfig} navigate={navigate} /><div className="mt-4 md:mt-10"><PersonalConciergeCTA onClick={handleGlobalInquiry} /></div></>} />
            <Route path="/admin" element={<AdminPage setView={handleSetView} />} />
            
            {/* 🔥 핵심 수정: key={type} 추가로 탭 전환 버그 해결 */}
            <Route path="/treatments" element={<><PaginatedList key="treatment" type="treatment" title="All Treatments" searchTerm={searchTerm} onCardClick={(id) => navigate(`/treatments/${id}`)} /><div className="mt-4 md:mt-10"><PersonalConciergeCTA onClick={handleGlobalInquiry} /></div></>} />
            <Route path="/hospitals" element={<><PaginatedList key="hospital" type="hospital" title="Partner Hospitals" searchTerm={searchTerm} onCardClick={(id) => navigate(`/hospitals/${id}`)} /><div className="mt-4 md:mt-10"><PersonalConciergeCTA onClick={handleGlobalInquiry} /></div></>} />
            
            <Route path="/treatments/:id" element={<TreatmentDetailWrapper setView={handleSetView} setInquiryMode={setInquiryMode} />} />
            <Route path="/hospitals/:id" element={<HospitalDetailWrapper setView={handleSetView} />} />
            <Route path="/inquiry" element={<InquiryPage setView={handleSetView} mode={inquiryMode} setMode={setInquiryMode} onClose={handleInquiryClose} treatments={simpleList} />} />
            <Route path="/inquiry/intake" element={<InquiryIntakePage setView={handleSetView} />} />
            <Route path="/login" element={<LoginPage setView={handleSetView} />} />
            <Route path="/signup" element={<SignUpPage setView={handleSetView} />} />
            <Route path="/success" element={<SuccessPage setView={handleSetView} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </Suspense>
        </main>
      </ErrorBoundary>

      {!location.pathname.includes('success') && (<><MobileBottomNav setView={handleSetView} view={getCurrentView()} onInquiry={handleGlobalInquiry} onNavClick={handleNavClick} /><div className="hidden md:block"><FloatingInquiryBtn onClick={handleGlobalInquiry} /></div></>)}
    </div>
  );
}

function App() { 
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </BrowserRouter>
  ); 
}
export default App;