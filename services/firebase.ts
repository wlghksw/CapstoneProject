// services/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Firebase 콘솔에서 발급받은 자신의 설정 값으로 교체해주세요.
const firebaseConfig = {
  apiKey: "AIzaSyCVm1TWBovxnhKWwdNUH_skGOvKmiUFSfw",
  authDomain: "kapstone-a43ed.firebaseapp.com",
  databaseURL: "https://kapstone-a43ed-default-rtdb.firebaseio.com",
  projectId: "kapstone-a43ed",
  storageBucket: "kapstone-a43ed.firebasestorage.app",
  messagingSenderId: "785088170151",
  appId: "1:785088170151:web:3803979b396e6b47637382",
  measurementId: "G-C66MB3VTH5"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Firestore 및 Auth 서비스 내보내기
export const db = getFirestore(app);
export const auth = getAuth(app);

