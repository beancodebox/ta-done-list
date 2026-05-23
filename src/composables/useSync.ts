import { ref, type Ref } from 'vue'
import { getLocalUpdatedAt, setLocalUpdatedAt, type TaDoneItem } from '../store'
import { syncWithCloud } from '../services/firestore'

export function useSync(
  itemList: Ref<TaDoneItem[]>,
  currentUser: Ref<{ email: string; uid: string } | null>,
) {
  const isSynching = ref(false)
  const onSync = async () => {
    try {
      isSynching.value = true
      if (currentUser.value) {
        const localTime = getLocalUpdatedAt()
        const result = await syncWithCloud(currentUser.value.uid, itemList.value, localTime)
        itemList.value = result.items
        if (result.isCloudNewer) {
          // Items already updated
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
