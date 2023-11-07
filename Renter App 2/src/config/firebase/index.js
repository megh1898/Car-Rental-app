// Import the functions
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";



// web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyClaN-DOdXDr62rgdhSsLtyHIOEAQLqdMk",
  authDomain: "session-1-37e3b.firebaseapp.com",
  projectId: "session-1-37e3b",
  storageBucket: "session-1-37e3b.appspot.com",
  messagingSenderId: "547263448590",
  appId: "1:547263448590:web:a7bfa3633187271b179e5f",
  measurementId: "G-942JEMZB2J",
};

// initialize firebase
initializeApp(firebaseConfig);

// initialize auth
const auth = getAuth();
const db = getFirestore();
const storage = getStorage();
export { auth, db, storage };
