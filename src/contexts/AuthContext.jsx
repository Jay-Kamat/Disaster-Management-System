import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider, db } from '../services/firebase';
import { onAuthStateChanged, signInWithPopup, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          let role = 'user';
          let userData = {};

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            role = data.role || 'user';
            userData = data;

            // Force upgrade role to admin for specified email if it is currently 'user'
            if (user.email === 'harshvardhankamat3708@gmail.com' && role !== 'admin') {
              role = 'admin';
              userData.role = 'admin';
              await setDoc(userDocRef, { role: 'admin' }, { merge: true });
            }
          } else {
            // New user: determine default role based on email pattern
            const isAdmin = user.email && (
              user.email.includes('admin') || 
              user.email === 'you@gmail.com' ||
              user.email === 'harshvardhankamat3708@gmail.com'
            );
            role = isAdmin ? 'admin' : 'user';
            
            userData = {
              uid: user.uid,
              email: user.email,
              role: role,
              displayName: user.displayName || '',
              photoURL: user.photoURL || '',
              phone: '',
              city: '',
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, userData);
          }

          setCurrentUser({
            ...user,
            ...userData,
            role: role
          });
        } catch (error) {
          console.error("Error setting/getting user role from Firestore:", error);
          // Fallback to local email verification so user is not blocked
          const isAdmin = user.email && (
            user.email.includes('admin') || 
            user.email === 'you@gmail.com' ||
            user.email === 'harshvardhankamat3708@gmail.com'
          );
          setCurrentUser({
            ...user,
            role: isAdmin ? 'admin' : 'user'
          });
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithGoogle = () => {
    return signInWithPopup(auth, googleProvider);
  };

  const loginWithEmail = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signupWithEmail = async (email, password, profileData) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create the Firestore user profile document immediately
    const userDocRef = doc(db, 'users', user.uid);
    const isAdmin = user.email && (
      user.email.includes('admin') || 
      user.email === 'you@gmail.com' ||
      user.email === 'harshvardhankamat3708@gmail.com'
    );
    const role = isAdmin ? 'admin' : 'user';

    const userData = {
      uid: user.uid,
      email: user.email,
      role: role,
      displayName: profileData.displayName || '',
      phone: profileData.phone || '',
      age: Number(profileData.age) || '',
      photoURL: profileData.photoURL || '',
      city: profileData.city || '',
      createdAt: new Date().toISOString()
    };
    
    await setDoc(userDocRef, userData);
    
    setCurrentUser({
      ...user,
      ...userData,
      role: role
    });
    
    return userCredential;
  };

  const logout = () => {
    return signOut(auth);
  };

  const updateUserProfile = async (newData) => {
    if (!currentUser) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    await setDoc(userDocRef, newData, { merge: true });
    setCurrentUser(prev => ({
      ...prev,
      ...newData
    }));
  };

  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const value = {
    currentUser,
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    logout,
    updateUserProfile,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
