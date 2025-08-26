// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDx1G0xUjHVdI_iqB9SNu4aqJghO5cDnJo",
  authDomain: "my-log-in-app-2-d26b2.firebaseapp.com",
  projectId: "my-log-in-app-2-d26b2",
  storageBucket: "my-log-in-app-2-d26b2.firebasestorage.app",
  messagingSenderId: "247951818624",
  appId: "1:247951818624:web:b6631bab55342ae2f94b65"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
