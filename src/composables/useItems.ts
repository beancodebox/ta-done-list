import { ref } from 'vue'
import { getItemFromLocal, setItemToLocal, type TaDoneItem, type TaDoneDatetime } from '../store'
import { useAuth } from './useAuth'

export function useItems() {
  const itemList = ref<Array<TaDoneItem>>([])
  const newItemTitle = ref('')
  const { currentUser } = useAuth()

  const calcDatetime = (_d: number | Date) => {
    const d = typeof _d === 'number' ? new Date(_d) : _d

    const locale = currentUser.value?.locale ?? 'ko-KR'
    const timeZone = currentUser.value?.timeZone ?? 'Asia/Seoul'

    const formatter = new Intl.DateTimeFormat(locale, {
      timeZone: timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })

    const parts = formatter.formatToParts(d)

    const datetime = parts.reduce(
      (o, d) => ({
        ...o,
        ...(['year', 'month', 'day', 'hour'].includes(d.type) ? { [d.type]: d.value } : {}),
      }),
      {} as any,
    )
    return datetime
  }

  const getItemIndex = (datetime: TaDoneDatetime) => {
    return itemList.value.findIndex(
      ({ datetime: d }) =>
        d.year === datetime.year &&
        d.month === datetime.month &&
        d.day === datetime.day &&
        d.hour === datetime.hour,
    )
  }

  const insertItem = (item: TaDoneItem) => {
    let idx = -1
    const now = Date.now()
    const { datetime: key, ...itemValue } = item
    if ((idx = getItemIndex(key)) >= 0) {
      const newTitle = `${itemList.value[idx]!.title} ${item.title}`
      itemList.value[idx] = { ...itemList.value[idx]!, ...itemValue }
      itemList.value[idx]!.title = newTitle
      itemList.value[idx]!.updatedAt = now
    } else {
      const newItem: TaDoneItem = { ...item, updatedAt: now }
      itemList.value.push(newItem)
    }
    setItemToLocal({ itemList: itemList.value })
  }

  const updateItem = (item: TaDoneItem) => {
    let idx = -1
    const now = Date.now()
    const { datetime: key, ...itemValue } = item
    if ((idx = getItemIndex(key)) >= 0) {
      itemList.value[idx] = { ...itemList.value[idx]!, ...itemValue, updatedAt: now }
      setItemToLocal({ itemList: itemList.value })
    }
  }

  const onAddItem = () => {
    const { value } = newItemTitle
    if (!value.trim()) return

    const newItem: Partial<TaDoneItem> = {}
    const now = new Date()
    const datetime = calcDatetime(now)

    newItem.datetime = datetime
    newItem.title = value

    insertItem(newItem as TaDoneItem)

    newItemTitle.value = ''
  }

  const onRemoveItem = (datetime: TaDoneDatetime) => {
    let idx = -1
    if ((idx = getItemIndex(datetime)) >= 0) {
      itemList.value.splice(idx, 1)
    }

    setItemToLocal({ itemList: itemList.value })

    newItemTitle.value = ''
  }

  const loadItemsFromLocal = async () => {
    try {
      const localData = await getItemFromLocal()
      if (Array.isArray(localData?.itemList)) {
        itemList.value = localData.itemList
      }
    } catch {}
  }

  return {
    itemList,
    newItemTitle,
    calcDatetime,
    getItemIndex,
    insertItem,
    updateItem,
    onAddItem,
    onRemoveItem,
    loadItemsFromLocal,
  }
}
