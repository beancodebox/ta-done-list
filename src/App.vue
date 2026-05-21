<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef, type Ref } from 'vue'
import { getItemFromLocal, setItemToLocal, getLocalUpdatedAt, setLocalUpdatedAt, type TaDoneItem, type TaDoneDatetime, type TaDoneDate, clearLocalData } from './store'
import { currentUser, getCurrentUser, signIn, signOut, signUp, waitForInitialAuth } from './services/auth'
import { syncWithCloud } from './services/firestore'
import { parseTextDataFormat, type ParseResult } from './services/importParser'

// ===== 로딩 상태 =====
const isLoading = ref(true)
onMounted(async () => {
  isLoading.value = true
  await waitForInitialAuth()

  const user = currentUser.value
  if (user?.uid) {
    try {
      const localData = await getItemFromLocal()
      if (Array.isArray(localData?.itemList)) {
        itemList.value = localData.itemList
      }
    } catch (e) { }
  } else {
    await clearLocalData()
  }

  const { hour, ...datetime } = calcDatetime(new Date())
  targetDatetime.value = { ...datetime }

  isLoading.value = false
})

// ===== 설정 =====
const timeZone = ref('Asia/Seoul')
const locale = ref('ko-KR')

// ===== 인증 (Authentication) =====
const loginEmail = ref('')
const loginPassword = ref('')

async function onSignUp() {
  await signUp(loginEmail.value, loginPassword.value)
  const user = getCurrentUser()
  if (user) {
    // const { email, uid } = user
    // currentUser.value = { email: email ?? '', uid }
    currentUser.value = { ...user }
  }
}

async function onSignIn() {
  await signIn(loginEmail.value, loginPassword.value)
  const user = getCurrentUser()
  if (user) {
    // const { email, uid } = user
    // currentUser.value = { email: email ?? '', uid }
    currentUser.value = { ...user }
    const result = await syncWithCloud(user.uid, [], 0)
    itemList.value = result.items
    setItemToLocal({ itemList: itemList.value })
    setLocalUpdatedAt(result.timestamp)
  }

}

async function onSignOut() {
  await signOut()
  await clearLocalData()
  currentUser.value = null
  loginEmail.value = ''
  loginPassword.value = ''
}

// ===== 항목 관리 (Items) =====
const itemList = ref<Array<TaDoneItem>>([])
const newItemTitle = ref('')

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
    , {} as TaDoneDatetime)
  return datetime
}

function getItemIndex(datetime: TaDoneDatetime) {
  return itemList.value.findIndex((({ datetime: d }) => d.year === datetime.year && d.month === datetime.month && d.day === datetime.day && d.hour === datetime.hour))
}

function insertItem(item: TaDoneItem) {
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

function updateItem(item: TaDoneItem) {
  let idx = -1
  const now = Date.now()
  const { datetime: key, ...itemValue } = item
  if ((idx = getItemIndex(key)) >= 0) {
    itemList.value[idx] = { ...itemList.value[idx]!, ...itemValue, updatedAt: now }
    setItemToLocal({ itemList: itemList.value })
  }
}

function onAddItem() {
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

function onRemoveItem(datetime: TaDoneDatetime) {
  let idx = -1
  if ((idx = getItemIndex(datetime)) >= 0) {
    itemList.value.splice(idx, 1)
  }

  setItemToLocal({ itemList: itemList.value })

  newItemTitle.value = ''
}

// ===== 날짜 선택 (Date Selection) =====
const targetDatetime = ref<TaDoneDate>() as Ref<TaDoneDate>
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
  if (inputDate && !isNaN(inputDate.getTime())) {
    clearModifyingList()
    const { year, month, day } = calcDatetime(inputDate)
    targetDatetime.value = {
      year, month, day
    }
  }
}

// ===== 항목 수정 (Modifying) =====
type TaDoneModifyingItem = Partial<TaDoneItem> & Pick<TaDoneItem, 'datetime'>
const modifyingList = ref<Array<TaDoneModifyingItem>>([])

function clearModifyingList() { modifyingList.value = [] }

function toggleModifyingList(datetimeData: TaDoneModifyingItem, doUpdate = true) {
  let idx = -1
  const now = Date.now()
  const datetime = datetimeData.datetime
  if ((idx = getModifyingIndex(datetime)) >= 0) {
    if (doUpdate)
      updateItem({ datetime, title: datetimeData.title ?? '', updatedAt: now })

    modifyingList.value.splice(idx, 1)
  } else {
    modifyingList.value.push({ datetime, title: datetimeData.title })
  }
}

function getModifyingIndex(datetime: TaDoneDatetime) {
  return modifyingList.value.findIndex((({ datetime: d }) => d.year === datetime.year && d.month === datetime.month && d.day === datetime.day && d.hour === datetime.hour))
}

function isModifying(datetime: TaDoneDatetime) { return getModifyingIndex(datetime) >= 0 }

function getModifyingItem(datetimeData: TaDoneModifyingItem) {
  let idx = -1
  const datetime = datetimeData.datetime
  if ((idx = getModifyingIndex(datetime)) >= 0) {
    return modifyingList.value[idx]!
  }
}

// ===== 동기화 (Sync) =====
async function onSync() {
  if (currentUser.value) {
    const localTime = getLocalUpdatedAt()
    const result = await syncWithCloud(currentUser.value.uid, itemList.value, localTime)
    itemList.value = result.items
    setLocalUpdatedAt(result.timestamp)
  }
}

// ===== Import =====
type ImportMode = 'keep' | 'overwrite'
const showImportModal = ref(false)
const importMode = ref<ImportMode>('keep')
const importText = ref('')
const importParseResult = ref<ParseResult | null>(null)

function onImportButtonClick() {
  showImportModal.value = true
  importText.value = ''
  importParseResult.value = null
}

function onImportPreview() {
  if (!importText.value.trim()) {
    importParseResult.value = null
    return
  }
  importParseResult.value = parseTextDataFormat(importText.value)
}

function onImportConfirm() {
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

function closeImportModal() {
  showImportModal.value = false
  importText.value = ''
  importParseResult.value = null
}

</script>

<template>
  <template v-if="isLoading">
    <!--  -->
  </template>
  <!-- 로그인 전 -->
  <div v-else-if="!currentUser" :style="{ padding: '20px' }">
    <h1>TaDone 앱</h1>
    <div :style="{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }">
      <input v-model="loginEmail" type="email" placeholder="이메일" @keydown.enter="onSignIn">
      <input v-model="loginPassword" type="password" placeholder="비밀번호" @keydown.enter="onSignIn">
      <button type="button" @click="onSignUp">회원가입</button>
      <button type="button" @click="onSignIn">로그인</button>
    </div>
  </div>

  <!-- 로그인 후 -->
  <div v-else>
    <header :style="{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #ccc' }">
      <div :style="{ display: 'inline-flex', gap: '4px' }">
        <button type="button" @click="moveTargetDate('day', -1)"> &lt; </button>
        <span>
          <input ref="input-target-date" type="date" style="width: 0; opacity: 0;" @input="onTargetDateInput" />
          <span @click="inputTargetDate?.showPicker?.()" :style="{ cursor: 'pointer' }">{{ targetDatetimeString }}</span>
        </span>
        <button type="button" @click="moveTargetDate('day', +1)"> &gt; </button>
      </div>
      <div :style="{ display: 'flex', gap: '10px', alignItems: 'center' }">
        <span :style="{ fontSize: '12px' }">{{ currentUser.email }}</span>
        <button type="button" @click="onImportButtonClick">Import</button>
        <button type="button" @click="onSync">동기화</button>
        <button type="button" @click="onSignOut">로그아웃</button>
      </div>
    </header>

    <main :style="{ padding: '10px' }">
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
            <button type="button" @click="toggleModifyingList(getModifyingItem(item)!, false)">🆑</button>
          </template>
          <template v-else>
            <span>{{ item.title }}</span>
            <button type="button" @click="toggleModifyingList(item)">📝</button>
            <button type="button" @click="onRemoveItem(item.datetime)">❌</button>
          </template>
        </div>
      </div>
    </main>

    <!-- Import Modal -->
    <div v-if="showImportModal">
      <div>
        <h2>Import</h2>
        <button @click="closeImportModal">닫기</button>
      </div>

      <textarea v-model="importText"></textarea>

      <div>
        <label>
          <input type="radio" v-model="importMode" value="keep" />
          유지하기
        </label>
        <label>
          <input type="radio" v-model="importMode" value="overwrite" />
          덮어쓰기
        </label>
      </div>

      <button @click="onImportPreview">미리보기</button>

      <div v-if="importParseResult">
        <p>파싱: {{ importParseResult.summary.parsedItems }}개, 에러: {{ importParseResult.errors.length }}개</p>
        <div v-if="importParseResult.errors.length > 0">
          <p>에러:</p>
          <ul>
            <li v-for="error in importParseResult.errors.slice(0, 5)" :key="`${error.line}-${error.content}`">
              Line {{ error.line }}: {{ error.reason }}
            </li>
          </ul>
          <p v-if="importParseResult.errors.length > 5">... 그 외 {{ importParseResult.errors.length - 5 }}개</p>
        </div>
      </div>

      <button @click="closeImportModal">취소</button>
      <button @click="onImportConfirm" :disabled="!importParseResult || importParseResult.items.length === 0">Import</button>
    </div>
  </div>
</template>

<style scoped></style>
