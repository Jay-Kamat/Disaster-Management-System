// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};
let app = null;
let analytics = null;
let auth = null;
let googleProvider = null;
let db = null;
let firebaseInitError = null;

if (!firebaseConfig.apiKey) {
  firebaseInitError = "Firebase API Key is missing. Please configure VITE_FIREBASE_API_KEY and other Firebase variables in your Vercel environment settings.";
  console.warn(firebaseInitError);
} else {
  try {
    app = initializeApp(firebaseConfig);
    try {
      analytics = getAnalytics(app);
    } catch (e) {
      console.warn("Firebase Analytics could not be initialized:", e.message);
    }
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    db = getFirestore(app);
  } catch (error) {
    firebaseInitError = error.message || "Failed to initialize Firebase services.";
    console.error("Firebase Initialization Error:", error);
  }
}

export { app, analytics, auth, googleProvider, db, firebaseInitError };