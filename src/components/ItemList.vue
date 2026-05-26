<script setup lang="ts">
import { useDateSelection } from '@/composables/useDateSelection'
import { useItemModification } from '@/composables/useItemModification'
import ItemRow from './ItemRow.vue'

const { targetItemList } = useDateSelection()
const {
  isModifying,
} = useItemModification()


</script>
<template>
  <div class="ta-done-list">
    <ItemRow v-for="item in targetItemList" :key="`${item.datetime.hour}`" :item="item" :is-modifying="isModifying(item.datetime)" />
  </div>
</template>
<style lang="scss">
@use "../assets/variables";

.ta-done-list {
  .ta-done-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-bottom: 1px solid variables.$border;

    .time {
      font-size: 1rem;
      color: variables.$text-primary;
      min-width: 60px;
      font-weight: bold;
      background: variables.$bg-time;
      padding: 4px 8px;
      border-radius: 4px;
      text-align: center;
      flex-shrink: 0;
    }

    .title {
      flex: 1;
      font-size: 1rem;
      margin-left: 8px;
    }

    .title-input {
      flex: 1;
      // margin-left: 8px;
      margin: 0;
      // padding-top: 0;
      // padding-bottom: 0;
      padding: 0 6px;
      height: -webkit-fill-available;
    }

    .actions {
      display: flex;
      gap: 8px;
      margin-left: auto;
      flex-shrink: 0;

      button {
        padding: 4px 8px;
        font-size: 0.875rem;
        color: white;
      }

      .action-edit {
        background-color: variables.$primary;
        color: white;
        border-color: variables.$primary;

        &:hover {
          background-color: variables.$primary-dark;
          border-color: variables.$primary-dark;
        }
      }

      .action-delete {
        background-color: variables.$danger;
        color: white;
        border-color: variables.$danger;

        &:hover {
          background-color: variables.$danger-dark;
          border-color: variables.$danger-dark;
        }
      }

      .action-confirm {
        background-color: variables.$success;
        color: white;
        border-color: variables.$success;

        &:hover {
          background-color: variables.$success-dark;
          border-color: variables.$success-dark;
        }
      }

      .action-cancel {
        background-color: variables.$neutral;
        color: white;
        border-color: variables.$neutral;

        &:hover {
          background-color: variables.$neutral-dark;
          border-color: variables.$neutral-dark;
        }
      }
    }
  }

  .ta-done-item:last-child {
    border-bottom: none;
  }
}
</style>
