// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDH3GLwOUB8w23_Gl28gMAacLrxCKy3icY",
  authDomain: "cinescope-8b3b5.firebaseapp.com",
  projectId: "cinescope-8b3b5",
  storageBucket: "cinescope-8b3b5.firebasestorage.app",
  messagingSenderId: "451241172600",
  appId: "1:451241172600:web:78ab6e3f980e8760c6178d",
  measurementId: "G-MGWWZW4XZN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);