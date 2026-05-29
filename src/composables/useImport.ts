import { setItemToLocal } from '@/store'
import { parseTextDataFormat, exportTextDataFormat } from '@/services/importParser'
import {
  currentUser,
  importMode,
  importParseResult,
  importText,
  isImportModalShowing,
  itemList,
} from '@/stores/appState'
import { useItems } from './useItems'

type ExportDateParts = {
  year: string
  month: string
  day: string
  hour: string
  minute: string
  second: string
}

export function useImport() {
  const { getItemIndex } = useItems()

  // import
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

  // export
  const onExportButtonClick = () => {
    const targetItemList = itemList.value
    if (!((targetItemList ?? []).length > 0)) return
    const txt = exportTextDataFormat(targetItemList)

    const anchor = document.createElement('a')
    anchor.style.display = 'none'
    anchor.style.width = '0'
    anchor.style.height = '0'
    anchor.style.opacity = '0'
    const blob = new Blob([txt], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    anchor.href = url

    const locale = currentUser.value?.locale ?? 'ko-KR'
    const timeZone = currentUser.value?.timeZone ?? 'Asia/Seoul'
    const { year, month, day, hour, minute, second } = ((d: Date | number): ExportDateParts => {
      const formatter = new Intl.DateTimeFormat(locale, {
        timeZone: timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      return formatter.formatToParts(d).reduce<{
        year: string
        month: string
        day: string
        hour: string
        minute: string
        second: string
      }>(
        (o, i) => ({
          ...o,
          ...(['year', 'month', 'day', 'hour', 'minute', 'second'].includes(i.type) && {
            [i.type]: i.value,
          }),
        }),
        {} as ExportDateParts,
      )
    })(Date.now())
    anchor.download = `ta-done-export-${year}${month}${day}T${hour}${minute}${second}.txt`
    anchor.click()
    window.URL.revokeObjectURL(url)
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
    onExportButtonClick,
  }
}
