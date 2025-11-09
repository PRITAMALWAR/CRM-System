import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import leadReducer from './slices/leadSlice'
import activityReducer from './slices/activitySlice'
import dashboardReducer from './slices/dashboardSlice'
import notificationReducer from './slices/notificationSlice'
import userReducer from './slices/userSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    leads: leadReducer,
    activities: activityReducer,
    dashboard: dashboardReducer,
    notifications: notificationReducer,
    users: userReducer
  }
})

