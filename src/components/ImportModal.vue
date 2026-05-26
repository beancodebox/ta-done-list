<script setup lang="ts">
import { useImport } from '@/composables/useImport'

const { isImportModalShowing, importMode, importText, importParseResult, onImportPreview, onImportConfirm, closeImportModal } = useImport()


</script>
<template>
  <dialog :open="isImportModalShowing">
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
<style lang="scss" scoped>
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
