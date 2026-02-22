import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';

export async function adminLogin(email, password) {
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function adminLogout() {
  return await signOut(auth);
}

export function listenAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}