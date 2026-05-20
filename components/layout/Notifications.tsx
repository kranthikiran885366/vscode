'use client'

import { useUIStore } from '@/lib/store/useAppStore'
import { useEffect } from 'react'

export default function Notifications() {
  const { notifications, removeNotification } = useUIStore()

  useEffect(() => {
    const timers = notifications.map((notification) =>
      setTimeout(() => removeNotification(notification.id), 5000)
    )

    return () => timers.forEach(clearTimeout)
  }, [notifications, removeNotification])

  return (
    <div className="fixed bottom-4 right-4 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`rounded-lg p-4 text-white shadow-lg ${
            notification.type === 'success'
              ? 'bg-green-500'
              : notification.type === 'error'
                ? 'bg-red-500'
                : notification.type === 'warning'
                  ? 'bg-yellow-500'
                  : 'bg-blue-500'
          }`}
        >
          {notification.message}
        </div>
      ))}
    </div>
  )
}
