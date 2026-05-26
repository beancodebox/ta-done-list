<script setup lang="ts">
import { useItemModification, type TaDoneModifyingItem } from '@/composables/useItemModification'
import { useItems } from '@/composables/useItems'
import { computed } from 'vue'

const { item, isModifying } = defineProps<{
  item: TaDoneModifyingItem,
  isModifying: boolean,
}>()
const {
  getModifyingItem,
  startModifyingItem,
  cancelModifyingItem,
  confirmModifyingItem,
} = useItemModification()
const { onRemoveItem } = useItems()

const modifyingItem = computed(() => {
  if (!isModifying) return null
  return getModifyingItem(item) ?? null
})


</script>
<template>
  <article class="ta-done-item">
    <span class="time">~{{ item.datetime.hour }}:00</span>
    <template v-if="isModifying && modifyingItem">
      <input type="text" v-model="modifyingItem.title" class="title-input" />
      <div class="actions">
        <button class="action-confirm" @click="confirmModifyingItem(modifyingItem)">✓</button>
        <button class="action-cancel" @click="cancelModifyingItem(item)">✗</button>
      </div>
    </template>
    <template v-else>
      <span class="title">{{ item.title }}</span>
      <div class="actions">
        <button class="action-edit" @click="startModifyingItem(item)">✎</button>
        <button class="action-delete" @click="onRemoveItem(item.datetime)">✕</button>
      </div>
    </template>
  </article>
</template>
