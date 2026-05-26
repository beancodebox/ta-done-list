import type { TaDoneModifyingItem } from '@/composables/useItemModification'
import type { ImportMode, ParseResult } from '@/services/importParser'
import type { TaDoneDate, TaDoneItem } from '@/store'
import { ref } from 'vue'

// Core state
export const currentUser = ref<{
  email: string
  uid: string
  timeZone?: string
  locale?: string
} | null>(null)
export const itemList = ref<TaDoneItem[]>([])
export const targetDatetime = ref<TaDoneDate>()

// Auth form state
export const loginEmail = ref('')
export const loginPassword = ref('')

// Main UI state
export const newItemTitle = ref('')
export const isRightSidebarOpened = ref(false)

// Import UI state
export const isImportModalShowing = ref(false)
export const importMode = ref<ImportMode>('keep')
export const importText = ref('')
export const importParseResult = ref<ParseResult | null>(null)

// Item editing state
export const modifyingList = ref<Array<TaDoneModifyingItem>>([])

// Async status state
export const isLoading = ref(true)
export const isSynching = ref(false)
export const isSignUpWorking = ref(false)
export const isSignInWorking = ref(false)
export const isSignOutWorking = ref(false)
