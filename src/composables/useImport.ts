import { setItemToLocal } from '@/store'
import { parseTextDataFormat } from '@/services/importParser'
import {
  importMode,
  importParseResult,
  importText,
  isImportModalShowing,
  itemList,
} from '@/stores/appState'
import { useItems } from './useItems'

export function useImport() {
  // itemList: Ref<TaDoneItem[]>,
  // getItemIndex: (datetime: any) => number
  const { getItemIndex } = useItems()
  const onImportButtonClick = () => {
    isImportModalShowing.value = true
    importText.value = ''
    importParseResult.value = null
  }

  const onImportPreview = () => {
    if (!importText.value.trim()) {
      importParseResult.value = null
      return
    }
    importParseResult.value = parseTextDataFormat(importText.value)
  }

  const onImportConfirm = () => {
    if (!importParseResult.value || importParseResult.value.items.length === 0) return

    importParseResult.value.items.forEach((item) => {
      const idx = getItemIndex(item.datetime)
      if (idx < 0) {
        itemList.value!.push(item)
      } else if (importMode.value === 'overwrite') {
        itemList.value![idx] = item
      }
    })

    setItemToLocal({ itemList: itemList.value! })
    isImportModalShowing.value = false
    importText.value = ''
    importParseResult.value = null
  }

  const closeImportModal = () => {
    isImportModalShowing.value = false
    importText.value = ''
    importParseResult.value = null
  }

  return {
    isImportModalShowing,
    importMode,
    importText,
    importParseResult,
    onImportButtonClick,
    onImportPreview,
    onImportConfirm,
    closeImportModal,
  }
}
