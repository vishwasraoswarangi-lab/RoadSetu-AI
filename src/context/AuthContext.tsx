import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  db,
  isFirebaseConfigured,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  formatAuthError,
  sanitizeForFirestore,
} from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isFirebaseReady: boolean;
  accountType: 'citizen' | 'authority';
  setAccountType: (type: 'citizen' | 'authority') => void;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, pass: string, role?: 'citizen' | 'municipal_officer') => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  updateUserProfileData: (newName: string, photoURL?: string) => Promise<void>;
  authModalOpen: boolean;
  authModalMode: 'login' | 'signup' | 'forgot';
  openAuthModal: (mode?: 'login' | 'signup' | 'forgot', targetAccount?: 'citizen' | 'authority') => void;
  closeAuthModal: () => void;
  toastMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [accountType, setAccountType] = useState<'citizen' | 'authority'>('citizen');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(current => current?.text === text ? null : current), 4500);
  };

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    return onAuthStateChanged(auth, async fbUser => {
      try {
        if (!fbUser) {
          setUser(null);
          return;
        }

        const ref = doc(db, 'users', fbUser.uid);
        const snap = await getDoc(ref);
        const data = snap.exists() ? snap.data() : {};

        // A client-created account is always a citizen. Authority/admin roles must be provisioned server-side.
        if (!snap.exists()) {
          const profile: UserProfile = {
            uid: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Citizen',
            photoURL: fbUser.photoURL || '',
            role: 'citizen',
            createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
            reportsCount: 0,
            verifiedRepairsCount: 0,
            emailVerified: fbUser.emailVerified,
          };
          await setDoc(ref, sanitizeForFirestore(profile));
          setUser(profile);
        } else {
          setUser({
            uid: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || data.displayName || 'Citizen',
            photoURL: fbUser.photoURL || data.photoURL || undefined,
            role: data.role || 'citizen',
            createdAt: data.createdAt || fbUser.metadata.creationTime || new Date().toISOString(),
            reportsCount: data.reportsCount || 0,
            verifiedRepairsCount: data.verifiedRepairsCount || 0,
            emailVerified: fbUser.emailVerified,
          });
        }
      } catch (error) {
        console.error('Auth profile sync failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
      setAuthModalOpen(false);
      showToast('Logged in successfully.', 'success');
    } catch (err) {
      const message = formatAuthError(err);
      showToast(message, 'error');
      throw new Error(message);
    }
  };

  const signUpWithEmail = async (name: string, email: string, pass: string, role: 'citizen' | 'municipal_officer' = 'citizen') => {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    if (role !== 'citizen') throw new Error('Municipal authority accounts are provisioned by the system administrator.');

    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      await updateProfile(cred.user, { displayName: name.trim() });
      try { await sendEmailVerification(cred.user); } catch (e) { console.warn('Verification email:', e); }
      await setDoc(doc(db, 'users', cred.user.uid), sanitizeForFirestore({
        uid: cred.user.uid,
        email: cred.user.email || email.trim(),
        displayName: name.trim(),
        role: 'citizen',
        createdAt: new Date().toISOString(),
        reportsCount: 0,
        verifiedRepairsCount: 0,
      }));
      setAuthModalOpen(false);
      showToast('Citizen account created. Please verify your email.', 'success');
    } catch (err) {
      const message = formatAuthError(err);
      showToast(message, 'error');
      throw new Error(message);
    }
  };

  const signInWithGoogle = async () => {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const ref = doc(db, 'users', result.user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, sanitizeForFirestore({
          uid: result.user.uid,
          email: result.user.email || '',
          displayName: result.user.displayName || 'Citizen',
          photoURL: result.user.photoURL || '',
          role: 'citizen',
          createdAt: new Date().toISOString(),
          reportsCount: 0,
          verifiedRepairsCount: 0,
        }));
      }
      setAuthModalOpen(false);
      showToast('Signed in with Google.', 'success');
    } catch (err) {
      const message = formatAuthError(err);
      showToast(message, 'error');
      throw new Error(message);
    }
  };

  const logout = async () => {
    if (auth) await firebaseSignOut(auth);
    setUser(null);
    showToast('Signed out.', 'info');
  };

  const resetPassword = async (email: string) => {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setAuthModalOpen(false);
      showToast(`Password reset link sent to ${email.trim()}`, 'success');
    } catch (err) {
      const message = formatAuthError(err);
      showToast(message, 'error');
      throw new Error(message);
    }
  };

  const resendVerificationEmail = async () => {
    if (!auth?.currentUser) return;
    try {
      await sendEmailVerification(auth.currentUser);
      showToast('Verification email sent.', 'success');
    } catch {
      showToast('Could not send verification email. Try again later.', 'error');
    }
  };

  const updateUserProfileData = async (newName: string, photoURL?: string) => {
    if (!auth?.currentUser || !user) return;
    try {
      await updateProfile(auth.currentUser, { displayName: newName.trim(), ...(photoURL ? { photoURL } : {}) });
      await updateDoc(doc(db, 'users', user.uid), { displayName: newName.trim(), ...(photoURL ? { photoURL } : {}) });
      setUser(prev => prev ? { ...prev, displayName: newName.trim(), ...(photoURL ? { photoURL } : {}) } : null);
      showToast('Profile updated successfully.', 'success');
    } catch {
      showToast('Failed to update profile.', 'error');
    }
  };

  const openAuthModal = (mode: 'login' | 'signup' | 'forgot' = 'login', targetAccount?: 'citizen' | 'authority') => {
    setAuthModalMode(mode);
    if (targetAccount) setAccountType(targetAccount);
    setAuthModalOpen(true);
  };

  return (
    <AuthContext.Provider value={{
      user, loading, isFirebaseReady: isFirebaseConfigured, accountType, setAccountType,
      loginWithEmail, signUpWithEmail, signInWithGoogle, logout, resetPassword,
      resendVerificationEmail, updateUserProfileData, authModalOpen, authModalMode,
      openAuthModal, closeAuthModal: () => setAuthModalOpen(false), toastMessage, showToast,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
