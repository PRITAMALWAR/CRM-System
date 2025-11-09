import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/slices/authSlice'
import { disconnectSocket } from '../services/socketService'
import NotificationDropdown from './NotificationDropdown'
import './Navbar.css'

const Navbar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const { unreadCount } = useSelector((state) => state.notifications)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false)
  const menuRef = useRef(null)
  const notificationRef = useRef(null)

  const handleLogout = () => {
    disconnectSocket()
    dispatch(logout())
    navigate('/login')
    setMobileMenuOpen(false)
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  const handleNotificationClick = (e) => {
    e.stopPropagation()
    setNotificationDropdownOpen(!notificationDropdownOpen)
    setMobileMenuOpen(false)
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        // Check if click is on mobile menu toggle
        if (!event.target.closest('.mobile-menu-toggle')) {
          setMobileMenuOpen(false)
        }
      }
      // Close notification dropdown if clicking outside
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        if (!event.target.closest('.notification-icon-wrapper')) {
          setNotificationDropdownOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <Link to={isAuthenticated ? "/dashboard" : "/"} className="navbar-brand" onClick={() => setMobileMenuOpen(false)}>
            CRM System
          </Link>
          
          {/* Desktop Menu - Only show when authenticated */}
          {isAuthenticated && (
            <div className="navbar-menu-desktop">
              <Link 
                to="/dashboard" 
                className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}
              >
                Dashboard
              </Link>
              <Link 
                to="/leads" 
                className={`navbar-link ${isActive('/leads') || location.pathname.startsWith('/leads/') ? 'active' : ''}`}
              >
                Leads
              </Link>
              {user?.role === 'Admin' && (
                <Link 
                  to="/users" 
                  className={`navbar-link ${isActive('/users') ? 'active' : ''}`}
                >
                  Users
                </Link>
              )}
            </div>
          )}

          {/* Right side items */}
          <div className="navbar-right">
            {isAuthenticated ? (
              <>
                {/* Notification Bell Icon */}
                <div 
                  className="notification-icon-wrapper"
                  onClick={handleNotificationClick}
                  ref={notificationRef}
                >
                  <svg 
                    className="notification-bell-icon" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                  )}
                  {notificationDropdownOpen && (
                    <NotificationDropdown 
                      isOpen={notificationDropdownOpen}
                      onClose={() => setNotificationDropdownOpen(false)}
                    />
                  )}
                </div>

                {/* User info - Desktop */}
                <div className="navbar-user-desktop">
                  <svg 
                    className="navbar-user-icon" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span className="navbar-user-name">{user?.name}</span>
                  <span className="navbar-user-role">{user?.role}</span>
                </div>

                {/* Logout Button - Desktop */}
                <button 
                  onClick={handleLogout} 
                  className="navbar-btn navbar-btn-logout"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* Login and Signup Buttons - Desktop */}
                <Link 
                  to="/login" 
                  className={`navbar-btn navbar-btn-login ${isActive('/login') ? 'active' : ''}`}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className={`navbar-btn navbar-btn-signup ${isActive('/register') ? 'active' : ''}`}
                >
                  Sign Up
                </Link>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="mobile-menu-overlay"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* Mobile Menu Sidebar */}
      <div 
        className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}
        ref={menuRef}
      >
        <div className="mobile-menu-header">
          {isAuthenticated ? (
            <div className="mobile-user-info">
              <div className="mobile-user-avatar">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="mobile-user-name">{user?.name}</div>
                <div className="mobile-user-role">{user?.role}</div>
              </div>
            </div>
          ) : (
            <div className="mobile-user-info">
              <div className="mobile-user-avatar">
                👤
              </div>
              <div>
                <div className="mobile-user-name">Guest</div>
                <div className="mobile-user-role">Not logged in</div>
              </div>
            </div>
          )}
          <button 
            className="mobile-menu-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <nav className="mobile-menu-nav">
          {isAuthenticated ? (
            <>
              <Link 
                to="/dashboard" 
                className={`mobile-menu-link ${isActive('/dashboard') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="mobile-menu-icon">📊</span>
                <span>Dashboard</span>
              </Link>
              <Link 
                to="/leads" 
                className={`mobile-menu-link ${isActive('/leads') || location.pathname.startsWith('/leads/') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="mobile-menu-icon">👥</span>
                <span>Leads</span>
              </Link>
              {user?.role === 'Admin' && (
                <Link 
                  to="/users" 
                  className={`mobile-menu-link ${isActive('/users') ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="mobile-menu-icon">👤</span>
                  <span>Users</span>
                </Link>
              )}
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className={`mobile-menu-link ${isActive('/login') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="mobile-menu-icon">🔐</span>
                <span>Login</span>
              </Link>
              <Link 
                to="/register" 
                className={`mobile-menu-link ${isActive('/register') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="mobile-menu-icon">📝</span>
                <span>Sign Up</span>
              </Link>
            </>
          )}
        </nav>

        <div className="mobile-menu-footer">
          {isAuthenticated ? (
            <button 
              onClick={handleLogout} 
              className="mobile-logout-btn"
            >
              <span className="mobile-menu-icon">🚪</span>
              <span>Logout</span>
            </button>
          ) : null}
        </div>
      </div>
    </>
  )
}

export default Navbar

