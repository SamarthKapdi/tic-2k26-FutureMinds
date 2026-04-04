import { useState, useRef, useEffect } from 'react'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  Heart,
  Search,
  HandCoins,
  AlertTriangle,
  X,
  Check,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { useSocket } from '../context/SocketContext'

const typeConfig = {
  blood: { icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
  missing: { icon: Search, color: 'text-blue-500', bg: 'bg-blue-50' },
  fund: { icon: HandCoins, color: 'text-amber-500', bg: 'bg-amber-50' },
  report: {
    icon: AlertTriangle,
    color: 'text-orange-500',
    bg: 'bg-orange-50',
  },
}

function timeAgoShort(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000)
  if (s < 60) return 'Just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function NotificationBell() {
  const {
    notifications,
    unreadCount,
    clearNotifications,
    connected,
    notificationPermission,
    requestNotificationPermission,
  } = useSocket()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => {
          setOpen(!open)
          if (!open && unreadCount > 0) clearNotifications()
        }}
        className="relative p-2 rounded-xl text-text-secondary hover:bg-surface-hover transition-colors cursor-pointer"
        title="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center px-1"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <Motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl border border-border shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-text text-sm">
                  Notifications
                </h3>
                <div
                  className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full ${connected ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}
                >
                  {connected ? (
                    <Wifi className="h-2.5 w-2.5" />
                  ) : (
                    <WifiOff className="h-2.5 w-2.5" />
                  )}
                  {connected ? 'Live' : 'Offline'}
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
              >
                <X className="h-4 w-4 text-text-muted" />
              </button>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notificationPermission !== 'granted' &&
                notificationPermission !== 'unsupported' && (
                  <div className="px-4 py-3 border-b border-border bg-blue-50/70">
                    <p className="text-xs text-blue-700 mb-2">
                      Enable browser notifications to receive alerts even when
                      this tab is in background.
                    </p>
                    <button
                      onClick={requestNotificationPermission}
                      className="text-xs font-semibold text-blue-700 hover:text-blue-900"
                    >
                      Enable Notifications
                    </button>
                  </div>
                )}

              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="h-8 w-8 text-text-muted mx-auto mb-2" />
                  <p className="text-sm text-text-muted">
                    No notifications yet
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    Actions will appear here in real-time
                  </p>
                </div>
              ) : (
                notifications.slice(0, 20).map((n) => {
                  const config = typeConfig[n.type] || typeConfig.blood
                  const Icon = config.icon
                  return (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 border-b border-border/50 hover:bg-surface-hover transition-colors ${!n.read ? 'bg-primary/[0.03]' : ''}`}
                    >
                      <div
                        className={`p-1.5 rounded-lg ${config.bg} flex-shrink-0 mt-0.5`}
                      >
                        <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text leading-snug">
                          {n.message}
                        </p>
                        <p className="text-[11px] text-text-muted mt-1">
                          {timeAgoShort(n.time)}
                        </p>
                      </div>
                      {!n.read && (
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                      )}
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2 border-t border-border bg-surface-hover/50">
                <button
                  onClick={clearNotifications}
                  className="flex items-center gap-1.5 text-xs text-primary font-medium hover:text-primary-dark cursor-pointer"
                >
                  <Check className="h-3 w-3" />
                  Mark all as read
                </button>
              </div>
            )}
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
