import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUsers } from '../store/slices/userSlice'
import axios from 'axios'
import { toast } from 'react-toastify'
import './Users.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return { headers: { Authorization: `Bearer ${token}` } }
}

const Users = () => {
  const dispatch = useDispatch()
  const { user: currentUser } = useSelector((state) => state.auth)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Sales Executive'
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/users`, getAuthHeaders())
      setUsers(response.data)
    } catch (error) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_URL}/users`, formData, getAuthHeaders())
      toast.success('User created successfully')
      setShowForm(false)
      setFormData({ name: '', email: '', password: '', role: 'Sales Executive' })
      loadUsers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user')
    }
  }

  const handleUpdateUser = async (e) => {
    e.preventDefault()
    try {
      const updateData = { ...formData }
      if (!updateData.password) {
        delete updateData.password
      }
      await axios.put(`${API_URL}/users/${editingUser.id}`, updateData, getAuthHeaders())
      toast.success('User updated successfully')
      setEditingUser(null)
      setFormData({ name: '', email: '', password: '', role: 'Sales Executive' })
      loadUsers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user')
    }
  }

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return
    }
    try {
      await axios.delete(`${API_URL}/users/${id}`, getAuthHeaders())
      toast.success('User deleted successfully')
      loadUsers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user')
    }
  }

  const startEdit = (user) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role
    })
    setShowForm(true)
  }

  const cancelEdit = () => {
    setEditingUser(null)
    setShowForm(false)
    setFormData({ name: '', email: '', password: '', role: 'Sales Executive' })
  }

  // Only Admin can access this page
  if (currentUser?.role !== 'Admin') {
    return (
      <div className="container">
        <div className="error">Access denied. Admin access required.</div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>User Management</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          {showForm ? 'Cancel' : '+ Add User'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h3>{editingUser ? 'Edit User' : 'Create New User'}</h3>
          <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser}>
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Password {editingUser ? '(leave blank to keep current)' : '*'}</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingUser}
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label>Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
              >
                <option value="Sales Executive">Sales Executive</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button type="button" onClick={cancelEdit} className="btn btn-secondary" style={{ flex: '1 1 auto', minWidth: '120px' }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: '1 1 auto', minWidth: '120px' }}>
                {editingUser ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="loading">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="no-data">No users found</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td data-label="Name">{user.name}</td>
                  <td data-label="Email">{user.email}</td>
                  <td data-label="Role">
                    <span className={`badge badge-${user.role === 'Admin' ? 'danger' : user.role === 'Manager' ? 'warning' : 'info'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td data-label="Status">
                    <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td data-label="Actions">
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => startEdit(user)}
                        className="btn btn-sm btn-primary"
                      >
                        Edit
                      </button>
                      {user.id !== currentUser.id && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="btn btn-sm btn-danger"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Users

