<script setup lang="ts">
import { useDateSelection } from '@/composables/useDateSelection'
import { useHeaderMenu } from '@/composables/useHeaderMenu'
import { useItemModification } from '@/composables/useItemModification'
import { useTemplateRef } from 'vue'
import RightSidebarMenu from './RightSidebarMenu.vue'
import ClockBadge from './ClockBadge.vue'


const { toggleRightSidebar } = useHeaderMenu()
const { targetDatetimeString, moveTargetDate: moveDate, setTargetDate } = useDateSelection()
const { clearModifyingList, } = useItemModification()

const inputTargetDate = useTemplateRef<HTMLInputElement>('input-target-date')

const moveTargetDate = (type: 'day', amount: number) => {
  clearModifyingList()
  moveDate(type, amount)
}

const onTargetDateInput = (event: Event) => {
  clearModifyingList()
  const target = event.target as HTMLInputElement
  const inputDate = target?.valueAsDate
  setTargetDate(inputDate)
}

const showCalendarPicker = () => {
  if (inputTargetDate?.value) inputTargetDate.value.showPicker()
}

</script>
<template>
  <header>
    <nav>
      <ul>
        <li><span class="button" @click="moveTargetDate('day', -1)"> &lt; </span></li>
        <li style="display: flex;">
          <input ref="input-target-date" type="date" class="calendar-picker" @input="onTargetDateInput" />
          <span class="calendar button" @click="showCalendarPicker">{{ targetDatetimeString }}</span>
        </li>
        <li><span class="button" @click="moveTargetDate('day', +1)"> &gt; </span></li>
      </ul>
      <ul>
        <li>
          <ClockBadge />
        </li>
        <li><span class="button" @click="toggleRightSidebar">☰</span></li>
      </ul>
    </nav>
    <Teleport to="#app">
      <RightSidebarMenu />
    </Teleport>
  </header>
</template>
<style lang="scss" scoped>
@use "../assets/variables";

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: variables.$bg-header;
  border-bottom: 2px solid variables.$border;

  padding: 12px 16px;
  margin-bottom: 12px;

  >nav {
    width: 100%;

    .calendar-picker {
      width: 0;
      height: 0;
      opacity: 0;
      padding: 0;
    }

    .button {
      cursor: pointer;
    }

    .calendar-button {
      height: 100%;
      display: inline-flex;
      align-items: center;
    }
  }
}
</style>
