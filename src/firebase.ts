// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyDEyS-NBMqJ6Qvc88yVgIzckJHDU0O3xzI',
  authDomain: 'ta-done-list.firebaseapp.com',
  projectId: 'ta-done-list',
  storageBucket: 'ta-done-list.firebasestorage.app',
  messagingSenderId: '188514924278',
  appId: '1:188514924278:web:b7ae5247c174f19c815ed7',
  measurementId: 'G-VVELCT9JMP',
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)
export const analytics = getAnalytics(app)
export const auth = getAuth()
export const db = getFirestore()
export type { User } from 'firebase/auth'
