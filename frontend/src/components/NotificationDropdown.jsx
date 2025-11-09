import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import { 
  fetchNotifications, 
  markNotificationRead, 
  markAllNotificationsRead,
  deleteNotification
} from '../store/slices/notificationSlice'
import './NotificationDropdown.css'

const NotificationDropdown = ({ isOpen, onClose }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const dropdownRef = useRef(null)
  const { notifications, unreadCount, loading } = useSelector((state) => state.notifications)

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchNotifications())
    }
  }, [isOpen, dispatch])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await dispatch(markNotificationRead(notification.id))
    }
    
    if (notification.leadId) {
      navigate(`/leads/${notification.leadId}`)
      onClose()
    }
  }

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this notification?')) {
      const result = await dispatch(deleteNotification(notificationId))
      if (deleteNotification.fulfilled.match(result)) {
        toast.success('Notification deleted successfully')
      } else {
        toast.error(result.payload || 'Failed to delete notification')
      }
    }
  }

  const handleMarkAllRead = async () => {
    await dispatch(markAllNotificationsRead())
  }

  const getNotificationIcon = (type) => {
    const icons = {
      'Lead Assigned': '👤',
      'Status Changed': '🔄',
      'New Activity': '📝',
      'Follow-up Reminder': '⏰',
      'System': '🔔'
    }
    return icons[type] || '🔔'
  }

  if (!isOpen) return null

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      <div className="notification-dropdown-header">
        <h3>Notifications</h3>
        {unreadCount > 0 && (
          <button 
            className="mark-all-read-btn"
            onClick={handleMarkAllRead}
            disabled={loading}
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="notification-dropdown-content">
        {loading ? (
          <div className="notification-loading">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="notification-empty">
            <span className="notification-empty-icon">🔔</span>
            <p>No notifications</p>
          </div>
        ) : (
          <div className="notification-list">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-item-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-item-content">
                  <div className="notification-item-header">
                    <h4>{notification.title}</h4>
                    <div className="notification-item-actions">
                      {!notification.isRead && <span className="notification-dot"></span>}
                      <button
                        className="notification-delete-btn"
                        onClick={(e) => handleDeleteNotification(e, notification.id)}
                        aria-label="Delete notification"
                        title="Delete notification"
                      >
                        <svg 
                          width="16" 
                          height="16" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="notification-item-message">{notification.message}</p>
                  <span className="notification-item-time">
                    {format(new Date(notification.createdAt), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationDropdown

