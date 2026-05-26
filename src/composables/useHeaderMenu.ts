import { isRightSidebarOpened } from '@/stores/appState'

export function useHeaderMenu() {
  const toggleRightSidebar = () => {
    isRightSidebarOpened.value = !isRightSidebarOpened.value
  }

  return {
    isRightSidebarOpened,
    toggleRightSidebar,
  }
}
