import { format } from 'date-fns'
import { useDispatch } from 'react-redux'
import { deleteActivity, fetchActivities } from '../../store/slices/activitySlice'
import './ActivityList.css'

const ActivityList = ({ activities, leadId }) => {
  const dispatch = useDispatch()

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      dispatch(deleteActivity(id)).then(() => {
        dispatch(fetchActivities(leadId))
      })
    }
  }

  const getActivityIcon = (type) => {
    const icons = {
      'Note': '📝',
      'Call': '📞',
      'Meeting': '🤝',
      'Email': '✉️',
      'Status Change': '🔄'
    }
    return icons[type] || '📌'
  }

  if (!activities || activities.length === 0) {
    return <div className="no-data">No activities yet</div>
  }

  return (
    <div className="activity-list">
      {activities.map((activity) => (
        <div key={activity.id} className="activity-item">
          <div className="activity-icon">{getActivityIcon(activity.type)}</div>
          <div className="activity-content">
            <div className="activity-header">
              <span className="activity-title">{activity.title}</span>
              <span className="activity-date">
                {format(new Date(activity.createdAt), 'MMM dd, yyyy HH:mm')}
              </span>
            </div>
            {activity.description && (
              <div className="activity-description">{activity.description}</div>
            )}
            <div className="activity-meta">
              <span className="activity-user">by {activity.user?.name}</span>
              <button
                onClick={() => handleDelete(activity.id)}
                className="btn btn-sm btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ActivityList

