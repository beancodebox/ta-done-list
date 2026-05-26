import { computed } from 'vue'
import { type TaDoneDatetime } from '../store'
import { currentUser, itemList, targetDatetime } from '@/stores/appState'
import { useItems } from './useItems'

export function useDateSelection() {
  const { calcDatetime } = useItems()

  const targetDatetimeString = computed(() => {
    if (targetDatetime.value == null) return ''
    const { year, month, day } = targetDatetime.value
    const locale = currentUser.value?.locale ?? 'ko-KR'
    const weekday = new Date(`${year}-${month}-${day}`).toLocaleDateString(locale, {
      weekday: 'short',
    })
    return `${year}-${month}-${day} (${weekday})`
  })

  const targetItemList = computed(() => {
    if (targetDatetime.value == null) return []
    const datetime = targetDatetime.value
    return itemList.value
      .filter(
        ({ datetime: d }) =>
          d.year === datetime.year && d.month === datetime.month && d.day === datetime.day,
      )
      .sort((d1, d2) => (d1.datetime.hour > d2.datetime.hour ? -1 : 1))
  })

  const setTargetDate = (inputDate: Date | null) => {
    if (inputDate && !isNaN(inputDate.getTime())) {
      const { year, month, day } = calcDatetime(inputDate)
      targetDatetime.value = {
        year,
        month,
        day,
      } as TaDoneDatetime
    }
  }

  const moveTargetDate = (type: 'day', amount: number) => {
    if (targetDatetime.value == null) return
    if (type === 'day') {
      const { year, month, day } = targetDatetime.value
      const newTargetDate = new Date(`${year}-${month}-${day}`)
      newTargetDate.setDate(newTargetDate.getDate() + amount)
      targetDatetime.value = calcDatetime(newTargetDate)
    }
  }

  return {
    targetDatetime,
    targetDatetimeString,
    targetItemList,
    setTargetDate,
    moveTargetDate,
  }
}
