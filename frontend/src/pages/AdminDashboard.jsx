import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users,
  FileCheck,
  AlertTriangle,
  Heart,
  HandCoins,
  Search,
  CheckCircle,
  XCircle,
  LogOut,
  LayoutDashboard,
  ChevronRight,
} from 'lucide-react'
import { Button, Card, StatCard, Badge, Spinner } from '../components/ui'
import { adminAPI } from '../lib/api'
import { timeAgo } from '../lib/utils'

const BRAND_LOGO_SRC = '/WhatsApp%20Image%202026-04-05%20at%201.07.09%20AM.jpeg'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [verifications, setVerifications] = useState([])
  const [reports, setReports] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const navigate = useNavigate()

  const admin = JSON.parse(localStorage.getItem('sahyog_admin') || '{}')

  useEffect(() => {
    if (!localStorage.getItem('sahyog_admin_token')) {
      navigate('/admin/login')
      return
    }
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [dashRes, verRes, repRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getVerifications({ limit: 20 }),
        adminAPI.getReports({ limit: 20 }),
      ])
      setStats(dashRes.data?.data || {})
      setVerifications(verRes.data?.data?.verifications || [])
      setReports(repRes.data?.data?.reports || [])
    } catch (err) {
      console.error(err)
      if (err.response?.status === 401) navigate('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    setActionLoading(id)
    try {
      await adminAPI.approveVerification({
        verificationId: id,
        notes: 'Approved by admin',
      })
      loadData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id) => {
    const notes = prompt('Rejection reason:')
    if (!notes) return
    setActionLoading(id)
    try {
      await adminAPI.rejectVerification({ verificationId: id, notes })
      loadData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReportAction = async (id, action) => {
    const notes =
      action === 'dismissed' ? '' : prompt('Notes (optional):') || ''
    setActionLoading(id)
    try {
      await adminAPI.takeAction({ reportId: id, action, notes })
      loadData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed')
    } finally {
      setActionLoading(null)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('sahyog_admin_token')
    localStorage.removeItem('sahyog_admin')
    navigate('/admin/login')
  }

  if (loading) return <Spinner size="lg" />

  const tabs = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    {
      key: 'verifications',
      label: 'Verifications',
      icon: FileCheck,
      count: verifications.filter((v) => v.status === 'pending').length,
    },
    {
      key: 'reports',
      label: 'Reports',
      icon: AlertTriangle,
      count: reports.filter((r) => r.status === 'pending').length,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src={BRAND_LOGO_SRC}
            alt="SAHYOG Logo"
            className="w-10 h-10 rounded-xl object-cover"
          />
          <div>
            <h1 className="font-heading text-2xl font-bold text-text">
              Admin Panel
            </h1>
            <p className="text-sm text-text-secondary">
              Welcome, {admin.name || 'Admin'}
            </p>
          </div>
        </div>
        <Button variant="ghost" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface rounded-xl border border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
              activeTab === tab.key
                ? 'bg-white shadow-sm text-text'
                : 'text-text-secondary hover:text-text'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            {tab.count > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              icon={Users}
              label="Total Users"
              value={stats?.total_users || 0}
              color="primary"
            />
            <StatCard
              icon={FileCheck}
              label="Pending Verifications"
              value={stats?.pending_verifications || 0}
              color="accent"
            />
            <StatCard
              icon={AlertTriangle}
              label="Pending Reports"
              value={stats?.pending_reports || 0}
              color="danger"
            />
            <StatCard
              icon={Heart}
              label="Active Blood Requests"
              value={stats?.active_blood_requests || 0}
              color="danger"
            />
            <StatCard
              icon={HandCoins}
              label="Active Campaigns"
              value={stats?.active_campaigns || 0}
              color="accent"
            />
            <StatCard
              icon={Search}
              label="Missing Cases"
              value={stats?.active_missing_cases || 0}
              color="secondary"
            />
          </div>
        </div>
      )}

      {/* Verifications */}
      {activeTab === 'verifications' && (
        <div className="space-y-4">
          {verifications.length === 0 ? (
            <Card hover={false}>
              <p className="text-text-muted text-center py-8">
                No verification requests
              </p>
            </Card>
          ) : (
            verifications.map((v) => (
              <Card key={v.id} className="!p-4" hover={false}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-text">{v.user_name}</p>
                      <Badge
                        variant={
                          v.status === 'pending'
                            ? 'urgent'
                            : v.status === 'approved'
                              ? 'success'
                              : 'critical'
                        }
                      >
                        {v.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-text-secondary">
                      Document: {v.document_type} · {v.user_phone}
                    </p>
                    <p className="text-xs text-text-muted">
                      {timeAgo(v.created_at)}
                    </p>
                  </div>
                  {v.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="success"
                        loading={actionLoading === v.id}
                        onClick={() => handleApprove(v.id)}
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        loading={actionLoading === v.id}
                        onClick={() => handleReject(v.id)}
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Reports */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <Card hover={false}>
              <p className="text-text-muted text-center py-8">No reports</p>
            </Card>
          ) : (
            reports.map((r) => (
              <Card key={r.id} className="!p-4" hover={false}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="info">{r.report_type}</Badge>
                      <Badge
                        variant={r.status === 'pending' ? 'urgent' : 'success'}
                      >
                        {r.status}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-text">{r.reason}</p>
                    <p className="text-xs text-text-secondary mt-1">
                      by {r.reporter_name} · {timeAgo(r.created_at)}
                    </p>
                  </div>
                  {r.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="success"
                        loading={actionLoading === r.id}
                        onClick={() => handleReportAction(r.id, 'resolved')}
                      >
                        Resolve
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        loading={actionLoading === r.id}
                        onClick={() => handleReportAction(r.id, 'dismissed')}
                      >
                        Dismiss
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
