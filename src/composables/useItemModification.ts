import { modifyingList } from '@/stores/appState'
import { type TaDoneItem, type TaDoneDatetime } from '@/store'
import { useItems } from './useItems'

export type TaDoneModifyingItem = Partial<TaDoneItem> & Pick<TaDoneItem, 'datetime'>

export function useItemModification() {
  const { updateItem } = useItems()

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

  const _toggleModifyingList = (datetimeData?: TaDoneModifyingItem, doUpdate = true) => {
    if (!datetimeData) return
    let idx = -1
    const datetime = datetimeData.datetime
    if ((idx = getModifyingIndex(datetime)) >= 0) {
      if (doUpdate) {
        const now = Date.now()
        updateItem({ datetime, title: datetimeData.title ?? '', updatedAt: now } as TaDoneItem)
      }
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
  const startModifyingItem = (datetimeData?: TaDoneModifyingItem) => {
    _toggleModifyingList(datetimeData)
  }
  const cancelModifyingItem = (datetimeData?: TaDoneModifyingItem) => {
    _toggleModifyingList(datetimeData, false)
  }
  const confirmModifyingItem = (datetimeData?: TaDoneModifyingItem) => {
    _toggleModifyingList(datetimeData, true)
  }

  return {
    modifyingList,
    clearModifyingList,
    isModifying,
    getModifyingItem,
    startModifyingItem,
    cancelModifyingItem,
    confirmModifyingItem,
  }
}
