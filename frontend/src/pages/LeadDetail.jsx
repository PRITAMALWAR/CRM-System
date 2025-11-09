import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchLead, updateLead } from '../store/slices/leadSlice'
import { fetchActivities, createActivity } from '../store/slices/activitySlice'
import LeadForm from '../components/leads/LeadForm'
import ActivityForm from '../components/activities/ActivityForm'
import ActivityList from '../components/activities/ActivityList'
import './LeadDetail.css'

const LeadDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentLead, loading } = useSelector((state) => state.leads)
  const { activities } = useSelector((state) => state.activities)
  const { user } = useSelector((state) => state.auth)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showActivityForm, setShowActivityForm] = useState(false)
  
  // Check if user can edit this lead
  const canEdit = user?.role === 'Admin' || user?.role === 'Manager' || currentLead?.assignedToId === user?.id

  useEffect(() => {
    dispatch(fetchLead(id))
    dispatch(fetchActivities(id))
  }, [dispatch, id])

  const getStatusBadgeClass = (status) => {
    const classes = {
      'New': 'badge-primary',
      'Contacted': 'badge-info',
      'Qualified': 'badge-warning',
      'Proposal': 'badge-warning',
      'Negotiation': 'badge-warning',
      'Won': 'badge-success',
      'Lost': 'badge-danger'
    }
    return classes[status] || 'badge-primary'
  }

  if (loading && !currentLead) {
    return <div className="loading">Loading lead details...</div>
  }

  if (!currentLead) {
    return <div className="error">Lead not found</div>
  }

  return (
    <div className="container">
      <div className="page-header">
        <button onClick={() => navigate('/leads')} className="btn btn-secondary">
          ← Back to Leads
        </button>
        <div>
          {canEdit && (
            <button onClick={() => setShowEditForm(!showEditForm)} className="btn btn-primary">
              {showEditForm ? 'Cancel' : 'Edit Lead'}
            </button>
          )}
          {canEdit && (
            <button
              onClick={() => setShowActivityForm(!showActivityForm)}
              className="btn btn-success"
              style={{ marginLeft: '10px' }}
            >
              + Add Activity
            </button>
          )}
        </div>
      </div>

      {showEditForm && (
        <div className="card">
          <LeadForm lead={currentLead} onClose={() => setShowEditForm(false)} />
        </div>
      )}

      {showActivityForm && (
        <div className="card">
          <ActivityForm
            leadId={id}
            onClose={() => setShowActivityForm(false)}
          />
        </div>
      )}

      <div className="lead-detail-grid">
        <div className="card">
          <h2>Lead Information</h2>
          <div className="lead-info">
            <div className="info-row">
              <span className="info-label">Name:</span>
              <span className="info-value">
                {currentLead.firstName} {currentLead.lastName}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">{currentLead.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Phone:</span>
              <span className="info-value">{currentLead.phone || '-'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Company:</span>
              <span className="info-value">{currentLead.company || '-'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Status:</span>
              <span className={`badge ${getStatusBadgeClass(currentLead.status)}`}>
                {currentLead.status}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Source:</span>
              <span className="info-value">{currentLead.source || '-'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Estimated Value:</span>
              <span className="info-value">${currentLead.estimatedValue || 0}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Assigned To:</span>
              <span className="info-value">
                {currentLead.assignedTo?.name || 'Unassigned'}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Created By:</span>
              <span className="info-value">{currentLead.createdBy?.name || '-'}</span>
            </div>
            {currentLead.notes && (
              <div className="info-row">
                <span className="info-label">Notes:</span>
                <span className="info-value">{currentLead.notes}</span>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h2>Activity Timeline</h2>
          <ActivityList activities={activities} leadId={id} />
        </div>
      </div>
    </div>
  )
}

export default LeadDetail

