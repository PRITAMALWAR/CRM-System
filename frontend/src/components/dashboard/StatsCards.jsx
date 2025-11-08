import './StatsCards.css'

const StatsCards = ({ stats }) => {
  if (!stats) return null

  const cards = [
    {
      title: 'Total Leads',
      value: stats.totalLeads,
      icon: '📊',
      color: '#007bff'
    },
    {
      title: 'Won Leads',
      value: stats.wonLeads,
      icon: '✅',
      color: '#28a745'
    },
    {
      title: 'Total Value',
      value: `$${stats.totalValue.toLocaleString()}`,
      icon: '💰',
      color: '#ffc107'
    },
    {
      title: 'Conversion Rate',
      value: `${stats.conversionRate}%`,
      icon: '📈',
      color: '#17a2b8'
    },
    {
      title: 'Recent Activities',
      value: stats.recentActivities,
      icon: '🔄',
      color: '#6c757d'
    },
    {
      title: 'Leads This Month',
      value: stats.leadsThisMonth,
      icon: '📅',
      color: '#dc3545'
    }
  ]

  return (
    <div className="stats-cards">
      {cards.map((card, index) => (
        <div key={index} className="stat-card" style={{ borderTopColor: card.color }}>
          <div className="stat-card-icon">{card.icon}</div>
          <div className="stat-card-content">
            <div className="stat-card-value">{card.value}</div>
            <div className="stat-card-title">{card.title}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatsCards

