import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion as Motion } from 'framer-motion'
import {
  Heart,
  HandCoins,
  Search,
  MapPin,
  Shield,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { StatCard, Card, Badge, Spinner } from '../components/ui'
import { bloodAPI, fundAPI, missingAPI, reportAPI, userAPI } from '../lib/api'
import { timeAgo, formatCurrency, getTrustScoreColor } from '../lib/utils'

export default function Dashboard() {
  const { user } = useAuth()
  const { on } = useSocket()
  const [recentRequests, setRecentRequests] = useState([])
  const [recentCampaigns, setRecentCampaigns] = useState([])
  const [recentMissing, setRecentMissing] = useState([])
  const [communityStats, setCommunityStats] = useState(
    user?.community_stats || null
  )
  const [loading, setLoading] = useState(true)

  const loadActiveReports = useCallback(async () => {
    try {
      const { data } = await reportAPI.getActiveCount()
      const activeReports = data?.data?.active_reports || 0
      setCommunityStats((prev) => ({
        ...(prev || {}),
        active_reports: activeReports,
      }))
    } catch (err) {
      console.error('Active reports refresh error:', err)
    }
  }, [])

  const loadData = useCallback(async () => {
    try {
      const [reqRes, campRes, missRes, profileRes, activeReportsRes] =
        await Promise.all([
          bloodAPI.getRequests({ limit: 5 }),
          fundAPI.listCampaigns({ limit: 5 }),
          missingAPI.list({ limit: 5 }),
          userAPI.getProfile(),
          reportAPI.getActiveCount(),
        ])
      setRecentRequests(reqRes.data?.data?.requests || [])
      setRecentCampaigns(campRes.data?.data?.campaigns || [])
      setRecentMissing(missRes.data?.data?.missing_persons || [])
      const baseStats = profileRes.data?.data?.community_stats || null
      const activeReports = activeReportsRes.data?.data?.active_reports || 0
      setCommunityStats({ ...(baseStats || {}), active_reports: activeReports })
    } catch (err) {
      console.error('Dashboard load error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Keep active reports card fresh even if socket event is delayed.
  useEffect(() => {
    const timer = setInterval(() => {
      loadActiveReports()
    }, 5000)

    const refreshOnFocus = () => loadActiveReports()
    window.addEventListener('focus', refreshOnFocus)

    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', refreshOnFocus)
    }
  }, [loadActiveReports])

  // ── Real-time: refresh dashboard on any action ──
  useEffect(() => {
    const unsubs = [
      on('dashboard:refresh', () => {
        loadData()
      }),
      on('report:refresh', () => {
        loadActiveReports()
      }),
    ]

    return () => {
      unsubs.forEach((unsub) => unsub && unsub())
    }
  }, [on, loadData, loadActiveReports])

  if (loading) return <Spinner size="lg" />

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text">
              Welcome back, {user?.name || 'User'} 👋
            </h1>
            <p className="text-text-secondary mt-1">
              Here's what's happening in your community
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/10">
            <Shield className="h-4 w-4 text-secondary" />
            <span
              className={`font-bold ${getTrustScoreColor(user?.trust_score || 50)}`}
            >
              Trust: {user?.trust_score || 50}/100
            </span>
            {user?.is_verified && <Badge variant="success">Verified</Badge>}
          </div>
        </div>
      </Motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Heart}
          label="Blood Donations"
          value={communityStats?.blood_donations || 0}
          color="danger"
        />
        <StatCard
          icon={HandCoins}
          label="Funds Raised"
          value={formatCurrency(communityStats?.total_funds_raised || 0)}
          color="accent"
        />
        <StatCard
          icon={AlertTriangle}
          label="Active Reports"
          value={communityStats?.active_reports || 0}
          color="secondary"
        />
        <StatCard
          icon={TrendingUp}
          label="Campaigns"
          value={communityStats?.campaigns_created || 0}
          color="success"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            to: '/blood',
            icon: Heart,
            label: 'Donate Blood',
            color: 'from-red-500 to-rose-600',
          },
          {
            to: '/fund',
            icon: HandCoins,
            label: 'Start Campaign',
            color: 'from-amber-500 to-orange-600',
          },
          {
            to: '/missing',
            icon: Search,
            label: 'Report Missing',
            color: 'from-blue-500 to-indigo-600',
          },
          {
            to: '/map',
            icon: MapPin,
            label: 'View Map',
            color: 'from-green-500 to-emerald-600',
          },
        ].map((action) => (
          <Link key={action.to} to={action.to}>
            <Motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`p-5 rounded-2xl bg-gradient-to-br ${action.color} text-white flex items-center gap-4 cursor-pointer shadow-lg`}
            >
              <action.icon className="h-8 w-8" />
              <span className="font-semibold text-lg">{action.label}</span>
            </Motion.div>
          </Link>
        ))}
      </div>

      {/* Recent Activity Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Blood Requests */}
        <Card hover={false}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-text flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Active Blood Requests
            </h3>
            <Link to="/blood" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentRequests.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-4">
                No active requests
              </p>
            ) : (
              recentRequests.slice(0, 4).map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-bg"
                >
                  <div>
                    <p className="text-sm font-semibold text-text">
                      {req.patient_name}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {req.hospital_name || req.city}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={req.urgency}>{req.blood_group}</Badge>
                    <p className="text-xs text-text-muted mt-1">
                      {timeAgo(req.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Campaigns */}
        <Card hover={false}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-text flex items-center gap-2">
              <HandCoins className="h-5 w-5 text-accent" />
              Active Campaigns
            </h3>
            <Link to="/fund" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentCampaigns.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-4">
                No active campaigns
              </p>
            ) : (
              recentCampaigns.slice(0, 4).map((camp) => (
                <div key={camp.id} className="p-3 rounded-xl bg-bg">
                  <p className="text-sm font-semibold text-text truncate">
                    {camp.title}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className="bg-gradient-to-r from-accent to-amber-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min(camp.progress_percentage || 0, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-text-secondary whitespace-nowrap">
                      {Math.round(camp.progress_percentage || 0)}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Missing */}
        <Card hover={false}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-text flex items-center gap-2">
              <Search className="h-5 w-5 text-secondary" />
              Missing Persons
            </h3>
            <Link
              to="/missing"
              className="text-xs text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentMissing.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-4">
                No active cases
              </p>
            ) : (
              recentMissing.slice(0, 4).map((mp) => (
                <div
                  key={mp.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-bg"
                >
                  <div>
                    <p className="text-sm font-semibold text-text">{mp.name}</p>
                    <p className="text-xs text-text-secondary">
                      {mp.city || 'Unknown'}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={mp.urgency}>{mp.urgency}</Badge>
                    <p className="text-xs text-text-muted mt-1">
                      {mp.sighting_count || 0} sightings
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
