import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration.
// IMPORTANT: In a production application, you should use environment variables
// to store this sensitive information, rather than committing it to your code.
const firebaseConfig = {
  apiKey: 'AIzaSyD3hlsym5hOkoBaNc82g3Oo2nZymfW21To',
  authDomain: 'nilrust-mvp.firebaseapp.com',
  projectId: 'nilrust-mvp',
  storageBucket: 'nilrust-mvp.appspot.com',
  messagingSenderId: '791976261334',
  appId: '1:791976261334:web:fb87e16c36e837c7563b77',
  measurementId: 'G-TKLLLKQ0FQ',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services for use throughout the app
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
