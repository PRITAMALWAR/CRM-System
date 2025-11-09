import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { resetPassword, clearError } from '../store/slices/authSlice'
import { toast } from 'react-toastify'
import './Auth.css'

const ResetPassword = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [passwordError, setPasswordError] = useState('')
  const { loading, error } = useSelector((state) => state.auth)

  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setPasswordError('')
  }

  const validatePassword = () => {
    if (formData.password.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validatePassword()) {
      return
    }

    try {
      const result = await dispatch(resetPassword({ token, password: formData.password })).unwrap()
      toast.success(result.message || 'Password reset successfully!')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      toast.error(err || 'Failed to reset password')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Reset Password</h2>
        <p style={{ color: '#666', marginBottom: '20px', textAlign: 'center' }}>
          Enter your new password below.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="Enter new password"
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="Confirm new password"
            />
          </div>
          {(error || passwordError) && (
            <div className="error">{error || passwordError}</div>
          )}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        <p className="auth-link">
          <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  )
}

export default ResetPassword


