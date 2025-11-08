import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { createActivity, fetchActivities } from '../../store/slices/activitySlice'

const ActivityForm = ({ leadId, onClose }) => {
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    type: 'Note',
    title: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await dispatch(createActivity({
        ...formData,
        leadId
      })).unwrap()
      
      dispatch(fetchActivities(leadId))
      onClose()
    } catch (error) {
      console.error('Error creating activity:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Activity</h3>
      <div className="form-group">
        <label>Activity Type *</label>
        <select name="type" value={formData.type} onChange={handleChange} required>
          <option value="Note">Note</option>
          <option value="Call">Call</option>
          <option value="Meeting">Meeting</option>
          <option value="Email">Email</option>
          <option value="Status Change">Status Change</option>
        </select>
      </div>
      <div className="form-group">
        <label>Title *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="e.g., Follow-up call, Meeting scheduled, etc."
        />
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
          placeholder="Add details about this activity..."
        />
      </div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button type="button" onClick={onClose} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Add Activity'}
        </button>
      </div>
    </form>
  )
}

export default ActivityForm

