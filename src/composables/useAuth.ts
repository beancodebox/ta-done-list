import { ref } from 'vue'
import {
  currentUser as authCurrentUser,
  signIn,
  signOut,
  signUp,
  waitForInitialAuth,
  getCurrentUser,
} from '../services/auth'

export function useAuth() {
  const loginEmail = ref('')
  const loginPassword = ref('')
  const currentUser = ref<{
    email: string
    uid: string
    timeZone?: string
    locale?: string
  } | null>(null)
  const isSignUpWorking = ref(false)
  const isSignInWorking = ref(false)
  const isSignOutWorking = ref(false)

  const onSignUp = async () => {
    try {
      isSignUpWorking.value = true
      await signUp(loginEmail.value, loginPassword.value)
      const user = getCurrentUser()
      if (user?.email && user?.uid) {
        currentUser.value = { email: user.email, uid: user.uid }
        authCurrentUser.value = user
      }
    } finally {
      isSignUpWorking.value = false
    }
  }

  const onSignIn = async () => {
    try {
      isSignInWorking.value = true
      await signIn(loginEmail.value, loginPassword.value)
      const user = getCurrentUser()
      if (user?.email && user?.uid) {
        currentUser.value = { email: user.email, uid: user.uid }
        authCurrentUser.value = user
      }
    } finally {
      isSignInWorking.value = false
    }
  }

  const onSignOut = async () => {
    try {
      isSignOutWorking.value = true
      await signOut()
      currentUser.value = null
      authCurrentUser.value = null
      loginEmail.value = ''
      loginPassword.value = ''
    } finally {
      isSignOutWorking.value = false
    }
  }

  const initializeAuth = async () => {
    await waitForInitialAuth()
    const user = authCurrentUser.value
    if (user?.email && user?.uid) {
      currentUser.value = {
        email: user.email,
        uid: user.uid,
      }
    }
  }

  return {
    currentUser,
    loginEmail,
    loginPassword,
    isSignUpWorking,
    isSignInWorking,
    isSignOutWorking,
    onSignUp,
    onSignIn,
    onSignOut,
    initializeAuth,
  }
}
