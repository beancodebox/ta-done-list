import { ref } from 'vue'
import { type TaDoneItem, type TaDoneDatetime } from '../store'

export type TaDoneModifyingItem = Partial<TaDoneItem> & Pick<TaDoneItem, 'datetime'>

export function useItemModification(updateItem: (item: TaDoneItem) => void) {
  const modifyingList = ref<Array<TaDoneModifyingItem>>([])

  const clearModifyingList = () => {
    modifyingList.value = []
  }

  const getModifyingIndex = (datetime: TaDoneDatetime) => {
    return modifyingList.value.findIndex(
      ({ datetime: d }) =>
        d.year === datetime.year &&
        d.month === datetime.month &&
        d.day === datetime.day &&
        d.hour === datetime.hour,
    )
  }

  const toggleModifyingList = (datetimeData: TaDoneModifyingItem, doUpdate = true) => {
    let idx = -1
    const now = Date.now()
    const datetime = datetimeData.datetime
    if ((idx = getModifyingIndex(datetime)) >= 0) {
      if (doUpdate)
        updateItem({ datetime, title: datetimeData.title ?? '', updatedAt: now } as TaDoneItem)

      modifyingList.value.splice(idx, 1)
    } else {
      modifyingList.value.push({ datetime, title: datetimeData.title })
    }
  }

  const isModifying = (datetime: TaDoneDatetime) => {
    return getModifyingIndex(datetime) >= 0
  }

  const getModifyingItem = (datetimeData: TaDoneModifyingItem) => {
    let idx = -1
    const datetime = datetimeData.datetime
    if ((idx = getModifyingIndex(datetime)) >= 0) {
      return modifyingList.value[idx]!
    }
  }

  return {
    modifyingList,
    clearModifyingList,
    toggleModifyingList,
    isModifying,
    getModifyingItem,
  }
}
