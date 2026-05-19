export type TaDoneUser = {
  itemList: TaDoneItem[]
  timestamp: number // 마지막 변경 시간
  lastSynced: number // 마지막 동기화 시간
}

export type TaDoneItem = {
  datetime: {
    year: string // "2026"
    month: string // "05"
    day: string // "19"
    hour: string // "14"
  }
  title: string
  // tags?: string[] // ["중요", "work"]
  updatedAt: number
}

const KEY = 'ITEM_LIST'
const LOCAL_UPDATED_AT_KEY = 'localUpdatedAt'

export function getLocalUpdatedAt(): number {
  return parseInt(localStorage.getItem(LOCAL_UPDATED_AT_KEY) || '0')
}

export function setLocalUpdatedAt(time: number): void {
  localStorage.setItem(LOCAL_UPDATED_AT_KEY, time.toString())
}

export async function getItemFromLocal() {
  try {
    // const user = currentUser.value
    // if (user) {
    //   return await getUserData(user.uid)
    // }
    const dataStr = localStorage.getItem(KEY)
    if (dataStr) {
      const dataJson = JSON.parse(dataStr) as TaDoneUser
      return dataJson
    } else {
      return null
    }
  } catch (e) {
    console.error('Error occured when loading list: ', e)
    throw e
  }
}
export async function setItemToLocal(data: Partial<TaDoneUser>) {
  try {
    // // const newData = { ...data, timestamp: Date.now() }
    // if (currentUser.value?.uid) {
    //   await setUserData(currentUser.value.uid, data)
    // }
    const now = Date.now()
    localStorage.setItem(KEY, JSON.stringify({ ...data, timestamp: now }))
    localStorage.setItem(LOCAL_UPDATED_AT_KEY, now.toString())
  } catch (e) {
    console.error('Error occured when save list: ', e)
  }
}

export async function clearLocalData() {
  try {
    localStorage.removeItem(KEY)
    localStorage.removeItem(LOCAL_UPDATED_AT_KEY)
  } catch (e) {
    console.error('Error occured when clear data: ', e)
  }
}

// export function mergeItems(local: TaDoneItem[], cloud: TaDoneItem[]): TaDoneItem[] {
//   const map = new Map<string, TaDoneItem>()

//   // 클라우드 항목 추가
//   cloud.forEach((item) => {
//     const key = `${item.datetime.year}-${item.datetime.month}-${item.datetime.day}-${item.datetime.hour}`
//     map.set(key, item)
//   })

//   // 로컬 항목 추가 (더 최신이면 덮어쓰기)
//   local.forEach((item) => {
//     const key = `${item.datetime.year}-${item.datetime.month}-${item.datetime.day}-${item.datetime.hour}`
//     const existing = map.get(key)
//     if (!existing || (item.updatedAt || 0) > (existing.updatedAt || 0)) {
//       map.set(key, item)
//     }
//   })

//   return Array.from(map.values())
// }
