import { initializeApp } from "firebase/app";
// firestore를 불러오는 모듈을 임포트
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyD9hcB-n69ttpyfbqzMGAk3m6lFOXKaKB0",
  authDomain: "iot-c449e.firebaseapp.com",
  projectId: "iot-c449e",
  storageBucket: "iot-c449e.appspot.com",
  messagingSenderId: "779456775929",
  appId: "1:779456775929:web:77234014956c2ca4c40428",
  measurementId: "G-VFF34BHHW9"
};

const app = initializeApp(firebaseConfig);
// firestore 객체 생성
const db = getFirestore(app);
// firestore export
export {db}