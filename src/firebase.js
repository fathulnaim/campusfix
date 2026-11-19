// =========================================================================
// 1. PLACEHOLDER CONFIGURATION CONSTANTS
// Configure your Cloudinary & Firebase credentials below.
// =========================================================================
export const CLOUDINARY_CLOUD_NAME = "czsm7je3";
export const CLOUDINARY_UPLOAD_PRESET = "campusfix_preset";

export const firebaseConfig = {
  apiKey: "AIzaSyCiGZfWJjrtis7274Yf2rfw-jOSdLQ-qC8",
  authDomain: "campusfix-f711a.firebaseapp.com",
  projectId: "campusfix-f711a",
  storageBucket: "campusfix-f711a.firebasestorage.app",
  messagingSenderId: "590266058923",
  appId: "1:590266058923:web:5346ec61f50161dd298fee"
};

// Designated Maintenance Administrator email (per requirement #1)
export const ADMIN_EMAIL = "admin@campus.edu";

// =========================================================================
// 2. FIREBASE SERVICES INITIALIZATION
// =========================================================================
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
