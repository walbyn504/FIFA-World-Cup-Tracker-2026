export type NotifyType = 'success' | 'error'

interface Notification {
  id: number
  type: NotifyType
  title: string
  message: string
  duration: number
}

const notifications = ref<Notification[]>([])
let nextId = 0

export const useNotify = () => {
  const push = (type: NotifyType, title: string, message: string, duration = 4000) => {
    const id = nextId++
    notifications.value.push({ id, type, title, message, duration })

    setTimeout(() => {
      notifications.value = notifications.value.filter((n) => n.id !== id)
    }, duration)
  }

  const success = (message: string, title = 'Listo', duration?: number) =>
    push('success', title, message, duration)

  const error = (message: string, title = 'Algo salió mal', duration?: number) =>
    push('error', title, message, duration)

  const dismiss = (id: number) => {
    notifications.value = notifications.value.filter((n) => n.id !== id)
  }

  return { notifications: readonly(notifications), success, error, dismiss }
}