import { ref } from 'vue'

export function useHeaderMenu() {
  const isRightSidebarOpened = ref(false)
  const toggleRightSidebar = () => {
    isRightSidebarOpened.value = !isRightSidebarOpened.value
  }

  return {
    isRightSidebarOpened,
    toggleRightSidebar,
  }
}
