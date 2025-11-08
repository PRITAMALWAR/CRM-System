import { format } from 'date-fns'
import { Link } from 'react-router-dom'
import './ActivityTimeline.css'

const ActivityTimeline = ({ timeline }) => {
  if (!timeline || timeline.length === 0) {
    return <div className="no-data">No recent activities</div>
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

  return (
    <div className="activity-timeline">
      {timeline.map((activity) => (
        <div key={activity.id} className="timeline-item">
          <div className="timeline-icon">{getActivityIcon(activity.type)}</div>
          <div className="timeline-content">
            <div className="timeline-header">
              <span className="timeline-title">{activity.title}</span>
              <span className="timeline-date">
                {format(new Date(activity.createdAt), 'MMM dd, yyyy HH:mm')}
              </span>
            </div>
            {activity.description && (
              <div className="timeline-description">{activity.description}</div>
            )}
            <div className="timeline-meta">
              <span className="timeline-user">by {activity.user?.name}</span>
              {activity.lead && (
                <Link to={`/leads/${activity.lead.id}`} className="timeline-lead">
                  {activity.lead.firstName} {activity.lead.lastName}
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ActivityTimeline

