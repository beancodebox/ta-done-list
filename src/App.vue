<script setup lang="ts">
import { computed, onMounted, ref, type Ref } from 'vue'

// import HelloWorld from './components/HelloWorld.vue'
// import TheWelcome from './components/TheWelcome.vue'

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

async function onAddItem() {
  const { value } = newItemTitle
  if (!value.trim()) return

  const newItem: Partial<TDItem> = {}
  const now = new Date()
  const datetime = calcDatetime(now)

  let oldItemIndex = -1
  if ((oldItemIndex = itemList.value.findIndex((({ datetime: d }) => d.year === datetime.year && d.month === datetime.month && d.day === datetime.day && d.hour === datetime.hour))) >= 0) {
    itemList.value[oldItemIndex]!.title += ` ${value}`
  } else {
    newItem.datetime = datetime
    newItem.title = value
    itemList.value.push(newItem as TDItem)
  }

  setItemFromStorage({ itemList: itemList.value })

  newItemTitle.value = ''
}
</script>

<template>
  <header>
    {{ targetDatetimeString }}
  </header>

  <main>
    <div :style="{ display: 'flex' }">
      <input type="text" v-model="newItemTitle" @keydown.enter="onAddItem">
      <button type="button" @click="onAddItem">+</button>
    </div>
    <div>
      <div v-for="item in itemList" :style="{ display: 'inline-flex', gap: '4px' }">
        <span>{{ item.datetime.hour }}:{{ '00' }}</span>
        <span>{{ item.title }}</span>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
} */
</style>
