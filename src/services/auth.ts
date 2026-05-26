// import { Auth, User } from 'firebase/auth'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as signOutUser,
} from 'firebase/auth'
import { type TaDoneUser } from '@/store'
import { auth, type User } from '@/firebase'
import { saveItemsToCloud } from './firestore'
import { currentUser } from '@/stores/appState'

// export const currentUser = ref<User | null>(null)
// export const authReady = ref(false)

async function initTaDoneUser(user: User) {
  const now = Date.now()
  const tdUser = {
    itemList: [],
    timestamp: now,
    lastSynced: now,
  } as TaDoneUser
  await saveItemsToCloud(user.uid, tdUser)
}

export async function signUp(email: string, password: string): Promise<User> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    // Signed up
    const user = userCredential.user
    await initTaDoneUser(user)
    return user
  } catch (e: any) {
    const error = e as any
    const errorCode = error.code
    const errorMessage = error.message
    console.error(errorCode, errorMessage, error)
    throw error
  }
}

export async function signIn(email: string, password: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    // Signed up
    const user = userCredential.user
    return user
  } catch (e: any) {
    const error = e as any
    const errorCode = error.code
    const errorMessage = error.message
    console.error(errorCode, errorMessage, error)
    throw error
  }
}
export async function signOut(): Promise<void> {
  try {
    await signOutUser(auth)
  } catch (e: any) {
    const error = e as any
    const errorCode = error.code
    const errorMessage = error.message
    console.error(errorCode, errorMessage, error)
    throw error
  }
}
export function getCurrentUser(): User | null {
  return auth.currentUser
}

export function waitForInitialAuth() {
  return new Promise<{
    email: string
    uid: string
    timeZone?: string
    locale?: string
  } | null>((resolve, _reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      unsubscribe()
      const appUser = user == null ? user : { email: user.email ?? '', uid: user.uid }
      resolve(appUser)
    })
  }).then((user) => {
    currentUser.value = user
  })
}

// export function useAuth() {
//   return {
//     auth,
//     user: readonly(currentUser),
//     // authReady: readonly(authReady),
//   }
// }
