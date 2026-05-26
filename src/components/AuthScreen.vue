<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
import { useSync } from '@/composables/useSync'

const { currentUser, loginEmail, loginPassword,
  isSignUpWorking,
  isSignInWorking,
  onSignUp, onSignIn: signInWithAuth, } = useAuth()
const { onSync } = useSync()

const onSignIn = async () => {
  await signInWithAuth()
  if (currentUser.value?.uid) {
    await onSync()
  }
}
</script>
<template>
  <header>
    <h2>Ta-Done List</h2>
  </header>
  <main>
    <h3>Login/Join</h3>
    <form>
      <input v-model="loginEmail" type="email" placeholder="E-mail" @keydown.enter="onSignIn">
      <input v-model="loginPassword" type="password" placeholder="password" @keydown.enter="onSignIn">
      <div v-if="!isSignUpWorking" class="secondary" @click.prevent="onSignUp">Join</div>
      <div v-else class="secondary" :aria-busy="true" />
      <div v-if="!isSignInWorking" @click.prevent="onSignIn">Login</div>
      <div v-else :aria-busy="true" />
    </form>
  </main>
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

  h2 {
    margin: 0;
  }

  >nav {
    width: 100%;

    .button {
      cursor: pointer;
    }
  }
}
</style>
