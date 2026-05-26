<script setup lang="ts">
import { useItems } from '@/composables/useItems'

const { newItemTitle, onAddItem } = useItems()

</script>
<template>
  <form :style="{ display: 'flex' }">
    <fieldset role="group">
      <!-- @TODO 입력될 시간 보여줄지 검토 후 처리. 시간이 바뀔 경우 업데이트해야되는지 반응성 처리가 성능에 영향가는지 검토 -->
      <!-- <button class="secondary" style="width: auto; padding: 0 10px;">~{{ time }}:00</button> -->
      <input type="text" v-model="newItemTitle" placeholder="What you done..." @keydown.enter="onAddItem">
      <input type="submit" @click.prevent="onAddItem" value="+" />
    </fieldset>
  </form>
</template>
<style lang="scss" scoped></style>
