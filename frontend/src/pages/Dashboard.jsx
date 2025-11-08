import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDashboardStats, fetchTimeline, fetchPerformance } from '../store/slices/dashboardSlice'
import { fetchNotifications } from '../store/slices/notificationSlice'
import StatsCards from '../components/dashboard/StatsCards'
import LeadsChart from '../components/dashboard/LeadsChart'
import ActivityTimeline from '../components/dashboard/ActivityTimeline'
import PerformanceTable from '../components/dashboard/PerformanceTable'
import './Dashboard.css'

const Dashboard = () => {
  const dispatch = useDispatch()
  const { stats, timeline, performance, loading } = useSelector((state) => state.dashboard)
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(fetchDashboardStats())
    dispatch(fetchTimeline(10))
    if (user?.role === 'Admin' || user?.role === 'Manager') {
      dispatch(fetchPerformance())
    }
    dispatch(fetchNotifications(false))
  }, [dispatch, user])

  if (loading && !stats) {
    return <div className="loading">Loading dashboard...</div>
  }

  return (
    <div className="container">
      <h1>Dashboard</h1>
      <StatsCards stats={stats} />
      <div className="dashboard-grid">
        <div className="dashboard-section">
          <h2>Leads Overview</h2>
          <LeadsChart stats={stats} />
        </div>
        <div className="dashboard-section">
          <h2>Recent Activity</h2>
          <ActivityTimeline timeline={timeline} />
        </div>
      </div>
      {(user?.role === 'Admin' || user?.role === 'Manager') && performance.length > 0 && (
        <div className="dashboard-section">
          <h2>Team Performance</h2>
          <PerformanceTable performance={performance} />
        </div>
      )}
    </div>
  )
}

export default Dashboard

