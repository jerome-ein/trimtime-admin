import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDJZH5M_MvAdBeqNJqY4hA6nW81rPrhBDs",
  authDomain: "projecttrimtime2026.firebaseapp.com",
  projectId: "projecttrimtime2026",
  storageBucket: "projecttrimtime2026.firebasestorage.app",
  messagingSenderId: "982683137557",
  appId: "1:982683137557:web:40840294b50ea29de8401c",
  measurementId: "G-VYLD25JMZP"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;