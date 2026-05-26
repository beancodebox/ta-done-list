import { currentUser, isLoading, targetDatetime } from '@/stores/appState'
import { useAuth } from './useAuth'
import { useItems } from './useItems'
import { clearLocalData } from '@/store'

export function useAppInitialization() {
  const { initializeAuth } = useAuth()
  const { calcDatetime, loadItemsFromLocal } = useItems()

  async function init() {
    isLoading.value = true
    await initializeAuth()

    const user = currentUser.value
    if (user?.uid) {
      await loadItemsFromLocal()
    } else {
      await clearLocalData()
    }

    const { hour: _, ...datetime } = calcDatetime(new Date())
    targetDatetime.value = { ...datetime }

    isLoading.value = false
  }
  return {
    init,
  }
}
