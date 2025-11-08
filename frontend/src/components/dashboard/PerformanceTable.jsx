import './PerformanceTable.css'

const PerformanceTable = ({ performance }) => {
  if (!performance || performance.length === 0) {
    return <div className="no-data">No performance data available</div>
  }

  return (
    <div className="performance-table-container">
      <table className="table">
        <thead>
          <tr>
            <th>User</th>
            <th>Total Leads</th>
            <th>Won Leads</th>
            <th>Conversion Rate</th>
            <th>Total Value</th>
            <th>Won Value</th>
          </tr>
        </thead>
        <tbody>
          {performance.map((perf) => (
            <tr key={perf.userId}>
              <td>
                <div>
                  <div className="user-name">{perf.userName}</div>
                  <div className="user-email">{perf.userEmail}</div>
                </div>
              </td>
              <td>{perf.totalLeads}</td>
              <td>{perf.wonLeads}</td>
              <td>
                <span className={`conversion-rate ${perf.conversionRate >= 20 ? 'high' : perf.conversionRate >= 10 ? 'medium' : 'low'}`}>
                  {perf.conversionRate}%
                </span>
              </td>
              <td>${perf.totalValue.toLocaleString()}</td>
              <td>${perf.wonValue.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default PerformanceTable

