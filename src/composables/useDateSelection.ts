import { computed, ref, useTemplateRef, type Ref } from 'vue'
import { type TaDoneDate, type TaDoneItem, type TaDoneDatetime } from '../store'
import { useAuth } from './useAuth'

export function useDateSelection(
  itemList: Ref<TaDoneItem[]>,
  calcDatetime: (d: number | Date) => TaDoneDatetime,
) {
  const targetDatetime = ref<TaDoneDate>() as Ref<TaDoneDate>
  const inputTargetDate = useTemplateRef<HTMLInputElement>('input-target-date')
  const { currentUser } = useAuth()

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
    const datetime = targetDatetime.value
    return itemList.value
      .filter(
        ({ datetime: d }) =>
          d.year === datetime.year && d.month === datetime.month && d.day === datetime.day,
      )
      .sort((d1, d2) => (d1.datetime.hour > d2.datetime.hour ? -1 : 1))
  })

  const moveTargetDate = (type: 'day', amount: number) => {
    if (type === 'day') {
      const { year, month, day } = targetDatetime.value
      const newTargetDate = new Date(`${year}-${month}-${day}`)
      newTargetDate.setDate(newTargetDate.getDate() + amount)
      targetDatetime.value = calcDatetime(newTargetDate)
    }
  }

  const onTargetDateInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    const inputDate = target?.valueAsDate
    if (inputDate && !isNaN(inputDate.getTime())) {
      const { year, month, day } = calcDatetime(inputDate)
      targetDatetime.value = {
        year,
        month,
        day,
      }
    }
  }

  return {
    targetDatetime,
    targetDatetimeString,
    targetItemList,
    inputTargetDate,
    moveTargetDate,
    onTargetDateInput,
  }
}
