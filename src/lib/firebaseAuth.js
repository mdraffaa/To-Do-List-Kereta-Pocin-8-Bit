"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";

export function isFirebaseAuthConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
}

function getClientAuth() {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  return getAuth(app);
}

export function subscribeAuth(callback) {
  if (!isFirebaseAuthConfigured()) {
    const timer = setTimeout(() => callback(null), 0);
    return () => clearTimeout(timer);
  }
  const auth = getClientAuth();
  return onAuthStateChanged(auth, callback);
}

export async function loginWithGoogle() {
  const auth = getClientAuth();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return signInWithPopup(auth, provider);
}

export async function logoutGoogle() {
  if (!isFirebaseAuthConfigured()) return;
  const auth = getClientAuth();
  await signOut(auth);
}

export async function getIdToken() {
  if (!isFirebaseAuthConfigured()) return null;
  const auth = getClientAuth();
  if (!auth.currentUser) return null;
  return auth.currentUser.getIdToken();
}
