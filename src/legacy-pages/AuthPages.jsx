"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Clock, FileText, Sparkles, Check, MessageCircle, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { createSupabaseBrowserClient } from '../lib/supabase/browser';
import { useToast } from '../components/Toast';
import { PolicyModal } from '../components/Modals';
import { PRIVACY_CONTENT, TERMS_CONTENT } from '../lib/policyContent';

// ✅ SSR-safe browser client (쿠키 기반 세션)
const supabase = createSupabaseBrowserClient();


//  문의 완료 성공 페이지
export const SuccessPage = ({ setView }) => {
    const router = useRouter();
    const [ticketId, setTicketId] = useState(null);
    const [inquirySuccess, setInquirySuccess] = useState(null);

    useEffect(() => {
        setTicketId("REQ-" + Math.floor(100000 + Math.random() * 900000));
    }, []);

    useEffect(() => {
        try {
            const raw = typeof window !== 'undefined' ? sessionStorage.getItem('inquiry_success') : null;
            const data = raw ? JSON.parse(raw) : null;
            if (data?.inquiryId != null && data?.publicToken) {
                setInquirySuccess({ inquiryId: data.inquiryId, publicToken: data.publicToken });
            }
        } catch (_) {}
    }, []);

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4 py-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 relative">
                
                {/* 상단 컬러 라인 (포인트) */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-400 to-teal-600"></div>

                <div className="p-8 pb-10">
                    {/* 1. 애니메이션 아이콘 */}
                    <div className="relative w-24 h-24 mx-auto mb-6">
                        {/* 뒤에서 퍼지는 파동 효과 */}
                        <div className="absolute inset-0 bg-teal-100 rounded-full animate-ping opacity-20"></div>
                        {/* 메인 아이콘 */}
                        <div className="relative bg-gradient-to-tr from-teal-500 to-teal-400 w-full h-full rounded-full flex items-center justify-center shadow-lg shadow-teal-200 border-4 border-white">
                            <CheckCircle2 size={40} className="text-white" strokeWidth={3} />
                        </div>
                        {/* 깨알 데코 (반짝이) */}
                        <div className="absolute -right-2 -top-1 bg-yellow-400 p-1.5 rounded-full border-2 border-white shadow-sm animate-bounce">
                            <Sparkles size={14} className="text-white" fill="currentColor"/>
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Inquiry Received!</h2>
                        <p className="text-gray-500 text-sm">
                            Thank you for choosing HEALO. <br/>We've securely received your request.
                        </p>
                    </div>

                    {/* 2. 접수증 (Ticket Info) */}
                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-8 flex flex-col gap-3 relative overflow-hidden">
                        {/* 배경 데코 패턴 */}
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <FileText size={64} className="text-gray-900" />
                        </div>

                        <div className="flex justify-between items-center text-sm relative z-10">
                            <span className="text-gray-500 font-medium">Reference ID</span>
                            <span className="font-mono font-bold text-teal-800 bg-teal-100/50 px-2 py-0.5 rounded border border-teal-100">
                                {ticketId || "—"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm relative z-10">
                            <span className="text-gray-500 font-medium">Est. Response</span>
                            <span className="font-bold text-gray-900 flex items-center gap-1.5">
                                <Clock size={14} className="text-teal-500"/> Within 24 Hours
                            </span>
                        </div>
                    </div>

                    {/* 3. 진행 상황 타임라인 (What's Next) */}
                    <div className="text-left mb-8 px-2">
                        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-4 ml-1">What happens next?</p>
                        <div className="space-y-0 relative pl-2">
                            {/* 연결선 */}
                            <div className="absolute left-[11px] top-2 bottom-6 w-0.5 bg-gray-100"></div>

                            {/* Step 1 (완료) */}
                            <div className="relative flex gap-4 pb-6">
                                <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center shrink-0 z-10 ring-4 ring-white shadow-sm">
                                    <Check size={12} className="text-white" strokeWidth={3}/>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 leading-none mb-1">Inquiry Submitted</p>
                                    <p className="text-xs text-gray-500">Your details are sent to our medical team.</p>
                                </div>
                            </div>
                            
                            {/* Step 2 (진행중 - 애니메이션) */}
                            <div className="relative flex gap-4 pb-6">
                                <div className="w-6 h-6 rounded-full bg-white border-2 border-teal-500 flex items-center justify-center shrink-0 z-10 ring-4 ring-white">
                                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-teal-600 leading-none mb-1">Medical Review</p>
                                    <p className="text-xs text-gray-500">Coordinator is matching the best hospital.</p>
                                </div>
                            </div>

                            {/* Step 3 (예정) */}
                            <div className="relative flex gap-4">
                                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0 z-10 ring-4 ring-white">
                                    <MessageCircle size={12} className="text-gray-400"/>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-400 leading-none mb-1">Personalized Quote</p>
                                    <p className="text-xs text-gray-400">You'll receive a quote via your contact method.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. Step2 CTA (문의 성공 시만) + 하단 버튼 */}
                    <div className="space-y-3">
                        {inquirySuccess && (
                            <button
                                type="button"
                                onClick={() => {
                                  // ✅ Funnel 이벤트: Step2 CTA 클릭
                                  fetch('/api/inquiries/event', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ eventType: 'step2_viewed', inquiryId: inquirySuccess.inquiryId }),
                                  }).catch(() => {});
                                  router.push(`/inquiry/intake?inquiryId=${inquirySuccess.inquiryId}&token=${encodeURIComponent(inquirySuccess.publicToken)}`);
                                }}
                                className="w-full bg-teal-50 border-2 border-teal-500 text-teal-700 font-bold py-4 rounded-xl hover:bg-teal-100 transition shadow-sm transform active:scale-[0.98]"
                            >
                                추가 정보 제공(선택) — 더 정확한 병원/견적 매칭에 도움
                            </button>
                        )}
                        <button 
                            onClick={() => setView('home')} 
                            className="w-full bg-teal-600 text-white font-bold py-4 rounded-xl hover:bg-teal-700 transition shadow-lg shadow-teal-100 transform active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            Return to Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 4. 로그인 페이지 ---
export const LoginPage = ({ setView }) => {
    const toast = useToast(); // Toast 사용 준비
    const router = useRouter(); // Next.js router
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // 눈알 아이콘용
    const [oauthLoading, setOauthLoading] = useState(false); // OAuth 로딩 상태

    const handleLogin = async (e) => {
        // 폼 전송 방지 (엔터키 쳐도 새로고침 안되게)
        if(e) e.preventDefault();
        
        setLoading(true);

        // 1. Supabase 로그인 시도
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            toast.error("Login failed. Please check your email and password.");
            setLoading(false);
        } else {
            // 2. 로그인 성공!
            console.log("Logged in:", data.user.email);
            toast.success(`Welcome, ${data.user.email}!`);
            
            // ✅ Admin 권한 체크 후 적절한 페이지로 redirect
            try {
                const whoamiResponse = await fetch('/api/admin/whoami', {
                    credentials: 'include', // 쿠키 포함
                });
                
                if (whoamiResponse.ok) {
                    const whoamiResult = await whoamiResponse.json();
                    
                    // 🔍 디버그 정보 출력
                    console.log('[LoginPage] whoami result:', {
                        isAdmin: whoamiResult.isAdmin,
                        email: whoamiResult.email,
                        reason: whoamiResult.reason,
                        error: whoamiResult.error,
                        debug: whoamiResult.debug
                    });
                    
                    if (whoamiResult.isAdmin) {
                        // Admin 권한 있음 → /admin으로
                        console.log('[LoginPage] ✅ Admin detected, redirecting to /admin');
                        router.push('/admin');
                    } else {
                        // Admin 권한 없음 → 홈으로
                        console.log('[LoginPage] Non-admin user, redirecting to home');
                        // ❌ 일반 사용자에게 불필요한 토스트 제거
                        router.push('/');
                    }
                } else {
                    // whoami 실패 → 안전하게 홈으로
                    console.warn('[LoginPage] whoami check failed, redirecting to home');
                    router.push('/');
                }
            } catch (checkError) {
                console.error('[LoginPage] Admin check error:', checkError);
                // 에러 발생 시 안전하게 홈으로
                router.push('/');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-white px-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="max-w-sm w-full">
                {/* 헤더 디자인 */}
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-extrabold text-gray-900">Welcome to HEALO</h2>
                    <p className="text-gray-500 mt-2">Start Your Journey</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {/* 이메일 입력 */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-3.5 text-gray-400" size={20}/>
                            <input 
                                type="email" 
                                required
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all bg-gray-50"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* 비밀번호 입력 */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-bold text-gray-700">Password</label>
                            <button type="button" onClick={() => toast.info("Coming soon!")} className="text-xs font-bold text-teal-600 hover:underline">Forgot?</button>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 text-gray-400" size={20}/>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                required
                                className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all bg-gray-50"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                            </button>
                        </div>
                    </div>

                    {/* 로그인 버튼 */}
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/20 disabled:bg-gray-400"
                    >
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>

                {/* 소셜 로그인 */}
                <div className="mt-8">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                        <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-400">Or continue with</span></div>
                    </div>

                    <div className="mt-6">
                        {/* Google 로그인 버튼 */}
                        <button
                            onClick={async () => {
                                console.log('[LoginPage] 🔵 Google button clicked!');
                                console.log('[LoginPage] window.location.origin:', window.location.origin);
                                
                                setOauthLoading(true);
                                try {
                                    const redirectUrl = `${window.location.origin}/auth/callback`;
                                    console.log('[LoginPage] redirectTo:', redirectUrl);
                                    
                                    console.log('[LoginPage] Calling signInWithOAuth...');
                                    const { data, error } = await supabase.auth.signInWithOAuth({
                                        provider: 'google',
                                        options: {
                                            redirectTo: redirectUrl,
                                        },
                                    });
                                    
                                    console.log('[LoginPage] signInWithOAuth result:', { data, error });
                                    
                                    if (error) {
                                        console.error('[LoginPage] ❌ OAuth error:', error);
                                        toast.error('Google login failed. Please try again.');
                                        setOauthLoading(false);
                                    } else {
                                        console.log('[LoginPage] ✅ OAuth initiated, redirecting to Google...');
                                    }
                                    // 성공 시 Google 로그인 페이지로 redirect되므로 loading은 유지
                                } catch (err) {
                                    console.error('[LoginPage] ❌ Google OAuth exception:', err);
                                    toast.error('An error occurred. Please try again.');
                                    setOauthLoading(false);
                                }
                            }}
                            disabled={loading || oauthLoading}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {/* Google 로고 SVG */}
                            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            
                            <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">
                                {oauthLoading ? 'Connecting to Google...' : 'Continue with Google'}
                            </span>
                        </button>
                    </div>
                </div>

                <p className="mt-8 text-center text-gray-500">
                    Don't have an account?{' '}
                    <button onClick={() => setView('signup')} className="text-teal-600 font-bold hover:underline">
                        Sign Up
                    </button>
                </p>
            </div>
        </div>
    );
};

// --- 5. 회원가입 페이지 ---
export const SignUpPage = ({ setView }) => {
    const toast = useToast(); // Toast 사용 준비
    // ✅ Supabase 연결을 위한 상태값
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    // 기존 UI 상태값 (디자인 유지)
    const [isAgreed, setIsAgreed] = useState(false);
    const [isMarketing, setIsMarketing] = useState(false);
    const [activeModal, setActiveModal] = useState(null);
    
    // 비밀번호 상태값
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSignUp = async () => {
        // 1. 유효성 검사
        if (!firstName || !lastName || !email) {
            toast.error("Please fill in all required fields.");
            return;
        }
        if (!isAgreed) {
            toast.error("Please agree to the Terms and Privacy Policy.");
            return;
        }
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        setLoading(true);

        // 2. 🔥 Supabase 회원가입 요청 (이름 정보 포함)
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    is_marketing_agreed: isMarketing,
                },
            },
        });

        if (error) {
            toast.error("Sign up failed: " + error.message);
        } else {
            toast.success("Account created! 🎉\nPlease check your email.");
            setView('login'); // 성공 시 로그인 페이지로 이동
        }
        setLoading(false);
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 md:p-10 border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900">Create Account</h2>
                    <p className="text-gray-500 mt-2">Join HEALO for exclusive benefits</p>
                </div>

                {/* 입력 폼 섹션 */}
                <div className="space-y-4">
                    {/* 이름 필드 */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">First Name</label>
                            <input 
                                type="text" 
                                placeholder="John" 
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full p-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Last Name</label>
                            <input 
                                type="text" 
                                placeholder="Doe" 
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full p-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition text-sm"
                            />
                        </div>
                    </div>
                    <p className="text-[10px] text-gray-400 px-1 -mt-2">
                        Make sure this matches the name on your passport.
                    </p>

                    {/* 이메일 필드 */}
                    <div>
                        <div className="relative">
                            <Mail className="absolute left-4 top-3.5 text-gray-400" size={20}/>
                            <input 
                                type="email" 
                                placeholder="Email Address" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition text-sm"
                            />
                        </div>
                    </div>
                    
                    {/* 비밀번호 입력 */}
                    <div className="relative">
                        <Lock className="absolute left-4 top-3.5 text-gray-400" size={20}/>
                        <input 
                            type={showPassword ? "text" : "password"} 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password (Min. 6 chars)" 
                            className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition text-sm"
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                            {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                        </button>
                    </div>

                    {/* 비밀번호 확인 */}
                    <div className="relative">
                        <Lock className="absolute left-4 top-3.5 text-gray-400" size={20}/>
                        <input 
                            type={showConfirmPassword ? "text" : "password"} 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm Password" 
                            className={`w-full pl-12 pr-12 py-3 rounded-xl border focus:ring-2 outline-none transition text-sm ${
                                confirmPassword && password !== confirmPassword 
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                                : 'border-gray-200 focus:border-teal-500 focus:ring-teal-100'
                            }`}
                        />
                        <button 
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                            {showConfirmPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                        </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                        <p className="text-[10px] text-red-500 px-1 -mt-2">Passwords do not match.</p>
                    )}

                    {/* 약관 동의 */}
                    <div className="space-y-3 pt-2">
                        <div className="flex items-start gap-3">
                            <div className="relative flex items-center pt-0.5">
                                <input 
                                    type="checkbox" 
                                    id="terms" 
                                    checked={isAgreed}
                                    onChange={(e) => setIsAgreed(e.target.checked)}
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all checked:border-teal-600 checked:bg-teal-600"
                                />
                                <div className="pointer-events-none absolute top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 text-white opacity-0 peer-checked:opacity-100">
                                    <Check size={14} strokeWidth={4} />
                                </div>
                            </div>
                            <label htmlFor="terms" className="text-xs text-gray-500 cursor-pointer select-none leading-snug">
                                I agree to the <span onClick={(e) => { e.preventDefault(); setActiveModal('privacy'); }} className="text-teal-600 font-bold hover:underline">Privacy Policy</span> and <span onClick={(e) => { e.preventDefault(); setActiveModal('terms'); }} className="text-teal-600 font-bold hover:underline">Terms</span>. <span className="text-red-500">*</span>
                            </label>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="relative flex items-center pt-0.5">
                                <input 
                                    type="checkbox" 
                                    id="marketing" 
                                    checked={isMarketing}
                                    onChange={(e) => setIsMarketing(e.target.checked)}
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all checked:border-teal-600 checked:bg-teal-600"
                                />
                                <div className="pointer-events-none absolute top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 text-white opacity-0 peer-checked:opacity-100">
                                    <Check size={14} strokeWidth={4} />
                                </div>
                            </div>
                            <label htmlFor="marketing" className="text-xs text-gray-500 cursor-pointer select-none leading-snug">
                                I want to receive marketing emails including exclusive medical deals.
                            </label>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleSignUp}
                        disabled={loading}
                        className={`w-full font-bold py-3.5 rounded-xl transition shadow-lg ${isAgreed && !loading ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-100' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </div>

                {/* 하단 섹션 (구분선, 소셜 로그인 등) */}
                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-400">Or sign up faster with Google</span></div>
                </div>

                <div className="mb-8">
                    {/* Google 회원가입 버튼 */}
                    <button
                        onClick={async () => {
                            console.log('[SignUpPage] 🔵 Google sign-up clicked!');
                            setLoading(true);
                            try {
                                const redirectUrl = `${window.location.origin}/auth/callback`;
                                const { data, error } = await supabase.auth.signInWithOAuth({
                                    provider: 'google',
                                    options: {
                                        redirectTo: redirectUrl,
                                    },
                                });
                                
                                if (error) {
                                    console.error('[SignUpPage] ❌ OAuth error:', error);
                                    toast.error('Google sign-up failed. Please try again.');
                                    setLoading(false);
                                } else {
                                    console.log('[SignUpPage] ✅ OAuth initiated, redirecting to Google...');
                                }
                            } catch (err) {
                                console.error('[SignUpPage] ❌ Google OAuth exception:', err);
                                toast.error('An error occurred. Please try again.');
                                setLoading(false);
                            }
                        }}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {/* Google 로고 SVG */}
                        <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        
                        <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">
                            {loading ? 'Connecting to Google...' : 'Sign up with Google'}
                        </span>
                    </button>
                </div>

                <div className="text-center text-sm text-gray-500">
                    Already have an account? <span onClick={() => setView('login')} className="text-teal-600 font-bold cursor-pointer hover:underline">Log In</span>
                </div>
            </div>

            {/* 모달창 */}
            <PolicyModal 
                isOpen={activeModal === 'privacy'} 
                onClose={() => setActiveModal(null)} 
                title="Privacy Policy" 
                content={PRIVACY_CONTENT} 
            />
            <PolicyModal 
                isOpen={activeModal === 'terms'} 
                onClose={() => setActiveModal(null)} 
                title="Terms of Service" 
                content={TERMS_CONTENT} 
            />
        </div>
    );
};
