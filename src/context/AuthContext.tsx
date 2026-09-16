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
  handleFirestoreError,
  OperationType,
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
  loginAsDemo: (type: 'citizen' | 'authority') => Promise<void>;
  switchRole: (role: 'citizen' | 'municipal_officer') => Promise<void>;
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
  const [loading, setLoading] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [accountType, setAccountType] = useState<'citizen' | 'authority'>('citizen');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((current) => (current?.text === text ? null : current));
    }, 4500);
  };

  // Sync user profile with Firestore document
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            setUser({
              uid: fbUser.uid,
              email: fbUser.email || '',
              displayName: fbUser.displayName || data.displayName || fbUser.email?.split('@')[0] || 'Citizen',
              photoURL: fbUser.photoURL || data.photoURL || undefined,
              role: data.role || 'citizen',
              createdAt: data.createdAt || fbUser.metadata.creationTime || new Date().toISOString(),
              reportsCount: data.reportsCount || 0,
              verifiedRepairsCount: data.verifiedRepairsCount || 0,
              emailVerified: fbUser.emailVerified,
            });
          } else {
            // Initialize new user profile document
            const newProfile: UserProfile = {
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

            await setDoc(userDocRef, sanitizeForFirestore(newProfile));
            setUser(newProfile);
          }
        } catch (error) {
          console.error('Error fetching user profile from Firestore:', error);
          // Fallback to auth object data so user is not locked out
          setUser({
            uid: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Citizen',
            photoURL: fbUser.photoURL || '',
            role: 'citizen',
            createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
            reportsCount: 0,
            verifiedRepairsCount: 0,
            emailVerified: fbUser.emailVerified,
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized');
    }
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
      setAuthModalOpen(false);
      showToast('Logged in successfully.', 'success');
    } catch (err) {
      const formatted = formatAuthError(err);
      showToast(formatted, 'error');
      throw new Error(formatted);
    }
  };

  const signUpWithEmail = async (
    name: string,
    email: string,
    pass: string,
    role: 'citizen' | 'municipal_officer' = 'citizen'
  ) => {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized');
    }
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: name.trim() });
        try {
          await sendEmailVerification(cred.user);
          showToast('Verification email sent! Please check your inbox.', 'info');
        } catch (e) {
          console.warn('Email verification send issue:', e);
        }

        // Initialize Firestore profile document
        const userDocRef = doc(db, 'users', cred.user.uid);
        await setDoc(
          userDocRef,
          sanitizeForFirestore({
            uid: cred.user.uid,
            email: cred.user.email || email.trim(),
            displayName: name.trim(),
            role,
            createdAt: new Date().toISOString(),
            reportsCount: 0,
            verifiedRepairsCount: 0,
          })
        );
      }
      setAuthModalOpen(false);
      showToast(`Account created successfully as ${role === 'municipal_officer' ? 'Municipal Authority' : 'Citizen'}.`, 'success');
    } catch (err) {
      const formatted = formatAuthError(err);
      showToast(formatted, 'error');
      throw new Error(formatted);
    }
  };

  const loginAsDemo = async (type: 'citizen' | 'authority') => {
    setLoading(true);
    try {
      if (type === 'authority') {
        const demoAuthority: UserProfile = {
          uid: 'auth-officer-demo-01',
          email: 'rajesh.kadam.engineer@roadsetu.gov',
          displayName: 'Rajesh Kadam (Exec Engineer)',
          role: 'municipal_officer',
          createdAt: '2025-08-15T09:00:00.000Z',
          reportsCount: 0,
          verifiedRepairsCount: 42,
          emailVerified: true,
        };
        setUser(demoAuthority);
        showToast('Logged in as Municipal Authority (Executive Engineer).', 'success');
      } else {
        const demoCitizen: UserProfile = {
          uid: 'citizen-demo-01',
          email: 'priya.sharma.citizen@roadsetu.gov',
          displayName: 'Priya Sharma (Citizen)',
          role: 'citizen',
          createdAt: '2025-10-10T14:30:00.000Z',
          reportsCount: 5,
          verifiedRepairsCount: 3,
          emailVerified: true,
        };
        setUser(demoCitizen);
        showToast('Logged in as Verified Citizen.', 'success');
      }
      setAuthModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const switchRole = async (newRole: 'citizen' | 'municipal_officer') => {
    if (!user) return;
    try {
      if (isFirebaseConfigured && db && user.uid && !user.uid.includes('demo')) {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { role: newRole });
      }
      setUser((prev) => (prev ? { ...prev, role: newRole } : null));
      showToast(
        `Switched persona to ${newRole === 'municipal_officer' ? 'Municipal Authority Hub' : 'Citizen Portal'}.`,
        'info'
      );
    } catch (e) {
      console.warn('Role switch error:', e);
      setUser((prev) => (prev ? { ...prev, role: newRole } : null));
    }
  };

  const signInWithGoogle = async () => {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized');
    }
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      if (res.user) {
        const userDocRef = doc(db, 'users', res.user.uid);
        const userSnap = await getDoc(userDocRef);
        if (!userSnap.exists()) {
          await setDoc(
            userDocRef,
            sanitizeForFirestore({
              uid: res.user.uid,
              email: res.user.email || '',
              displayName: res.user.displayName || 'Citizen',
              photoURL: res.user.photoURL || '',
              role: 'citizen',
              createdAt: new Date().toISOString(),
              reportsCount: 0,
              verifiedRepairsCount: 0,
            })
          );
        }
      }
      setAuthModalOpen(false);
      showToast('Signed in with Google.', 'success');
    } catch (err) {
      const formatted = formatAuthError(err);
      showToast(formatted, 'error');
      throw new Error(formatted);
    }
  };

  const logout = async () => {
    try {
      if (auth) {
        await firebaseSignOut(auth);
      }
      setUser(null);
      showToast('Signed out of session.', 'info');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const resetPassword = async (email: string) => {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized');
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      showToast(`Password reset link sent to ${email.trim()}`, 'success');
      setAuthModalOpen(false);
    } catch (err) {
      const formatted = formatAuthError(err);
      showToast(formatted, 'error');
      throw new Error(formatted);
    }
  };

  const resendVerificationEmail = async () => {
    if (auth?.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        showToast('Verification email resent! Check your inbox.', 'success');
      } catch (err) {
        showToast('Failed to resend verification email. Try again later.', 'error');
      }
    }
  };

  const updateUserProfileData = async (newName: string, photoURL?: string) => {
    if (!auth?.currentUser || !user) return;
    try {
      await updateProfile(auth.currentUser, {
        displayName: newName.trim(),
        ...(photoURL ? { photoURL } : {}),
      });

      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        displayName: newName.trim(),
        ...(photoURL ? { photoURL } : {}),
      });

      setUser((prev) => (prev ? { ...prev, displayName: newName.trim(), photoURL } : null));
      showToast('Profile updated successfully.', 'success');
    } catch (err) {
      showToast('Failed to update profile.', 'error');
    }
  };

  const openAuthModal = (
    mode: 'login' | 'signup' | 'forgot' = 'login',
    targetAccount?: 'citizen' | 'authority'
  ) => {
    setAuthModalMode(mode);
    if (targetAccount) {
      setAccountType(targetAccount);
    }
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isFirebaseReady: isFirebaseConfigured,
        accountType,
        setAccountType,
        loginWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        loginAsDemo,
        switchRole,
        logout,
        resetPassword,
        resendVerificationEmail,
        updateUserProfileData,
        authModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
