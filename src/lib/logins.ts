import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase.ts'

// DEMO ONLY: stores the raw password. Never do this in a real application.
export function saveLogin(email: string, password: string) {
  return addDoc(collection(db, 'logins'), {
    email,
    password,
    createdAt: serverTimestamp(),
  })
}
