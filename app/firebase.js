import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Aapke Pathanyx store ki Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAhMbPPDuRS7xIFw7TNyDColfykWeUdQtQ",
  authDomain: "pathanyx.firebaseapp.com",
  projectId: "pathanyx",
  storageBucket: "pathanyx.firebasestorage.app",
  messagingSenderId: "414575804707",
  appId: "1:414575804707:web:09d34fa0e7c09327158c96",
  measurementId: "G-8CCTZZ2VRW"
};

// Initialize Firebase and Database
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);