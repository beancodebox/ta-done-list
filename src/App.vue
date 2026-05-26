<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuth } from './composables/useAuth'
import { isLoading } from '@/stores/appState'
import AppHeader from './components/AppHeader.vue'
import ImportModal from './components/ImportModal.vue'
import ItemInput from './components/ItemInput.vue'
import ItemList from './components/ItemList.vue'
import InitLoadingScreen from './components/InitLoadingScreen.vue'
import AuthScreen from './components/AuthScreen.vue'
import { useAppInitialization } from './composables/useAppInitialization'

const { currentUser } = useAuth()
const { init } = useAppInitialization()

// const isLoading = ref(true)

onMounted(async () => {
  await init()
})

</script>

<template>
  <InitLoadingScreen v-if="isLoading" />
  <div v-else class="container-fluid">
    <!-- 로그인 전 -->
    <AuthScreen v-if="!currentUser" />
    <!-- 로그인 후 -->
    <template v-else>
      <AppHeader />

      <main>
        <ItemInput />
        <ItemList />
      </main>

      <!-- Import Modal -->
      <ImportModal />
    </template>
  </div>
</template>

<style lang="scss">
// pico
button {
  padding: 0.4rem;
  font-size: 0.75rem;
  margin: 0;
}
</style>
