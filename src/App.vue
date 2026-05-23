<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { clearLocalData } from './store'
import { useAuth } from './composables/useAuth'
import { useItems } from './composables/useItems'
import { useDateSelection } from './composables/useDateSelection'
import { useItemModification } from './composables/useItemModification'
import { useSync } from './composables/useSync'
import { useImport } from './composables/useImport'
import { useHeaderMenu } from './composables/useHeaderMenu'

const isLoading = ref(true)

const { currentUser, loginEmail, loginPassword,
  isSignUpWorking,
  isSignInWorking,
  isSignOutWorking,
  onSignUp, onSignIn: signInWithAuth, onSignOut, initializeAuth } = useAuth()
const { itemList, newItemTitle, calcDatetime, getItemIndex, updateItem, onAddItem, onRemoveItem, loadItemsFromLocal } = useItems()
const { isRightSidebarOpened, toggleRightSidebar } = useHeaderMenu()
const { targetDatetime, targetDatetimeString, targetItemList, inputTargetDate, moveTargetDate: moveDate, onTargetDateInput: onDateInput } = useDateSelection(itemList, calcDatetime)
const { clearModifyingList, toggleModifyingList, isModifying, getModifyingItem } = useItemModification(updateItem)
const { isSynching, onSync } = useSync(itemList, currentUser)
const { showImportModal, importMode, importText, importParseResult, onImportButtonClick, onImportPreview, onImportConfirm, closeImportModal } = useImport(itemList, getItemIndex)

const moveTargetDate = (type: 'day', amount: number) => {
  clearModifyingList()
  moveDate(type, amount)
}

const onTargetDateInput = (event: Event) => {
  clearModifyingList()
  onDateInput(event)
}

const onSignIn = async () => {
  await signInWithAuth()
  if (currentUser.value?.uid) {
    await onSync()
  }
}

onMounted(async () => {
  isLoading.value = true
  await initializeAuth()

  const user = currentUser.value
  if (user?.uid) {
    await loadItemsFromLocal()
  } else {
    await clearLocalData()
  }

  const { hour, ...datetime } = calcDatetime(new Date())
  targetDatetime.value = { ...datetime }

  isLoading.value = false
})

</script>

<template>
  <template v-if="isLoading">
    <!--  -->
  </template>
  <div v-else class="container-fluid">
    <!-- 로그인 전 -->
    <template v-if="!currentUser">
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
    <!--   후 -->
    <template v-else>
      <header>
        <nav>
          <ul>
            <li><span class="button" @click="moveTargetDate('day', -1)"> &lt; </span></li>
            <li style="display: flex;">
              <input ref="input-target-date" type="date" class="calendar-picker" @input="onTargetDateInput" />
              <span class="calendar button" @click="inputTargetDate?.showPicker?.()">{{ targetDatetimeString }}</span>
            </li>
            <li><span class="button" @click="moveTargetDate('day', +1)"> &gt; </span></li>
          </ul>
          <ul>
            <li><span class="button" @click="toggleRightSidebar">☰</span></li>
          </ul>
        </nav>
        <Teleport to="#app">
          <div class="right-sidebar" :style="{ display: isRightSidebarOpened ? 'block' : 'none' }">
            <span class="close-button" @click="toggleRightSidebar">X</span>
            <!-- </div> -->
            <h4>{{ currentUser.email }}</h4>
            <div role="button" @click="onImportButtonClick">Import</div>
            <div v-if="!isSynching" role="button" @click="onSync">Sync</div>
            <div v-else role="button" :aria-busy="true" />
            <div v-if="!isSignOutWorking" role="button" @click="onSignOut">Log Out</div>
            <div v-else role="button" :aria-busy="true" />
          </div>
        </Teleport>
      </header>

      <main>
        <form :style="{ display: 'flex' }">
          <fieldset role="group">
            <input type="text" v-model="newItemTitle" placeholder="What you done..." @keydown.enter="onAddItem">
            <input type="submit" @click.prevent="onAddItem" value="+" />
          </fieldset>
        </form>
        <div class="todo-list">
          <article class="todo-item" v-for="item in targetItemList" :key="`${item.datetime.hour}`">
            <span class="time">{{ item.datetime.hour }}:00</span>
            <template v-if="isModifying(item.datetime)">
              <input type="text" v-model="getModifyingItem(item)!.title!" class="title-input" />
              <div class="actions">
                <button class="action-confirm" @click="toggleModifyingList(getModifyingItem(item)!)">✓</button>
                <button class="action-cancel" @click="toggleModifyingList(getModifyingItem(item)!, false)">✗</button>
              </div>
            </template>
            <template v-else>
              <span class="title">{{ item.title }}</span>
              <div class="actions">
                <button class="action-edit" @click="toggleModifyingList(item)">✎</button>
                <button class="action-delete" @click="onRemoveItem(item.datetime)">✕</button>
              </div>
            </template>
          </article>
        </div>
      </main>

      <!-- Import Modal -->
      <dialog :open="showImportModal">
        <article>
          <header class="modal-header">
            <button aria-label="Close" rel="prev" @click="closeImportModal"></button>
            <p><strong>Import</strong></p>
          </header>

          <main>
            <textarea v-model="importText"></textarea>

            <div>
              <label>
                <input type="radio" v-model="importMode" value="keep" />
                유지하기
              </label>
              <label>
                <input type="radio" v-model="importMode" value="overwrite" />
                덮어쓰기
              </label>
            </div>


            <div v-if="importParseResult">
              <p>파싱: {{ importParseResult.summary.parsedItems }}개, 에러: {{ importParseResult.errors.length }}개</p>
              <div v-if="importParseResult.errors.length > 0">
                <p>에러:</p>
                <ul>
                  <li v-for="error in importParseResult.errors.slice(0, 5)" :key="`${error.line}-${error.content}`">
                    Line {{ error.line }}: {{ error.reason }}
                  </li>
                </ul>
                <p v-if="importParseResult.errors.length > 5">... 그 외 {{ importParseResult.errors.length - 5 }}개</p>
              </div>
            </div>
          </main>

          <footer>
            <button class="secondary" @click="closeImportModal">취소</button>
            <button @click="onImportPreview">미리보기</button>
            <button @click="onImportConfirm" :disabled="!importParseResult || importParseResult.items.length === 0">Import</button>
          </footer>

        </article>
      </dialog>
    </template>
  </div>
</template>

<style scoped lang="scss">
// Color Variables
$primary: #0066cc;
$primary-dark: #0052a3;
$danger: #d62828;
$danger-dark: #b91c1c;
$success: #2a9d2a;
$success-dark: #1f7a1f;
$neutral: #808080;
$neutral-dark: #666666;

$bg-header: #f9f9f9;
$bg-main: #ffffff;
$bg-time: #f0f0f0;
$bg-sidebar: #ffffff;
$border: #e0e0e0;
$text-primary: #333;
$text-secondary: #666;

// pico
button {
  padding: 0.4rem;
  font-size: 0.75rem;
  margin: 0;
}

// header
header:not(.modal-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: $bg-header;
  border-bottom: 2px solid $border;

  padding: 12px 16px;
  margin-bottom: 12px;

  h2 {
    margin: 0;
  }

  // div {
  //   display: inline-flex;
  // }

  // .date-select-nav {
  //   flex: 1 1 0;
  //   gap: 4px;

  //   input[type="date"] {
  //     width: 0;
  //     height: 0;
  //     opacity: 0;
  //     padding: 0;
  //   }

  //   button {
  //     background-color: transparent;
  //     border: transparent;
  //   }

  //   span>span {
  //     cursor: pointer;
  //     height: 100%;
  //     display: inline-flex;
  //     align-items: center;
  //   }
  // }

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

main {

  .todo-list {
    .todo-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-bottom: 1px solid $border;

      .time {
        font-size: 1rem;
        color: $text-primary;
        min-width: 60px;
        font-weight: bold;
        background: $bg-time;
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
          background-color: $primary;
          color: white;
          border-color: $primary;

          &:hover {
            background-color: $primary-dark;
            border-color: $primary-dark;
          }
        }

        .action-delete {
          background-color: $danger;
          color: white;
          border-color: $danger;

          &:hover {
            background-color: $danger-dark;
            border-color: $danger-dark;
          }
        }

        .action-confirm {
          background-color: $success;
          color: white;
          border-color: $success;

          &:hover {
            background-color: $success-dark;
            border-color: $success-dark;
          }
        }

        .action-cancel {
          background-color: $neutral;
          color: white;
          border-color: $neutral;

          &:hover {
            background-color: $neutral-dark;
            border-color: $neutral-dark;
          }
        }
      }
    }

    .todo-item:last-child {
      border-bottom: none;
    }
  }
}

// sidebar
.right-sidebar {
  gap: 10px;
  position: fixed;
  right: 0;
  height: 100vh;
  width: 400px;
  max-width: 80vw;
  background-color: $bg-sidebar;
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

// modal
dialog {
  >article>main {
    max-height: 80vh;
    overflow: auto;
    margin: calc(var(--pico-spacing) * -1);
    padding: var(--pico-spacing);
  }

  .modal-header {
    button[rel="prev"] {
      margin-top: 6px;
    }
  }

}
</style>
