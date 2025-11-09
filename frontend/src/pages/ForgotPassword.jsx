import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { forgotPassword, clearError } from '../store/slices/authSlice'
import { toast } from 'react-toastify'
import './Auth.css'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const dispatch = useDispatch()
  const { loading, error } = useSelector((state) => state.auth)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitted(false)
    
    try {
      const result = await dispatch(forgotPassword(email)).unwrap()
      setSubmitted(true)
      toast.success(result.message || 'Password reset email sent!')
    } catch (err) {
      toast.error(err || 'Failed to send reset email')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot Password</h2>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ color: '#28a745', marginBottom: '15px', fontSize: '48px' }}>✓</div>
            <p style={{ marginBottom: '20px' }}>
              If an account with that email exists, a password reset link has been sent.
            </p>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
              Please check your email inbox and follow the instructions to reset your password.
            </p>
            <Link to="/login" className="btn btn-primary">
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <p style={{ color: '#666', marginBottom: '20px', textAlign: 'center' }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your.email@example.com"
                />
              </div>
              {error && <div className="error">{error}</div>}
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            <p className="auth-link">
              Remember your password? <Link to="/login">Login here</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword


