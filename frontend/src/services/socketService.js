import { io } from 'socket.io-client'
import { store } from '../store/store'
import { addNotification } from '../store/slices/notificationSlice'
import { addActivity } from '../store/slices/activitySlice'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

let socket = null

export const initializeSocket = (userId) => {
  if (socket) {
    socket.disconnect()
  }

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling']
  })

  socket.on('connect', () => {
    console.log('Socket connected')
    // Authenticate with user ID
    socket.emit('authenticate', { userId })
  })

  socket.on('disconnect', () => {
    console.log('Socket disconnected')
  })

  socket.on('notification', (notification) => {
    store.dispatch(addNotification(notification))
  })

  socket.on('notifications', (notifications) => {
    // Handle batch notifications
    notifications.forEach(notification => {
      if (!notification.isRead) {
        store.dispatch(addNotification(notification))
      }
    })
  })

  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const markNotificationRead = (notificationId) => {
  if (socket) {
    socket.emit('markNotificationRead', { notificationId })
  }
}

export default socket

