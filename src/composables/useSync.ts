import { getLocalUpdatedAt, setItemToLocal, setLocalUpdatedAt } from '@/store'
import { syncWithCloud } from '@/services/firestore'
import { currentUser, isSynching, itemList } from '@/stores/appState'

export function useSync() {
  const onSync = async () => {
    try {
      isSynching.value = true
      if (currentUser.value) {
        const localTime = getLocalUpdatedAt()
        const result = await syncWithCloud(currentUser.value.uid, itemList.value, localTime)
        itemList.value = result.items
        if (result.isCloudNewer) {
          // Items already updated
          setItemToLocal({ itemList: itemList.value })
        }
        setLocalUpdatedAt(result.timestamp)
      }
    } finally {
      isSynching.value = false
    }
  }

  return {
    isSynching,
    onSync,
  }
}
