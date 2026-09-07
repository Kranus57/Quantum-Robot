import React, { useState } from 'react';
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
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Atom,
  Globe,
  Cpu,
  Database
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMandatory?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, isMandatory = false }) => {
  const { loginUser, registerUser, loginWithGoogle } = useQuantum();

  const [authRoleTab, setAuthRoleTab] = useState<'student' | 'admin'>('student');
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [userBackground, setUserBackground] = useState<UserBackgroundProfile>('cs-undergrad');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFillDemoStudent = () => {
    setAuthRoleTab('student');
    setMode('login');
    setEmail('alex@quantumedu.ai');
    setPassword('student123');
    setErrorMsg(null);
  };

  const handleFillDemoAdmin = () => {
    setAuthRoleTab('admin');
    setMode('login');
    setEmail('admin@quantumedu.ai');
    setPassword('admin123');
    setErrorMsg(null);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await loginWithGoogle();
      if (res.success) {
        setSuccessMsg('Google Sign-In successful! Welcome to QuantumEdu AI.');
        setTimeout(() => onClose(), 400);
      } else {
        setErrorMsg(res.message || 'Google Sign-In failed.');
      }
    } catch (err) {
      setErrorMsg('Google Sign-In error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
          setSuccessMsg('Authentication successful! Welcome to QuantumEdu AI.');
          setTimeout(() => onClose(), 400);
        }
      } else {
        if (!fullName.trim()) {
          setErrorMsg('Full Name is required for student registration.');
          setIsLoading(false);
          return;
        }
        const res = await registerUser(email, password, fullName, userBackground, 'student');
        if (!res.success) {
          setErrorMsg(res.message || 'Registration failed.');
        } else {
          setSuccessMsg('Account created and saved! Logging you in...');
          setTimeout(() => onClose(), 400);
        }
      }
    } catch (err: any) {
      setErrorMsg('An unexpected authentication error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderAuthFormContent = () => (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden w-full relative">
      {/* Card Header */}
      <div className="p-6 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white relative">
        {!isMandatory && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-300 hover:text-white p-1.5 rounded-lg transition-colors bg-white/10 hover:bg-white/20"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center space-x-2 text-xs font-mono text-blue-300 mb-1">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>QuantumEdu AI Security Gateway</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          {authRoleTab === 'admin' 
            ? 'Administrator Sign In' 
            : (mode === 'login' ? 'Student Sign In' : 'Register New Student')}
        </h2>
        <p className="text-xs text-slate-300 mt-1">
          {authRoleTab === 'admin'
            ? 'Sign in as administrator to inspect live database tables & student performance metrics.'
            : (mode === 'login' 
                ? 'Sign in to access your saved quantum circuits, progress, and badges.' 
                : 'Create an account to save your profile and quantum progress in our database.')}
        </p>
      </div>

      {/* Role Tab Navigation */}
      <div className="flex border-b border-slate-200 bg-slate-50">
        <button
          type="button"
          onClick={() => {
            setAuthRoleTab('student');
            setErrorMsg(null);
          }}
          className={`flex-1 py-3 text-xs font-bold flex items-center justify-center space-x-2 transition-colors ${
            authRoleTab === 'student'
              ? 'bg-white text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Student Portal</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setAuthRoleTab('admin');
            setMode('login');
            setErrorMsg(null);
          }}
          className={`flex-1 py-3 text-xs font-bold flex items-center justify-center space-x-2 transition-colors ${
            authRoleTab === 'admin'
              ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Admin Portal</span>
        </button>
      </div>

      {/* Main Form Content */}
      <div className="p-6 space-y-4">
        {/* Quick Fill Demo Account Helpers */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="text-[11px] font-mono text-slate-500 font-semibold uppercase tracking-wider">
            Quick Fill Demo Accounts:
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleFillDemoStudent}
              className="flex-1 py-1.5 px-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-all flex items-center justify-center space-x-1.5"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Demo Student</span>
            </button>
            <button
              type="button"
              onClick={handleFillDemoAdmin}
              className="flex-1 py-1.5 px-3 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-medium hover:bg-indigo-100 transition-all flex items-center justify-center space-x-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Demo Admin</span>
            </button>
          </div>
        </div>

        {/* Mode Switcher for Student Tab */}
        {authRoleTab === 'student' && (
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(null); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-white text-blue-600 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMsg(null); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'register'
                  ? 'bg-white text-blue-600 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Error & Success Banners */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && authRoleTab === 'student' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full pl-9 pr-3 py-2 bg-white text-slate-900 placeholder-slate-400 font-medium border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={authRoleTab === 'admin' ? 'admin@quantumedu.ai' : 'student@quantumedu.ai'}
                className="w-full pl-9 pr-3 py-2 bg-white text-slate-900 placeholder-slate-400 font-medium border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-white text-slate-900 placeholder-slate-400 font-medium border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all"
              />
            </div>
          </div>

          {mode === 'register' && authRoleTab === 'student' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Background Profile</label>
              <select
                value={userBackground}
                onChange={(e) => setUserBackground(e.target.value as UserBackgroundProfile)}
                className="w-full px-3 py-2 bg-white text-slate-900 font-medium border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all"
              >
                <option value="high-school">High School Student (Intuitive Explanations)</option>
                <option value="cs-undergrad">CS Undergrad (Vectors, Matrices & Linear Algebra)</option>
                <option value="physics-phd">Physics PhD (Hilbert Space & Unitary Dynamics)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-3 py-2.5 px-4 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all flex items-center justify-center space-x-2 shadow-md active:scale-[0.99] disabled:opacity-50"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : authRoleTab === 'admin' ? (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Log In as Administrator</span>
              </>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to Student Account</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Register Account & Save in Database</span>
              </>
            )}
          </button>

          {authRoleTab === 'student' && (
            <>
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[10px] font-semibold uppercase tracking-wider">
                  <span className="bg-white px-2 text-slate-400">Or Continue With</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign In with Google</span>
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );

  if (isMandatory) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 text-slate-100 overflow-y-auto p-4 md:p-8">
        {/* Background Decorative Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Feature Showcase Banner */}
          <div className="lg:col-span-7 space-y-6 text-left pr-0 lg:pr-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Atom className="w-7 h-7 text-white animate-spin-slow" />
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-white flex items-center space-x-2">
                  <span>QuantumEdu AI</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-400/30 font-mono font-normal">
                    v3.0 DB
                  </span>
                </span>
                <p className="text-xs text-blue-300 font-medium">Interactive Quantum Computing & Simulation Platform</p>
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight">
                Mandatory Authentication Gateway
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                Welcome to QuantumEdu AI! Sign in or create a new student account to unlock interactive quantum circuit simulations, 3D visualization, adaptive AI tutoring, and live database progress tracking.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start space-x-3">
                <Cpu className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Multi-Framework Builder</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Qiskit, Cirq, PennyLane & Native statevector simulator.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start space-x-3">
                <Globe className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-200">3D Bloch & Qosphere</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Real-time statevector phase & entanglement sphere visualizer.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Profile-Adaptive AI</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">High School, CS Undergrad & Physics PhD AI Explainer.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start space-x-3">
                <Database className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Database Persistence</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">SQLite & PostgreSQL database record storage for users.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Auth Card Form */}
          <div className="lg:col-span-5 w-full">
            {renderAuthFormContent()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="max-w-md w-full">
        {renderAuthFormContent()}
      </div>
    </div>
  );
};
