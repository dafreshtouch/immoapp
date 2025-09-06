// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBYLNXt1aQ9rBVRrwWqC6Y1_a5Uk5_lvu4",
  authDomain: "immo-app-48914.firebaseapp.com",
  projectId: "immo-app-48914",
  storageBucket: "immo-app-48914.firebasestorage.app",
  messagingSenderId: "381813991112",
  appId: "1:381813991112:web:6592641fc9465d0444e7fd",
  measurementId: "G-JP3FHRYCPJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;
