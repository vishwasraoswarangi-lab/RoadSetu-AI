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

function profileFromFirebaseUser(fbUser: any, data: Record<string, any> = {}): UserProfile {
  return {
    uid: fbUser.uid,
    email: fbUser.email || '',
    displayName: fbUser.displayName || data.displayName || fbUser.email?.split('@')[0] || 'Citizen',
    photoURL: fbUser.photoURL || data.photoURL || '',
    role: data.role || 'citizen',
    createdAt: data.createdAt || fbUser.metadata.creationTime || new Date().toISOString(),
    reportsCount: Number(data.reportsCount || 0),
    verifiedRepairsCount: Number(data.verifiedRepairsCount || 0),
    emailVerified: fbUser.emailVerified,
  };
}

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
    if (!isFirebaseConfigured || !auth?.currentUser && !auth) {
      setLoading(false);
      return;
    }

    return onAuthStateChanged(auth, async fbUser => {
      if (!fbUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Firebase Auth is the source of truth for the active session.
      // Build a usable local profile immediately so a Firestore outage/rule error
      // cannot make a successful login appear to have failed.
      const fallbackProfile = profileFromFirebaseUser(fbUser);
      setUser(fallbackProfile);
      setLoading(false);

      try {
        const ref = doc(db, 'users', fbUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setUser(profileFromFirebaseUser(fbUser, snap.data()));
        } else {
          await setDoc(ref, sanitizeForFirestore(fallbackProfile));
          setUser(fallbackProfile);
        }
      } catch (error) {
        console.error('Auth profile sync failed; Firebase session retained:', error);
        showToast('Signed in. Profile data will sync when the connection is available.', 'info');
      }
    });
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    if (!auth) throw new Error('Firebase Auth is not initialized.');
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
    if (!auth) throw new Error('Firebase Auth is not initialized.');
    if (role !== 'citizen') {
      const message = 'Municipal authority accounts are provisioned by the system administrator.';
      showToast(message, 'error');
      throw new Error(message);
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      await updateProfile(cred.user, { displayName: name.trim() });
      const profile: UserProfile = {
        uid: cred.user.uid,
        email: cred.user.email || email.trim(),
        displayName: name.trim(),
        photoURL: cred.user.photoURL || '',
        role: 'citizen',
        createdAt: new Date().toISOString(),
        reportsCount: 0,
        verifiedRepairsCount: 0,
        emailVerified: cred.user.emailVerified,
      };
      setUser(profile);
      setAuthModalOpen(false);
      showToast('Citizen account created.', 'success');

      try {
        await setDoc(doc(db, 'users', cred.user.uid), sanitizeForFirestore(profile));
      } catch (profileError) {
        console.error('New account profile sync failed:', profileError);
        showToast('Account created. Your profile will finish syncing shortly.', 'info');
      }

      try {
        await sendEmailVerification(cred.user);
        showToast('Verification email sent.', 'success');
      } catch (verificationError) {
        console.warn('Verification email could not be sent:', verificationError);
      }
    } catch (err) {
      const message = formatAuthError(err);
      showToast(message, 'error');
      throw new Error(message);
    }
  };

  const signInWithGoogle = async () => {
    if (!auth) throw new Error('Firebase Auth is not initialized.');
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const profile = profileFromFirebaseUser(result.user);
      setUser(profile);
      setAuthModalOpen(false);
      showToast('Signed in with Google.', 'success');

      try {
        const ref = doc(db, 'users', result.user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) setUser(profileFromFirebaseUser(result.user, snap.data()));
        else await setDoc(ref, sanitizeForFirestore(profile));
      } catch (profileError) {
        console.error('Google profile sync failed; session retained:', profileError);
        showToast('Google sign-in succeeded. Profile sync will retry later.', 'info');
      }
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
    if (!auth) throw new Error('Firebase Auth is not initialized.');
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
    } catch (err) {
      showToast(formatAuthError(err), 'error');
    }
  };

  const updateUserProfileData = async (newName: string, photoURL?: string) => {
    if (!auth?.currentUser || !user) return;
    try {
      await updateProfile(auth.currentUser, { displayName: newName.trim(), ...(photoURL ? { photoURL } : {}) });
      try {
        await updateDoc(doc(db, 'users', user.uid), { displayName: newName.trim(), ...(photoURL ? { photoURL } : {}) });
      } catch (profileError) {
        console.error('Firestore profile update failed:', profileError);
      }
      setUser(prev => prev ? { ...prev, displayName: newName.trim(), ...(photoURL ? { photoURL } : {}) } : null);
      showToast('Profile updated successfully.', 'success');
    } catch (err) {
      showToast(formatAuthError(err), 'error');
    }
  };

  const openAuthModal = (mode: 'login' | 'signup' | 'forgot' = 'login', targetAccount?: 'citizen' | 'authority') => {
    setAuthModalMode(mode);
    if (targetAccount) setAccountType(targetAccount);
    setAuthModalOpen(true);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isFirebaseReady: isFirebaseConfigured,
      accountType,
      setAccountType,
      loginWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      logout,
      resetPassword,
      resendVerificationEmail,
      updateUserProfileData,
      authModalOpen,
      authModalMode,
      openAuthModal,
      closeAuthModal: () => setAuthModalOpen(false),
      toastMessage,
      showToast,
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
