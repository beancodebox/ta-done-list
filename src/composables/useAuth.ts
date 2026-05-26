import {
  signIn,
  signOut,
  signUp,
  waitForInitialAuth,
  getCurrentUser,
} from '@/services/auth'
import {
  loginEmail,
  loginPassword,
  currentUser,
  isSignUpWorking,
  isSignInWorking,
  isSignOutWorking,
  importParseResult,
  importText,
  isImportModalShowing,
  isRightSidebarOpened,
  itemList,
  modifyingList,
} from '@/stores/appState'
import { clearLocalData } from '@/store'

export function useAuth() {
  const onSignUp = async () => {
    try {
      isSignUpWorking.value = true
      await signUp(loginEmail.value, loginPassword.value)
      const user = getCurrentUser()
      if (user?.email && user?.uid) {
        currentUser.value = { email: user.email, uid: user.uid }
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
      itemList.value = []
      modifyingList.value = []
      isRightSidebarOpened.value = false
      isImportModalShowing.value = false
      importText.value = ''
      importParseResult.value = null
      loginEmail.value = ''
      loginPassword.value = ''
      await clearLocalData()
    } finally {
      isSignOutWorking.value = false
    }
  }

  const initializeAuth = async () => {
    await waitForInitialAuth()
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
