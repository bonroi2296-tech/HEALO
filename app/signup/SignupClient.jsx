"use client";

import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Check } from 'lucide-react';
import { createSupabaseBrowserClient } from '../../src/lib/supabase/browser';
import { useToast } from '../../src/components/Toast';
import { PolicyModal } from '../../src/components/Modals';
import { PRIVACY_CONTENT, TERMS_CONTENT } from '../../src/lib/policyContent';

const supabase = createSupabaseBrowserClient();

export const SignUpPage = ({ setView }) => {
    const toast = useToast();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const [isAgreed, setIsAgreed] = useState(false);
    const [isMarketing, setIsMarketing] = useState(false);
    const [activeModal, setActiveModal] = useState(null);
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSignUp = async () => {
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
            setView('login');
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

                <div className="space-y-4">
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

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-400">Or sign up faster with Google</span></div>
                </div>

                <div className="mb-8">
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
