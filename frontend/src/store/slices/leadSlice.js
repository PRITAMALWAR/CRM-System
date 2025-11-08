import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { toast } from 'react-toastify'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return { headers: { Authorization: `Bearer ${token}` } }
}

// Async thunks
export const fetchLeads = createAsyncThunk(
  'leads/fetchLeads',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams(filters).toString()
      const response = await axios.get(`${API_URL}/leads?${params}`, getAuthHeaders())
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leads')
    }
  }
)

export const fetchLead = createAsyncThunk(
  'leads/fetchLead',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/leads/${id}`, getAuthHeaders())
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch lead')
    }
  }
)

export const createLead = createAsyncThunk(
  'leads/createLead',
  async (leadData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/leads`, leadData, getAuthHeaders())
      toast.success('Lead created successfully')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create lead'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const updateLead = createAsyncThunk(
  'leads/updateLead',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/leads/${id}`, data, getAuthHeaders())
      toast.success('Lead updated successfully')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update lead'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const deleteLead = createAsyncThunk(
  'leads/deleteLead',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/leads/${id}`, getAuthHeaders())
      toast.success('Lead deleted successfully')
      return id
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete lead'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

const leadSlice = createSlice({
  name: 'leads',
  initialState: {
    leads: [],
    currentLead: null,
    loading: false,
    error: null
  },
  reducers: {
    clearCurrentLead: (state) => {
      state.currentLead = null
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch leads
      .addCase(fetchLeads.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.loading = false
        state.leads = action.payload
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch lead
      .addCase(fetchLead.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchLead.fulfilled, (state, action) => {
        state.loading = false
        state.currentLead = action.payload
      })
      .addCase(fetchLead.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create lead
      .addCase(createLead.fulfilled, (state, action) => {
        state.leads.unshift(action.payload)
      })
      // Update lead
      .addCase(updateLead.fulfilled, (state, action) => {
        const index = state.leads.findIndex(lead => lead.id === action.payload.id)
        if (index !== -1) {
          state.leads[index] = action.payload
        }
        if (state.currentLead?.id === action.payload.id) {
          state.currentLead = action.payload
        }
      })
      // Delete lead
      .addCase(deleteLead.fulfilled, (state, action) => {
        state.leads = state.leads.filter(lead => lead.id !== action.payload)
        if (state.currentLead?.id === action.payload) {
          state.currentLead = null
        }
      })
  }
})

export const { clearCurrentLead, clearError } = leadSlice.actions
export default leadSlice.reducer

