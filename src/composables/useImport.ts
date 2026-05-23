import { ref, type Ref } from 'vue'
import { setItemToLocal, type TaDoneItem } from '../store'
import { parseTextDataFormat, type ParseResult } from '../services/importParser'

type ImportMode = 'keep' | 'overwrite'

export function useImport(itemList: Ref<TaDoneItem[]>, getItemIndex: (datetime: any) => number) {
  const showImportModal = ref(false)
  const importMode = ref<ImportMode>('keep')
  const importText = ref('')
  const importParseResult = ref<ParseResult | null>(null)

  const onImportButtonClick = () => {
    showImportModal.value = true
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

    importParseResult.value.items.forEach(item => {
      const idx = getItemIndex(item.datetime)
      if (idx < 0) {
        itemList.value.push(item)
      } else if (importMode.value === 'overwrite') {
        itemList.value[idx] = item
      }
    })

    setItemToLocal({ itemList: itemList.value })
    showImportModal.value = false
    importText.value = ''
    importParseResult.value = null
  }

  const closeImportModal = () => {
    showImportModal.value = false
    importText.value = ''
    importParseResult.value = null
  }

  return {
    showImportModal,
    importMode,
    importText,
    importParseResult,
    onImportButtonClick,
    onImportPreview,
    onImportConfirm,
    closeImportModal,
  }
}
