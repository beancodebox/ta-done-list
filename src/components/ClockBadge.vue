<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
const now = ref(Date.now())
const displayTime = computed(() => {
  const d = new Date(now.value)
  return {
    hour: `${d.getHours()}`.padStart(2, '0'),
    minute: `${d.getMinutes()}`.padStart(2, '0'),
    second: `${d.getSeconds()}`.padStart(2, '0'),
  }
})
let timer = -1
function updateTime() {
  const current = Date.now()
  now.value = current
  const delay = 1000 - (current % 1000)
  timer = setTimeout(updateTime, delay)
}
onMounted(() => {
  updateTime()
})
onUnmounted(() => {
  clearTimeout(timer)
})
</script>
<template>
  <kbd>{{ displayTime.hour }}:{{ displayTime.minute }}:{{ displayTime.second }}</kbd>
</template>
