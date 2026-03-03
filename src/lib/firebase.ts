// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDrpXFvlF1fX2uzDOFxV0_N3hyAjOy_5Tc",
  authDomain: "school-management-portal-adfa2.firebaseapp.com",
  projectId: "school-management-portal-adfa2",
  storageBucket: "school-management-portal-adfa2.firebasestorage.app",
  messagingSenderId: "885531399267",
  appId: "1:885531399267:web:7dbd51d10f1135a7725456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
