import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

const LeadsChart = ({ stats }) => {
  if (!stats || !stats.leadsByStatus) return <div>No data available</div>

  const statusColors = {
    'New': '#007bff',
    'Contacted': '#17a2b8',
    'Qualified': '#ffc107',
    'Proposal': '#fd7e14',
    'Negotiation': '#6f42c1',
    'Won': '#28a745',
    'Lost': '#dc3545'
  }

  const pieData = Object.entries(stats.leadsByStatus).map(([status, count]) => ({
    name: status,
    value: count
  }))

  const barData = Object.entries(stats.leadsBySource || {}).map(([source, count]) => ({
    name: source,
    value: count
  }))

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h3>Leads by Status</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={statusColors[entry.name] || '#8884d8'} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {barData.length > 0 && (
        <div>
          <h3>Leads by Source</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default LeadsChart

