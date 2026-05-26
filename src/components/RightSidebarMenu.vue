<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
import { useHeaderMenu } from '@/composables/useHeaderMenu'
import { useImport } from '@/composables/useImport'
import { useSync } from '@/composables/useSync'

const { currentUser, isSignOutWorking, onSignOut } = useAuth()
const { isRightSidebarOpened, toggleRightSidebar } = useHeaderMenu()
const { isSynching, onSync } = useSync()
const {
  onImportButtonClick,
} = useImport()

</script>
<template>
  <div class="right-sidebar" :style="{ display: isRightSidebarOpened ? 'block' : 'none' }">
    <span class="close-button" @click="toggleRightSidebar">X</span>
    <h4>{{ currentUser?.email }}</h4>
    <div role="button" @click="onImportButtonClick">Import</div>
    <div v-if="!isSynching" role="button" @click="onSync">Sync</div>
    <div v-else role="button" :aria-busy="true" />
    <div v-if="!isSignOutWorking" role="button" @click="onSignOut">Log Out</div>
    <div v-else role="button" :aria-busy="true" />
  </div>
</template>
<style lang="scss" scoped>
@use "../assets/variables";

// sidebar
.right-sidebar {
  gap: 10px;
  position: fixed;
  right: 0;
  height: 100vh;
  width: 400px;
  max-width: 80vw;
  background-color: variables.$bg-sidebar;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  padding: 40px 20px;
  background-color: #dddddddd;
  display: flex;
  flex-direction: column;
  z-index: 1;

  [role="button"] {
    margin-bottom: 1rem;
  }

  .close-button {
    cursor: pointer;
    float: right;
    position: relative;
    right: 10px;
    top: -16px;
    padding: 5px;
    background: #dddddd;
  }
}
</style>
