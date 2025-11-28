import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB4h1742WC4Hgsf8LhTOZ4ecExUAlaIOZ8",
  authDomain: "hr-assistant-7f741.firebaseapp.com",
  projectId: "hr-assistant-7f741",
  storageBucket: "hr-assistant-7f741.firebasestorage.app",
  messagingSenderId: "1023780466276",
  appId: "1:1023780466276:web:22db99f2eb4d9e25c17971",
  measurementId: "G-FLQ2CMVTZC"
};

const app = initializeApp(firebaseConfig);
// Analytics usually only works in browser environments with cookies enabled
let analytics;
if (typeof window !== 'undefined') {
    try {
        analytics = getAnalytics(app);
    } catch (e) {
        console.warn("Firebase Analytics failed to initialize", e);
    }
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;