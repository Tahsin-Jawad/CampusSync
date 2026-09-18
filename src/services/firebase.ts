import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAa4GP7om-Rek0Kgw2nJ-laJTgdYRS0utI",
  authDomain: "campussync-5781d.firebaseapp.com",
  projectId: "campussync-5781d",
  storageBucket: "campussync-5781d.firebasestorage.app",
  messagingSenderId: "994139740571",
  appId: "1:994139740571:web:4380ca7972891cf6e3a93e"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Export Auth & Database Instances
export const auth = getAuth(app);
export const db = getFirestore(app);
