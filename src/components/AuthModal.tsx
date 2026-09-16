import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, AlertCircle, CheckCircle2, Loader2, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { authModalOpen, authModalMode, accountType, setAccountType, openAuthModal, closeAuthModal, loginWithEmail, signUpWithEmail, signInWithGoogle, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!authModalOpen) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setResetSuccess(false);
    if (!email.includes('@')) return setFormError('Please enter a valid email address.');
    if (authModalMode !== 'forgot' && password.length < 8) return setFormError('Password must be at least 8 characters.');
    if (authModalMode === 'signup' && !fullName.trim()) return setFormError('Full name is required.');
    if (authModalMode === 'signup' && password !== confirmPassword) return setFormError('Passwords do not match.');
    setLoading(true);
    try {
      if (authModalMode === 'forgot') {
        await resetPassword(email);
        setResetSuccess(true);
      } else if (authModalMode === 'signup') {
        if (accountType === 'authority') throw new Error('Municipal authority accounts are provisioned by the system administrator.');
        await signUpWithEmail(fullName, email, password, 'citizen');
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally { setLoading(false); }
  };

  const google = async () => {
    setFormError(null); setGoogleLoading(true);
    try { await signInWithGoogle(); }
    catch (err) { setFormError(err instanceof Error ? err.message : 'Google sign-in failed.'); }
    finally { setGoogleLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className={`h-1.5 w-full ${accountType === 'authority' ? 'bg-amber-500' : 'bg-cyan-500'}`} />
        <div className="p-6 sm:p-8">
          <button onClick={closeAuthModal} aria-label="Close sign in" className="absolute right-5 top-5 rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button>
          <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5">
            <button type="button" onClick={() => setAccountType('citizen')} className={`rounded-xl py-2 text-xs font-bold ${accountType === 'citizen' ? 'bg-cyan-500 text-slate-950' : 'text-slate-500 hover:bg-white'}`}><User className="mr-1 inline h-4 w-4" />Citizen</button>
            <button type="button" onClick={() => setAccountType('authority')} className={`rounded-xl py-2 text-xs font-bold ${accountType === 'authority' ? 'bg-amber-500 text-slate-950' : 'text-slate-500 hover:bg-white'}`}><Building2 className="mr-1 inline h-4 w-4" />Authority</button>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50 text-cyan-600"><ShieldCheck className="h-6 w-6" /></div>
            <h3 className="mt-3 text-xl font-black text-slate-900">{accountType === 'authority' ? 'Municipal Authority Login' : authModalMode === 'signup' ? 'Create Citizen Account' : authModalMode === 'forgot' ? 'Reset Password' : 'Citizen Portal Login'}</h3>
            <p className="mt-1 text-xs text-slate-500">{accountType === 'authority' ? 'Sign in with an administrator-provisioned municipal account.' : 'Use your verified account to report and track road issues.'}</p>
          </div>
          {formError && <div role="alert" className="mt-4 flex gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700"><AlertCircle className="h-4 w-4 shrink-0" /><span>{formError}</span></div>}
          {resetSuccess && <div role="status" className="mt-4 flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700"><CheckCircle2 className="h-4 w-4" /><span>Password reset link sent. Check your inbox.</span></div>}
          <form onSubmit={submit} className="mt-5 space-y-3">
            {authModalMode === 'signup' && accountType === 'citizen' && <div><label className="mb-1 block text-[11px] font-semibold text-slate-700">Full Name</label><div className="relative"><User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-cyan-500" placeholder="Enter your name" /></div></div>}
            <div><label className="mb-1 block text-[11px] font-semibold text-slate-700">{accountType === 'authority' ? 'Municipal Account Email' : 'Email Address'}</label><div className="relative"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-cyan-500" placeholder={accountType === 'authority' ? 'Authorized municipal email' : 'name@example.com'} /></div></div>
            {authModalMode !== 'forgot' && <div><div className="mb-1 flex justify-between"><label className="text-[11px] font-semibold text-slate-700">Password</label>{authModalMode === 'login' && <button type="button" onClick={() => openAuthModal('forgot', accountType)} className="text-[11px] text-cyan-600">Forgot?</button>}</div><div className="relative"><Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-cyan-500" placeholder="••••••••" /></div></div>}
            {authModalMode === 'signup' && accountType === 'citizen' && <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-900 outline-none focus:border-cyan-500" placeholder="Confirm password" />}
            <button disabled={loading} className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold ${accountType === 'authority' ? 'bg-amber-500 text-slate-950' : 'bg-cyan-500 text-slate-950'}`}>{loading && <Loader2 className="h-4 w-4 animate-spin" />}{authModalMode === 'signup' ? 'Create Account' : authModalMode === 'forgot' ? 'Send Reset Link' : 'Sign In'}</button>
          </form>
          {accountType === 'citizen' && authModalMode !== 'forgot' && <><div className="my-4 flex items-center gap-2"><div className="h-px flex-1 bg-slate-200" /><span className="text-[10px] text-slate-400">OR</span><div className="h-px flex-1 bg-slate-200" /></div><button type="button" onClick={google} disabled={googleLoading} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">{googleLoading && <Loader2 className="h-4 w-4 animate-spin" />}Continue with Google</button></>}
          {authModalMode !== 'forgot' && <button type="button" onClick={() => openAuthModal(authModalMode === 'login' ? 'signup' : 'login', accountType)} className="mt-4 w-full text-center text-xs text-slate-500 hover:text-cyan-600">{authModalMode === 'login' ? 'New citizen? Create an account' : 'Already have an account? Sign in'}</button>}
        </div>
      </div>
    </div>
  );
};
