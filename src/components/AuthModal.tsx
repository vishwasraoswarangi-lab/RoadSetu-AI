import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Loader2,
  Building2,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    authModalMode,
    accountType,
    setAccountType,
    openAuthModal,
    closeAuthModal,
    loginWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    loginAsDemo,
    resetPassword,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setResetSuccess(false);

    if (authModalMode === 'forgot') {
      if (!email || !email.includes('@')) {
        setFormError('Please enter a valid email address.');
        return;
      }
      setLoading(true);
      try {
        await resetPassword(email);
        setResetSuccess(true);
      } catch (err: unknown) {
        setFormError(err instanceof Error ? err.message : 'Unable to send password reset email.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (authModalMode === 'signup') {
      if (!fullName.trim()) {
        setFormError('Full name is required.');
        return;
      }
      if (!email || !email.includes('@')) {
        setFormError('Please enter a valid email address.');
        return;
      }
      if (password.length < 8) {
        setFormError('Password must be at least 8 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setFormError('Passwords do not match.');
        return;
      }

      setLoading(true);
      try {
        await signUpWithEmail(
          fullName,
          email,
          password,
          accountType === 'authority' ? 'municipal_officer' : 'citizen'
        );
      } catch (err: unknown) {
        setFormError(err instanceof Error ? err.message : 'Registration failed.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Login mode
    if (!email || !email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setFormError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      await loginWithEmail(email, password);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setFormError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Google sign-in failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setFormError(null);
    setDemoLoading(true);
    try {
      await loginAsDemo(accountType);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Demo sign-in failed.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-700/70 bg-[#0E1524] shadow-2xl">
        {/* Header decoration */}
        <div
          className={`h-1.5 w-full transition-colors ${
            accountType === 'authority'
              ? 'bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-400'
              : 'bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400'
          }`}
        />

        <div className="p-6 sm:p-8">
          {/* Close button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-5 right-5 rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Account Type Selector Tabs */}
          <div className="mb-4">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-2">
              Select Account Portal
            </div>
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-900/90 p-1.5 border border-slate-800">
              <button
                type="button"
                onClick={() => setAccountType('citizen')}
                className={`flex items-center justify-center space-x-2 rounded-xl py-2 px-3 text-xs font-bold transition-all ${
                  accountType === 'citizen'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="h-4 w-4" />
                <span>👤 Citizen Portal</span>
              </button>
              <button
                type="button"
                onClick={() => setAccountType('authority')}
                className={`flex items-center justify-center space-x-2 rounded-xl py-2 px-3 text-xs font-bold transition-all ${
                  accountType === 'authority'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="h-4 w-4" />
                <span>🏛️ Authority Hub</span>
              </button>
            </div>
          </div>

          {/* Modal Branding & Title */}
          <div className="text-center">
            <div
              className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border ${
                accountType === 'authority'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
              }`}
            >
              {accountType === 'authority' ? (
                <Building2 className="h-6 w-6" />
              ) : (
                <ShieldCheck className="h-6 w-6" />
              )}
            </div>

            <h3 className="mt-3 text-xl font-black tracking-tight text-white">
              {accountType === 'authority'
                ? authModalMode === 'login'
                  ? 'Municipal Authority Hub'
                  : authModalMode === 'signup'
                  ? 'Register Municipal Engineer'
                  : 'Reset Officer Credentials'
                : authModalMode === 'login'
                ? 'Citizen Portal Login'
                : authModalMode === 'signup'
                ? 'Create Citizen Account'
                : 'Reset Citizen Password'}
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              {accountType === 'authority'
                ? 'Access municipal triage, contractor verification, and payment audit logs.'
                : 'File geotagged road defects and monitor automated municipal repair countdowns.'}
            </p>
          </div>

          {/* Error notice */}
          {formError && (
            <div className="mt-4 flex items-start space-x-2 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Success notice for password reset */}
          {resetSuccess && (
            <div className="mt-4 flex items-start space-x-2 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Password reset link sent! Check your inbox.</span>
            </div>
          )}

          {/* Quick 1-Click Demo Login */}
          {authModalMode !== 'forgot' && (
            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={handleDemoSignIn}
                disabled={demoLoading || loading}
                className={`flex w-full items-center justify-center space-x-2 rounded-xl border py-2.5 px-4 text-xs font-bold transition-all disabled:opacity-50 ${
                  accountType === 'authority'
                    ? 'border-amber-500/40 bg-amber-950/30 text-amber-300 hover:bg-amber-900/40 shadow-md'
                    : 'border-cyan-500/40 bg-cyan-950/30 text-cyan-300 hover:bg-cyan-900/40 shadow-md'
                }`}
              >
                {demoLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                <span>
                  {accountType === 'authority'
                    ? '⚡ Instant Login as Authority (Executive Engineer)'
                    : '⚡ Instant Login as Citizen (Demo Account)'}
                </span>
              </button>

              {/* Google Sign-in Option for Citizen */}
              {accountType === 'citizen' && (
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading || loading}
                  className="flex w-full items-center justify-center space-x-2 rounded-xl border border-slate-700 bg-slate-900/90 py-2.5 px-4 text-xs font-semibold text-slate-200 shadow hover:border-cyan-500/50 hover:bg-slate-800 transition-all disabled:opacity-50"
                >
                  {googleLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                      />
                    </svg>
                  )}
                  <span>Continue with Google</span>
                </button>
              )}

              <div className="relative flex items-center justify-center pt-2">
                <div className="w-full border-t border-slate-800" />
                <span className="bg-[#0E1524] px-2 text-[10px] uppercase tracking-wider text-slate-500">
                  Or use email credentials
                </span>
              </div>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="mt-3 space-y-3">
            {authModalMode === 'signup' && (
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  {accountType === 'authority' ? 'Officer / Engineer Name' : 'Full Name'}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={
                      accountType === 'authority'
                        ? 'e.g. Er. Rajesh Kadam (Zone 2)'
                        : 'Enter your name'
                    }
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                {accountType === 'authority' ? 'Official Municipal Email' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    accountType === 'authority'
                      ? 'officer@roadsetu.gov'
                      : 'name@example.com'
                  }
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            {authModalMode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-300">Password</label>
                  {authModalMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => openAuthModal('forgot')}
                      className="text-[11px] text-cyan-400 hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {authModalMode === 'signup' && (
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`mt-2 flex w-full items-center justify-center space-x-2 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-950 shadow-md transition-all disabled:opacity-50 ${
                accountType === 'authority'
                  ? 'bg-amber-400 hover:bg-amber-300 shadow-amber-500/20'
                  : 'bg-cyan-500 hover:bg-cyan-400 shadow-cyan-500/20'
              }`}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>
                    {authModalMode === 'login' &&
                      (accountType === 'authority'
                        ? 'Sign In to Authority Hub'
                        : 'Sign In to Citizen Portal')}
                    {authModalMode === 'signup' &&
                      (accountType === 'authority'
                        ? 'Register Authority Officer'
                        : 'Register Citizen Account')}
                    {authModalMode === 'forgot' && 'Send Reset Link'}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Mode Switchers */}
          <div className="mt-5 text-center text-xs text-slate-400">
            {authModalMode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => openAuthModal('signup')}
                  className="font-semibold text-cyan-400 hover:underline"
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="font-semibold text-cyan-400 hover:underline"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
