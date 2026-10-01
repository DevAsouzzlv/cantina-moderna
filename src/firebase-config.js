import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, updateDoc, onSnapshot, doc, serverTimestamp, getDocs } from 'firebase/firestore';

// Insira as chaves do seu projeto Firebase aqui
const firebaseConfig = {
  // Exemplo:
  // apiKey: "AIzaSyDOCAbC123...",
  // authDomain: "cantina-app.firebaseapp.com",
  // projectId: "cantina-app",
  // storageBucket: "cantina-app.appspot.com",
  // messagingSenderId: "123456789",
  // appId: "1:123456789:web:abcdef"
};

let app, auth, db;
let isFirebaseInitialized = false;

try {
  if (Object.keys(firebaseConfig).length > 0) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    isFirebaseInitialized = true;
  }
} catch (e) {
  console.error("Erro ao inicializar o Firebase:", e);
}

const appId = 'cantina-mvp-app';

export {
  app, auth, db, isFirebaseInitialized, appId,
  signInWithEmailAndPassword, onAuthStateChanged, signOut,
  collection, addDoc, updateDoc, onSnapshot, doc, serverTimestamp, getDocs
};
