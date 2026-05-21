import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { type TaDoneUser, type TaDoneItem } from '@/store'

export async function getItemsFromCloud(uid: string): Promise<TaDoneUser> {
  try {
    const data = await getDoc(doc(db, 'users', uid))
    let tdUser = {
      itemList: [],
      timestamp: 0,
      lastSynced: 0,
    } as TaDoneUser
    if (data.exists()) {
      tdUser = {
        ...(data.data() as TaDoneUser),
      }
    } else {
      const now = Date.now()
      tdUser.timestamp = now
      tdUser.lastSynced = now
    }
    return tdUser
  } catch (e: any) {
    const error = e as any
    const errorCode = error.code
    const errorMessage = error.message
    console.error(errorCode, errorMessage, error)
    throw error
  }
}
export async function saveItemsToCloud(uid: string, data: Partial<TaDoneUser>): Promise<void> {
  try {
    const now = Date.now()
    const tdUser = {
      itemList: [],
      ...data,
      timestamp: now,
      lastSynced: now,
    } as TaDoneUser
    await setDoc(doc(db, 'users', uid), tdUser)
  } catch (e: any) {
    const error = e as any
    const errorCode = error.code
    const errorMessage = error.message
    console.error(errorCode, errorMessage, error)
    throw error
  }
}

export async function syncWithCloud(
  userId: string,
  localItems: TaDoneItem[],
  localUpdatedAt: number,
): Promise<{ items: TaDoneItem[]; timestamp: number; isCloudNewer: boolean }> {
  // 1. 클라우드 데이터 로드
  const cloudData = await getItemsFromCloud(userId)

  // 2. timestamp 비교
  // localUpdatedAt이 0이면 → 첫 로그인 (클라우드 데이터 그대로 사용)
  const isCloudNewer = localUpdatedAt === 0 || cloudData.timestamp > localUpdatedAt

  if (isCloudNewer) {
    // 클라우드가 더 최신 → 클라우드 데이터 반환
    return { items: cloudData.itemList, timestamp: cloudData.timestamp, isCloudNewer: true }
  } else {
    // 로컬이 더 최신 → 로컬 데이터 저장
    const now = Date.now()
    await saveItemsToCloud(userId, {
      itemList: localItems,
      timestamp: now,
      lastSynced: now,
    })
    return { items: localItems, timestamp: now, isCloudNewer: false }
  }
}
