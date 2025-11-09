import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchLeads, deleteLead } from '../store/slices/leadSlice'
import LeadForm from '../components/leads/LeadForm'
import './Leads.css'

const Leads = () => {
  const dispatch = useDispatch()
  const { leads, loading } = useSelector((state) => state.leads)
  const { user } = useSelector((state) => state.auth)
  const [showForm, setShowForm] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  })

  useEffect(() => {
    dispatch(fetchLeads(filters))
  }, [dispatch, filters])

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    })
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      dispatch(deleteLead(id))
    }
  }

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

  return (
    <div className="container">
      <div className="page-header">
        <h1>Leads</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          {showForm ? 'Cancel' : '+ Add Lead'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <LeadForm onClose={() => setShowForm(false)} />
        </div>
      )}

      <div className="card">
        <div className="filters">
          <input
            type="text"
            name="search"
            placeholder="Search leads..."
            value={filters.search}
            onChange={handleFilterChange}
            className="form-control"
          />
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="form-control"
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Proposal">Proposal</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
          </select>
        </div>

        {loading ? (
          <div className="loading">Loading leads...</div>
        ) : leads.length === 0 ? (
          <div className="no-data">No leads found</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Company</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Value</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td data-label="Name">
                    <Link to={`/leads/${lead.id}`} className="lead-link">
                      {lead.firstName} {lead.lastName}
                    </Link>
                  </td>
                  <td data-label="Email">{lead.email}</td>
                  <td data-label="Company">{lead.company || '-'}</td>
                  <td data-label="Status">
                    <span className={`badge ${getStatusBadgeClass(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td data-label="Assigned To">{lead.assignedTo?.name || '-'}</td>
                  <td data-label="Value">${lead.estimatedValue || 0}</td>
                  <td data-label="Actions">
                    <Link to={`/leads/${lead.id}`} className="btn btn-sm btn-primary">
                      View
                    </Link>
                    {/* Show delete button: Admin/Manager can delete any lead, Sales Executive can only delete their assigned leads */}
                    {(user?.role === 'Admin' || user?.role === 'Manager' || lead.assignedToId === user?.id) && (
                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="btn btn-sm btn-danger"
                        style={{ marginLeft: '5px' }}
                      >
                        Delete
                      </button>
                    )}
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

export default Leads

