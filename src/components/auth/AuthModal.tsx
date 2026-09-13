import React, { useState, useEffect } from 'react';
import { useQuantum } from '../../context/QuantumContext';
import { UserBackgroundProfile } from '../../types/quantum';
import { 
  X, 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  GraduationCap, 
  Mail, 
  Lock, 
  User as UserIcon, 
  CheckCircle2,
  AlertCircle,
  Atom,
  Globe,
  Cpu,
  Database,
  Phone,
  Send,
  KeyRound,
  MessageSquare,
  Smartphone,
  RefreshCw,
  Check,
  Building2,
  Shield
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMandatory?: boolean;
}

type AuthMethod = 'email' | 'google' | 'otp';

const COUNTRY_CODES = [
  { code: '+1', flag: '🇺🇸', name: 'United States / Canada' },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+81', flag: '🇯🇵', name: 'Japan' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: '+86', flag: '🇨🇳', name: 'China' }
];

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, isMandatory = false }) => {
  const { 
    loginUser, 
    registerUser, 
    loginWithGoogle, 
    loginWithTwilioSendOtp, 
    loginWithTwilioVerifyOtp 
  } = useQuantum();

  const [authRoleTab, setAuthRoleTab] = useState<'student' | 'admin'>('student');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [userBackground, setUserBackground] = useState<UserBackgroundProfile>('cs-undergrad');

  // Google SSO State
  const [googleEmail, setGoogleEmail] = useState('');

  // SMS OTP Form State
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request');
  const [otpCode, setOtpCode] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Status & Feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // OTP Countdown timer handler
  useEffect(() => {
    let timer: any;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  if (!isOpen) return null;

  const handleFillDemoAdmin = () => {
    setAuthRoleTab('admin');
    setAuthMethod('email');
    setMode('login');
    setEmail('admin@quantumedu.ai');
    setPassword('admin123');
    setErrorMsg(null);
  };

  const handleGoogleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const emailToUse = googleEmail.trim() || undefined;
      const nameToUse = googleEmail.trim() ? googleEmail.trim().split('@')[0] : undefined;
      const res = await loginWithGoogle(emailToUse ? { email: emailToUse, fullName: nameToUse } : undefined);
      if (res.success) {
        setSuccessMsg('Google Authentication successful. Redirecting to Workbench...');
        setTimeout(() => onClose(), 400);
      } else {
        setErrorMsg(res.message || 'Google Sign-In failed.');
      }
    } catch (err) {
      setErrorMsg('Google Sign-In service error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 7) {
      setErrorMsg('Please enter a valid phone number (at least 7 digits).');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await loginWithTwilioSendOtp(cleanPhone, countryCode);
      if (res.success) {
        setSuccessMsg(res.message || `Verification SMS sent to ${countryCode} ${cleanPhone}. Test Code: 123456`);
        setOtpStep('verify');
        setOtpCode('123456');
        setResendTimer(60);
      } else {
        setErrorMsg(res.message || 'Failed to send SMS OTP.');
      }
    } catch (err) {
      setErrorMsg('SMS OTP service error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otpCode.replace(/\D/g, '');
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (!cleanOtp || cleanOtp.length !== 6) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await loginWithTwilioVerifyOtp(
        cleanPhone, 
        cleanOtp, 
        fullName || 'Quantum Learner', 
        userBackground
      );
      if (res.success) {
        setSuccessMsg('Phone authentication verified. Access granted.');
        setTimeout(() => onClose(), 400);
      } else {
        setErrorMsg(res.message || 'Invalid verification code.');
      }
    } catch (err) {
      setErrorMsg('Phone verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'login' || authRoleTab === 'admin') {
        const res = await loginUser(email, password);
        if (!res.success) {
          setErrorMsg(res.message || 'Invalid email or password.');
        } else {
          setSuccessMsg('Authentication successful. Welcome back.');
          setTimeout(() => onClose(), 400);
        }
      } else {
        if (!fullName.trim()) {
          setErrorMsg('Full Name is required for registration.');
          setIsLoading(false);
          return;
        }
        const res = await registerUser(email, password, fullName, userBackground, 'student');
        if (!res.success) {
          setErrorMsg(res.message || 'Registration failed.');
        } else {
          setSuccessMsg('Account registered successfully. Signing in...');
          setTimeout(() => onClose(), 400);
        }
      }
    } catch (err: any) {
      setErrorMsg('An unexpected error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderAuthFormContent = () => (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden w-full relative text-slate-900">
      {/* Sleek Header */}
      <div className="p-6 bg-slate-50/80 border-b border-slate-200 relative">
        {!isMandatory && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 mb-2">
          <Shield className="w-4 h-4 text-blue-600" />
          <span className="uppercase tracking-wider font-bold text-slate-700">Quantum Education Platform</span>
        </div>
        
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          {authRoleTab === 'admin' ? 'Faculty & Admin Portal' : 'Student Access Gateway'}
        </h2>
        
        <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
          {authRoleTab === 'admin'
            ? 'Sign in with administrator credentials to manage courses and inspect learner analytics.'
            : 'Sign in to access quantum circuit designers, 3D visualizers, and saved progress.'}
        </p>
      </div>

      {/* Role Navigation (Student vs Admin) */}
      <div className="flex border-b border-slate-200 bg-slate-100/70 p-1.5 gap-1.5">
        <button
          type="button"
          onClick={() => {
            setAuthRoleTab('student');
            setErrorMsg(null);
          }}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
            authRoleTab === 'student'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Student Access</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setAuthRoleTab('admin');
            setAuthMethod('email');
            setMode('login');
            setErrorMsg(null);
          }}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
            authRoleTab === 'admin'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Faculty / Admin</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-4">
        {/* Auth Provider Selector (Email, Google, Mobile OTP) */}
        {authRoleTab === 'student' && (
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => { setAuthMethod('email'); setErrorMsg(null); }}
              className={`py-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center space-x-1.5 ${
                authMethod === 'email'
                  ? 'bg-white text-slate-900 border border-slate-200 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              <span>Email</span>
            </button>

            <button
              type="button"
              onClick={() => { setAuthMethod('google'); setErrorMsg(null); }}
              className={`py-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center space-x-1.5 ${
                authMethod === 'google'
                  ? 'bg-white text-slate-900 border border-slate-200 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => { setAuthMethod('otp'); setErrorMsg(null); }}
              className={`py-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center space-x-1.5 ${
                authMethod === 'otp'
                  ? 'bg-white text-slate-900 border border-slate-200 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>OTP</span>
            </button>
          </div>
        )}

        {/* Quick Fill Demo Account Helper */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">
            Quick Fill Demo Account:
          </div>
          <div>
            <button
              type="button"
              onClick={handleFillDemoAdmin}
              className="w-full py-2 px-3 rounded-lg bg-white border border-slate-200 text-indigo-700 text-xs font-bold hover:bg-indigo-50 transition-all flex items-center justify-center space-x-2 shadow-sm"
            >
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Fill Admin Demo Account (admin@quantumedu.ai)</span>
            </button>
          </div>
        </div>

        {/* Error & Success Alerts */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center space-x-2 animate-fadeIn shadow-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-fadeIn shadow-sm">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* METHOD 1: EMAIL / PASSWORD */}
        {authMethod === 'email' && (
          <div className="space-y-3">
            {authRoleTab === 'student' && (
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMsg(null); }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    mode === 'login'
                      ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('register'); setErrorMsg(null); }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    mode === 'register'
                      ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Register
                </button>
              </div>
            )}

            <form onSubmit={handleSubmitEmail} className="space-y-3">
              {mode === 'register' && authRoleTab === 'student' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Alex Rivera"
                      className="w-full pl-9 pr-3 py-2 bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={authRoleTab === 'admin' ? 'admin@quantumedu.ai' : 'student@quantumedu.ai'}
                    className="w-full pl-9 pr-3 py-2 bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                  />
                </div>
              </div>

              {mode === 'register' && authRoleTab === 'student' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Academic Level</label>
                  <select
                    value={userBackground}
                    onChange={(e) => setUserBackground(e.target.value as UserBackgroundProfile)}
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                  >
                    <option value="high-school">High School Physics</option>
                    <option value="cs-undergrad">CS Undergraduate (Linear Algebra)</option>
                    <option value="physics-phd">Physics PhD (Unitary Operators)</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : authRoleTab === 'admin' ? (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Log In as Faculty / Admin</span>
                  </>
                ) : mode === 'login' ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to Student Account</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Account & Save Profile</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* METHOD 2: GOOGLE OAUTH */}
        {authMethod === 'google' && (
          <form onSubmit={handleGoogleSignIn} className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center mx-auto shadow-sm">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">Google Single Sign-On</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Authenticate securely using your institution or personal Google account.
              </p>
            </div>

            <div className="text-left">
              <label className="block text-xs font-bold text-slate-700 mb-1">Google Email (Optional)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="e.g. mousam@gmail.com (Leave blank for default account)"
                  className="w-full pl-9 pr-3 py-2 bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating with Google...</span>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google Account</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* METHOD 3: MOBILE SMS OTP */}
        {authMethod === 'otp' && (
          <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs border-b border-slate-200 pb-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>SMS OTP Phone Authentication</span>
            </div>

            {otpStep === 'request' ? (
              <form onSubmit={handleSendOtp} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <div className="flex space-x-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="bg-white text-slate-900 font-semibold border border-slate-300 rounded-xl px-2 py-2 text-xs focus:outline-none focus:border-blue-600 shadow-sm"
                    >
                      {COUNTRY_CODES.map(c => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>

                    <div className="relative flex-1">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="555-019-2834"
                        className="w-full pl-9 pr-3 py-2 bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-blue-600 shadow-sm font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm flex items-start space-x-2">
                  <Smartphone className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                  <span>
                    A 6-digit verification code will be sent via SMS OTP. Test Code: <strong className="text-blue-600 font-mono">123456</strong>
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Dispatching SMS...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Verification Code</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-3 animate-fadeIn">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-700 shadow-sm font-medium">
                  <span>SMS sent to <strong>{countryCode} {phoneNumber}</strong></span>
                  <button
                    type="button"
                    onClick={() => setOtpStep('request')}
                    className="text-[11px] text-blue-600 hover:underline font-bold"
                  >
                    Edit
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Enter 6-Digit Code</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-blue-600 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="123456"
                      className="w-full pl-9 pr-3 py-2 bg-white text-blue-600 tracking-widest font-mono text-sm font-bold border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 text-center shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">
                    {resendTimer > 0 ? (
                      <span>Resend code in <strong className="text-slate-800 font-mono">{resendTimer}s</strong></span>
                    ) : (
                      <span>Didn't receive SMS?</span>
                    )}
                  </span>

                  <button
                    type="button"
                    disabled={resendTimer > 0 || isLoading}
                    onClick={handleSendOtp}
                    className="text-blue-600 font-bold hover:underline disabled:opacity-40 flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Resend</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Verifying Code...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Verify & Enter Workbench</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (isMandatory) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-100 text-slate-900 overflow-y-auto p-4 md:p-8 select-none">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Feature Showcase Banner */}
          <div className="lg:col-span-7 space-y-6 text-left pr-0 lg:pr-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                <Atom className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
                  <span>QUANTUM STUDIO</span>
                </span>
                <p className="text-xs text-slate-500 font-semibold">Enterprise Quantum Computing & Simulation Platform</p>
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                Enterprise & Academic Access Gateway
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Sign in with institutional credentials, <strong>Google SSO</strong>, or <strong>SMS OTP</strong> to access multi-framework quantum circuit simulation, 3D state visualization, and automated assessment tracking.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-start space-x-3">
                <Cpu className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Multi-Framework Engines</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Qiskit Aer, Cirq, PennyLane, qBraid & Native simulator.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-start space-x-3">
                <Globe className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">3D State Visualization</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Bloch sphere vectors & Qosphere phase entanglement mappers.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-start space-x-3">
                <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Google & OTP Auth</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Secure Google SSO and Mobile SMS OTP verification.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-start space-x-3">
                <Database className="w-4 h-4 text-slate-700 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Database Storage</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">SQLite & PostgreSQL SQLAlchemy persistence.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Auth Form */}
          <div className="lg:col-span-5 w-full">
            {renderAuthFormContent()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="max-w-md w-full">
        {renderAuthFormContent()}
      </div>
    </div>
  );
};
