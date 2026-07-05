import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth } from "./config";

const PHONE_EMAIL_DOMAIN = "t.e-travel.cm";

export function phoneToEmail(phone: string): string {
  const clean = phone.replace(/[^0-9]/g, "");
  return `${clean}@${PHONE_EMAIL_DOMAIN}`;
}

export async function signInWithPhone(phone: string, password: string) {
  if (!auth) throw new Error("Firebase non configuré");
  const email = phoneToEmail(phone);
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signUpWithPhone(phone: string, password: string) {
  if (!auth) throw new Error("Firebase non configuré");
  const email = phoneToEmail(phone);
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function signInAsAgency(email: string, password: string) {
  if (!auth) throw new Error("Firebase non configuré");
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signOut() {
  if (!auth) return;
  return firebaseSignOut(auth);
}

export function onAuthChange(cb: (user: User | null) => void) {
  if (!auth) {
    cb(null);
    return () => {};
  }
  return onAuthStateChanged(auth, cb);
}

export function getCurrentUser(): User | null {
  if (!auth) return null;
  return auth.currentUser;
}
