import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return { headers: { Authorization: `Bearer ${token}` } }
}

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (isRead = null, { rejectWithValue }) => {
    try {
      const url = isRead !== null ? `${API_URL}/notifications?isRead=${isRead}` : `${API_URL}/notifications`
      const response = await axios.get(url, getAuthHeaders())
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications')
    }
  }
)

export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/notifications/${id}/read`, {}, getAuthHeaders())
      return response.data.notification
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark notification as read')
    }
  }
)

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      await axios.put(`${API_URL}/notifications/read-all`, {}, getAuthHeaders())
      return true
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all notifications as read')
    }
  }
)

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/notifications/${id}`, getAuthHeaders())
      return id
    } catch (error) {
      console.error('Delete notification error:', error.response?.data || error.message)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete notification'
      return rejectWithValue(errorMessage)
    }
  }
)

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null
  },
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload)
      state.unreadCount += 1
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.notifications = action.payload
        state.unreadCount = action.payload.filter(n => !n.isRead).length
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Mark notification read
      .addCase(markNotificationRead.pending, (state) => {
        state.loading = true
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        state.loading = false
        const index = state.notifications.findIndex(n => n.id === action.payload.id)
        if (index !== -1) {
          const wasUnread = !state.notifications[index].isRead
          state.notifications[index] = action.payload
          if (wasUnread && action.payload.isRead && state.unreadCount > 0) {
            state.unreadCount -= 1
          }
        }
      })
      .addCase(markNotificationRead.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Mark all read
      .addCase(markAllNotificationsRead.pending, (state) => {
        state.loading = true
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.loading = false
        state.notifications = state.notifications.map(n => ({ ...n, isRead: true }))
        state.unreadCount = 0
      })
      .addCase(markAllNotificationsRead.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete notification
      .addCase(deleteNotification.pending, (state) => {
        state.loading = true
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.loading = false
        const deletedNotification = state.notifications.find(n => n.id === action.payload)
        if (deletedNotification && !deletedNotification.isRead && state.unreadCount > 0) {
          state.unreadCount -= 1
        }
        state.notifications = state.notifications.filter(n => n.id !== action.payload)
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { addNotification, clearError } = notificationSlice.actions
export default notificationSlice.reducer

