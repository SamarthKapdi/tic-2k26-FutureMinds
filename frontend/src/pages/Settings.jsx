import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Settings as SettingsIcon,
  MapPin,
  Heart,
  Search,
  HandCoins,
  Save,
  Bell,
  User,
  Mail,
  Phone,
  Building,
  Map,
  Home,
  Camera,
} from 'lucide-react'
import { Card, Button, Spinner } from '../components/ui'
import { userAPI } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import toast from 'react-hot-toast'

export default function Settings() {
  const { user, updateUser } = useAuth()
  const { notificationPermission, requestNotificationPermission } = useSocket()
  const [activeTab, setActiveTab] = useState('profile')
  const [settings, setSettings] = useState(null)
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    address: '',
    avatar_url: '',
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreviewUrl('')
      return
    }

    const localUrl = URL.createObjectURL(avatarFile)
    setAvatarPreviewUrl(localUrl)
    return () => URL.revokeObjectURL(localUrl)
  }, [avatarFile])

  useEffect(() => {
    ;(async () => {
      try {
        const [profileRes, settingsRes] = await Promise.all([
          userAPI.getProfile(),
          userAPI.getSettings(),
        ])
        if (profileRes.data.success) {
          const u = profileRes.data.data.user
          setProfile({
            name: u.name || '',
            email: u.email || '',
            phone: u.phone || '',
            city: u.city || '',
            state: u.state || '',
            address: u.address || '',
            avatar_url: u.avatar_url || '',
          })
        }
        if (settingsRes.data.success) {
          setSettings(settingsRes.data.data.settings)
        }
      } catch {
        /* silent */
      }
      setLoading(false)
    })()
  }, [])

  const handleProfileSave = async () => {
    if (!profile.name.trim()) {
      toast.error('Name is required')
      return
    }
    setSaving(true)
    try {
      const payload = avatarFile ? new FormData() : {}

      const plainValues = {
        name: profile.name.trim(),
        email: profile.email.trim() || null,
        phone: profile.phone.trim() || null,
        city: profile.city.trim() || null,
        state: profile.state.trim() || null,
        address: profile.address.trim() || null,
      }

      if (payload instanceof FormData) {
        Object.entries(plainValues).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            payload.append(key, value)
          }
        })
        payload.append('avatar', avatarFile)
      } else {
        Object.assign(payload, plainValues)
      }

      const { data } = await userAPI.updateProfile(payload)
      if (data.success) {
        updateUser(data.data.user)
        setProfile((prev) => ({
          ...prev,
          avatar_url: data.data.user?.avatar_url || prev.avatar_url,
        }))
        setAvatarFile(null)
        toast.success('Profile updated successfully!')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    }
    setSaving(false)
  }

  const handleSettingsSave = async () => {
    setSaving(true)
    try {
      const { data } = await userAPI.updateSettings({
        alert_radius_km: settings.alert_radius_km,
        blood_alerts: settings.blood_alerts,
        missing_alerts: settings.missing_alerts,
        fund_alerts: settings.fund_alerts,
      })
      if (data.success) {
        setSettings(data.data.settings)
        toast.success('Settings saved!')
      }
    } catch {
      toast.error('Failed to save settings')
    }
    setSaving(false)
  }

  if (loading) return <Spinner size="lg" />

  const inputClass =
    'w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all'

  const tabs = [
    { id: 'profile', label: 'Edit Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text flex items-center justify-center gap-2">
          <SettingsIcon className="h-7 w-7 text-secondary" />
          Settings
        </h1>
        <p className="text-text-secondary mt-1">
          Manage your profile and notification preferences
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-surface-hover rounded-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ── Profile Tab ── */}
      {activeTab === 'profile' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Avatar + name header */}
          <Card hover={false}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-secondary-dark flex items-center justify-center flex-shrink-0 overflow-hidden">
                {avatarPreviewUrl || profile.avatar_url ? (
                  <img
                    src={avatarPreviewUrl || profile.avatar_url}
                    alt={profile.name || 'User'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-8 w-8 text-white" />
                )}
              </div>
              <div>
                <h2 className="font-heading font-bold text-lg text-text">
                  {profile.name || 'Your Name'}
                </h2>
                <p className="text-sm text-text-secondary">
                  {profile.email || 'Add your email'}
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  Member since{' '}
                  {new Date(
                    user?.created_at || Date.now()
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="mb-4 p-3 rounded-xl border border-border bg-surface-hover/40">
              <label className="block text-sm font-medium text-text mb-2">
                Profile Image
              </label>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-white text-sm text-text cursor-pointer hover:bg-surface-hover">
                  <Camera className="h-4 w-4" />
                  Upload Avatar
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                  />
                </label>
                {avatarFile && (
                  <span className="text-xs text-text-muted truncate">
                    {avatarFile.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-text-muted mt-2">
                JPG, PNG or WEBP up to 3MB.
              </p>
            </div>

            {/* Form fields */}
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) =>
                        setProfile({ ...profile, name: e.target.value })
                      }
                      placeholder="Your full name"
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) =>
                        setProfile({ ...profile, email: e.target.value })
                      }
                      placeholder="you@example.com"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    placeholder="+91 98765 43210"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text">
                    City
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <input
                      type="text"
                      value={profile.city}
                      onChange={(e) =>
                        setProfile({ ...profile, city: e.target.value })
                      }
                      placeholder="Your city"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text">
                    State
                  </label>
                  <div className="relative">
                    <Map className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <input
                      type="text"
                      value={profile.state}
                      onChange={(e) =>
                        setProfile({ ...profile, state: e.target.value })
                      }
                      placeholder="Your state"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text">
                  Address
                </label>
                <div className="relative">
                  <Home className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
                  <textarea
                    rows={2}
                    value={profile.address}
                    onChange={(e) =>
                      setProfile({ ...profile, address: e.target.value })
                    }
                    placeholder="Your full address"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            <motion.div className="mt-6" whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleProfileSave}
                loading={saving}
                className="w-full"
                size="lg"
              >
                <Save className="h-4 w-4" />
                Save Profile
              </Button>
            </motion.div>
          </Card>
        </motion.div>
      )}

      {/* ── Notifications Tab ── */}
      {activeTab === 'notifications' && settings && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Alert Radius */}
          <Card hover={false}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-green-100">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-text">Alert Radius</h3>
                <p className="text-sm text-text-secondary">
                  Get alerts for emergencies within this distance
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">5 km</span>
                <span className="text-2xl font-bold text-primary">
                  {settings.alert_radius_km} km
                </span>
                <span className="text-sm text-text-muted">50 km</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="1"
                value={settings.alert_radius_km}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    alert_radius_km: parseInt(e.target.value),
                  })
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="grid grid-cols-3 gap-2">
                {[10, 25, 50].map((val) => (
                  <button
                    key={val}
                    onClick={() =>
                      setSettings({ ...settings, alert_radius_km: val })
                    }
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      settings.alert_radius_km === val
                        ? 'bg-primary/10 text-primary border border-primary/30'
                        : 'bg-surface-hover text-text-secondary hover:bg-primary/5'
                    }`}
                  >
                    {val} km
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Alert Toggles */}
          <Card hover={false}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-amber-100">
                <Bell className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-text">
                  Notification Preferences
                </h3>
                <p className="text-sm text-text-secondary">
                  Choose which alerts you want to receive
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface-hover/40">
                <div>
                  <p className="text-sm font-medium text-text">
                    Browser Notifications
                  </p>
                  <p className="text-xs text-text-muted">
                    Permission status: {notificationPermission}
                  </p>
                </div>
                {notificationPermission !== 'granted' &&
                notificationPermission !== 'unsupported' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={requestNotificationPermission}
                  >
                    Enable
                  </Button>
                ) : (
                  <span
                    className={`text-xs font-semibold ${notificationPermission === 'granted' ? 'text-green-600' : 'text-text-muted'}`}
                  >
                    {notificationPermission === 'granted'
                      ? 'Enabled'
                      : 'Unsupported'}
                  </span>
                )}
              </div>

              {[
                {
                  key: 'blood_alerts',
                  icon: Heart,
                  label: 'Blood Donation Alerts',
                  desc: 'Get notified when someone nearby needs blood',
                  color: 'text-red-500',
                },
                {
                  key: 'missing_alerts',
                  icon: Search,
                  label: 'Missing Person Alerts',
                  desc: 'Get notified about missing persons near you',
                  color: 'text-blue-500',
                },
                {
                  key: 'fund_alerts',
                  icon: HandCoins,
                  label: 'Fundraising Alerts',
                  desc: 'Get notified about donation updates',
                  color: 'text-amber-500',
                },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-surface-hover transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                    <div>
                      <p className="text-sm font-medium text-text">
                        {item.label}
                      </p>
                      <p className="text-xs text-text-muted">{item.desc}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={settings[item.key]}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          [item.key]: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                  </div>
                </label>
              ))}
            </div>
          </Card>

          <motion.div whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleSettingsSave}
              loading={saving}
              className="w-full"
              size="lg"
            >
              <Save className="h-4 w-4" />
              Save Settings
            </Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
