<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef, type Ref } from 'vue'

type TDJson = {
  timestamp: number,
  itemList: Array<TDItem>
}
type TDDatetime = {
  year: string
  month: string
  day: string
  hour: string
}
type TDDate = Pick<TDDatetime, 'year' | 'month' | 'day'>
type TDItem = {
  datetime: TDDatetime
  title: string
}
const timeZone = ref('Asia/Seoul')
const locale = ref('ko-KR')
const itemList = ref<Array<TDItem>>([])
const newItemTitle = ref('')
const targetDatetime = ref<TDDate>() as Ref<TDDate>
const targetDatetimeString = computed(() => {
  if (targetDatetime.value == null) return ''
  const { year, month, day } = targetDatetime.value
  const weekday = (new Date(`${year}-${month}-${day}`)).toLocaleDateString(locale.value, { weekday: "short" })
  return `${year}-${month}-${day} (${weekday})`
})
const targetItemList = computed(() => {
  const datetime = targetDatetime.value
  return itemList.value.filter(({ datetime: d }) => d.year === datetime.year && d.month === datetime.month && d.day === datetime.day).sort((d1, d2) => d1.datetime.hour > d2.datetime.hour ? -1 : 1)
})
const inputTargetDate = useTemplateRef('input-target-date')

onMounted(() => {
  try {
    const dataJson = getItemFromStorage()
    if (Array.isArray(dataJson?.itemList)) {
      itemList.value = dataJson.itemList
    }
  } catch (e) { }

  const { hour, ...datetime } = calcDatetime(new Date())
  targetDatetime.value = { ...datetime }
})

const KEY = "ITEM_LIST"
function getItemFromStorage() {
  try {
    const dataStr = localStorage.getItem(KEY)
    if (dataStr) {
      const dataJson = JSON.parse(dataStr) as TDJson
      return dataJson
    } else {
      return null
    }
  } catch (e) {
    console.error('Error occured when loading list: ', e)
    throw e
  }
}
function setItemFromStorage(data: Partial<TDJson>) {
  try {
    const newData = { ...data, timestamp: Date.now() }
    localStorage.setItem(KEY, JSON.stringify(newData))
  } catch (e) {
    console.error('Error occured when save list: ', e)
  }
}

function calcDatetime(_d: number | Date) {
  const d = typeof _d === 'number' ? new Date(_d) : _d

  const formatter = new Intl.DateTimeFormat(locale.value, {
    timeZone: timeZone.value,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })

  const parts = formatter.formatToParts(d)

  const datetime = parts.reduce((o, d) => ({
    ...o,
    ...(['year', 'month', 'day', 'hour'].includes(d.type) ? { [d.type]: d.value } : {})
  })
    , {} as TDDatetime)
  return datetime
}

function moveTargetDate(type: 'day', amount: number) {
  if (type === 'day') {
    clearModifyingList()
    const { year, month, day } = targetDatetime.value
    const newTargetDate = new Date(`${year}-${month}-${day}`)
    newTargetDate.setDate(newTargetDate.getDate() + amount)
    targetDatetime.value = calcDatetime(newTargetDate)
  }
}

function onTargetDateInput() {
  const inputDate = inputTargetDate.value?.valueAsDate
  console.log('onTargetDateInput', inputDate)
  if (inputDate && !isNaN(inputDate.getTime())) {
    clearModifyingList()
    const { year, month, day } = calcDatetime(inputDate)
    targetDatetime.value = {
      year, month, day
    }
  }
}

function onAddItem() {
  const { value } = newItemTitle
  if (!value.trim()) return

  const newItem: Partial<TDItem> = {}
  const now = new Date()
  const datetime = calcDatetime(now)

  newItem.datetime = datetime
  newItem.title = value

  insertItem(newItem as TDItem)

  newItemTitle.value = ''
}
function onRemoveItem(datetime: TDDatetime) {
  let idx = -1
  if ((idx = getItemIndex(datetime)) >= 0) {
    itemList.value.splice(idx, 1)
  }

  setItemFromStorage({ itemList: itemList.value })

  newItemTitle.value = ''
}
function getItemIndex(datetime: TDDatetime) {
  return itemList.value.findIndex((({ datetime: d }) => d.year === datetime.year && d.month === datetime.month && d.day === datetime.day && d.hour === datetime.hour))
}
function insertItem(item: TDItem) {
  let idx = -1
  const { datetime: key, ...itemValue } = item
  if ((idx = getItemIndex(key)) >= 0) {
    const newTitle = `${itemList.value[idx]!.title} ${item.title}`
    itemList.value[idx] = { ...itemList.value[idx]!, ...itemValue }
    itemList.value[idx]!.title = newTitle
  } else {
    const newItem: TDItem = { ...item }
    itemList.value.push(newItem)
  }
  setItemFromStorage({ itemList: itemList.value })
}
function updateItem(item: TDItem) {
  let idx = -1
  const { datetime: key, ...itemValue } = item
  if ((idx = getItemIndex(key)) >= 0) {
    itemList.value[idx] = { ...itemList.value[idx]!, ...itemValue }
    setItemFromStorage({ itemList: itemList.value })
  }
}

// ===
// 수정 모드
// ===
type TDModifyingItem = Partial<TDItem> & Pick<TDItem, 'datetime'>
const modifyingList = ref<Array<TDModifyingItem>>([])
function clearModifyingList() { modifyingList.value = [] }
function toggleModifyingList(datetimeData: TDModifyingItem) {
  let idx = -1
  const datetime = datetimeData.datetime
  if ((idx = getModifyingIndex(datetime)) >= 0) {
    updateItem({ datetime, title: datetimeData.title ?? '' })

    modifyingList.value.splice(idx, 1)
  } else {
    modifyingList.value.push({ datetime, title: datetimeData.title })
  }
}
function getModifyingIndex(datetime: TDDatetime) {
  return modifyingList.value.findIndex((({ datetime: d }) => d.year === datetime.year && d.month === datetime.month && d.day === datetime.day && d.hour === datetime.hour))
}
function isModifying(datetime: TDDatetime) { return getModifyingIndex(datetime) >= 0 }
function getModifyingItem(datetimeData: TDModifyingItem) {
  let idx = -1
  const datetime = datetimeData.datetime
  if ((idx = getModifyingIndex(datetime)) >= 0) {
    return modifyingList.value[idx]!
  }
}


</script>

<template>
  <header :style="{ display: 'inline-flex', gap: '4px' }">
    <button type="button" @click="moveTargetDate('day', -1)"> &lt; </button>
    <span>
      <input ref="input-target-date" type="date" style="width: 0; opacity: 0;" @input="onTargetDateInput" />
      <span @click="inputTargetDate?.showPicker?.()" :style="{ cursor: 'pointer' }">{{ targetDatetimeString }}</span>
    </span>
    <button type="button" @click="moveTargetDate('day', +1)"> &gt; </button>
  </header>

  <main>
    <div :style="{ display: 'flex' }">
      <input type="text" v-model="newItemTitle" @keydown.enter="onAddItem">
      <button type="button" @click="onAddItem">+</button>
    </div>
    <div>
      <div v-for="item in targetItemList" :style="{ display: 'flex', gap: '4px' }">
        <span>{{ item.datetime.hour }}:{{ '00' }}</span>
        <template v-if="isModifying(item.datetime)">
          <input type="text" v-model="getModifyingItem(item)!.title!" />
          <button type="button" @click="toggleModifyingList(getModifyingItem(item)!)">✅</button>
        </template>
        <template v-else>
          <span>{{ item.title }}</span>
          <button type="button" @click="toggleModifyingList(item)">📝</button>
        </template>
        <button type="button" @click="onRemoveItem(item.datetime)">❌</button>
      </div>
    </div>
  </main>
</template>

<style scoped></style>
