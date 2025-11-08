import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { toast } from 'react-toastify'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return { headers: { Authorization: `Bearer ${token}` } }
}

// Async thunks
export const fetchActivities = createAsyncThunk(
  'activities/fetchActivities',
  async (leadId = null, { rejectWithValue }) => {
    try {
      const url = leadId ? `${API_URL}/activities?leadId=${leadId}` : `${API_URL}/activities`
      const response = await axios.get(url, getAuthHeaders())
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch activities')
    }
  }
)

export const createActivity = createAsyncThunk(
  'activities/createActivity',
  async (activityData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/activities`, activityData, getAuthHeaders())
      toast.success('Activity created successfully')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create activity'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const updateActivity = createAsyncThunk(
  'activities/updateActivity',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/activities/${id}`, data, getAuthHeaders())
      toast.success('Activity updated successfully')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update activity'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const deleteActivity = createAsyncThunk(
  'activities/deleteActivity',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/activities/${id}`, getAuthHeaders())
      toast.success('Activity deleted successfully')
      return id
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete activity'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

const activitySlice = createSlice({
  name: 'activities',
  initialState: {
    activities: [],
    loading: false,
    error: null
  },
  reducers: {
    addActivity: (state, action) => {
      state.activities.unshift(action.payload)
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch activities
      .addCase(fetchActivities.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.loading = false
        state.activities = action.payload
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create activity
      .addCase(createActivity.fulfilled, (state, action) => {
        state.activities.unshift(action.payload)
      })
      // Update activity
      .addCase(updateActivity.fulfilled, (state, action) => {
        const index = state.activities.findIndex(activity => activity.id === action.payload.id)
        if (index !== -1) {
          state.activities[index] = action.payload
        }
      })
      // Delete activity
      .addCase(deleteActivity.fulfilled, (state, action) => {
        state.activities = state.activities.filter(activity => activity.id !== action.payload)
      })
  }
})

export const { addActivity, clearError } = activitySlice.actions
export default activitySlice.reducer

