// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyByT2n-OdazikjjUPGp2Kf4d0W8KLRBqm4",
  authDomain: "officialtechlab-83.firebaseapp.com",
  projectId: "officialtechlab-83",
  storageBucket: "officialtechlab-83.firebasestorage.app",
  messagingSenderId: "789830493750",
  appId: "1:789830493750:web:1f157f39a86c276b00da97"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);