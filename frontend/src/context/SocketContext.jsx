import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'

const SocketContext = createContext(null)
const NOTIFICATION_STORAGE_KEY = 'sahyog_notifications_v1'

const getStoredNotifications = () => {
  try {
    const raw = localStorage.getItem(NOTIFICATION_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const getInitialPermission = () => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported'
  }
  return Notification.permission
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [notifications, setNotifications] = useState(getStoredNotifications)
  const [notificationPermission, setNotificationPermission] =
    useState(getInitialPermission)

  const requestNotificationPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setNotificationPermission('unsupported')
      return 'unsupported'
    }

    const permission = await Notification.requestPermission()
    setNotificationPermission(permission)
    return permission
  }, [])

  const addNotification = useCallback((type, message, data) => {
    const next = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type,
      message,
      data,
      time: new Date().toISOString(),
      read: false,
    }

    setNotifications((prev) => [next, ...prev.slice(0, 49)])

    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted' &&
      document.visibilityState !== 'visible'
    ) {
      try {
        const titleByType = {
          blood: 'Blood Alert',
          missing: 'Missing Person Alert',
          fund: 'Fundraising Alert',
        }

        // Native browser notification for background tabs or minimized windows.
        new Notification(titleByType[type] || 'SAHYOG Notification', {
          body: message,
        })
      } catch {
        // Ignore browser notification errors and keep in-app stream working.
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(
      NOTIFICATION_STORAGE_KEY,
      JSON.stringify(notifications)
    )
  }, [notifications])

  useEffect(() => {
    const syncAcrossTabs = (event) => {
      if (event.key !== NOTIFICATION_STORAGE_KEY) return
      try {
        const next = event.newValue ? JSON.parse(event.newValue) : []
        setNotifications(Array.isArray(next) ? next : [])
      } catch {
        setNotifications([])
      }
    }

    const syncPermission = () => {
      setNotificationPermission(getInitialPermission())
    }

    window.addEventListener('storage', syncAcrossTabs)
    window.addEventListener('focus', syncPermission)

    return () => {
      window.removeEventListener('storage', syncAcrossTabs)
      window.removeEventListener('focus', syncPermission)
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('sahyog_token')
    if (!token) return

    const socketBaseUrl =
      import.meta.env.VITE_SOCKET_URL ||
      (import.meta.env.DEV ? 'http://localhost:5000' : window.location.origin)

    const s = io(socketBaseUrl, {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      timeout: 10000,
    })

    s.on('connect', () => {
      console.log('⚡ Socket connected')
      setConnected(true)
    })

    s.on('disconnect', () => {
      console.log('⚡ Socket disconnected')
      setConnected(false)
    })

    s.on('connect_error', (err) => {
      console.error('Socket connect error:', err?.message || err)
      setConnected(false)
    })

    // ── Real-time notification handlers ──
    s.on('blood:new_request', (data) => {
      const msg = `🩸 New blood request: ${data.blood_group} needed${data.requester_name ? ` by ${data.requester_name}` : ''}`
      toast(msg, { icon: '🆘' })
      addNotification('blood', msg, data)
    })

    s.on('blood:new_response', (data) => {
      const msg = `💉 ${data.donor_name || 'A donor'} responded to a blood request!`
      toast.success(msg)
      addNotification('blood', msg, data)
    })

    s.on('missing:new_report', (data) => {
      const msg = `🔍 Missing person report: ${data.name}${data.city ? ` near ${data.city}` : ''}`
      toast(msg, { icon: '🚨' })
      addNotification('missing', msg, data)
    })

    s.on('missing:new_sighting', (data) => {
      const msg = `👁️ New sighting reported${data.reporter_name ? ` by ${data.reporter_name}` : ''}`
      toast.success(msg)
      addNotification('missing', msg, data)
    })

    s.on('fund:new_campaign', (data) => {
      const msg = `💰 New campaign: "${data.title}"${data.creator_name ? ` by ${data.creator_name}` : ''}`
      toast(msg, { icon: '🎯' })
      addNotification('fund', msg, data)
    })

    s.on('fund:donation', (data) => {
      const msg = `💰 ${data.donor_name || 'Someone'} donated ₹${data.amount}!`
      toast.success(msg)
      addNotification('fund', msg, data)
    })

    setSocket(s)

    return () => {
      s.disconnect()
      setSocket(null)
      setConnected(false)
    }
  }, [addNotification])

  const clearNotifications = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const on = useCallback(
    (event, callback) => {
      if (!socket) return () => {}
      socket.on(event, callback)
      return () => socket.off(event, callback)
    },
    [socket]
  )

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        on,
        notifications,
        unreadCount,
        clearNotifications,
        notificationPermission,
        requestNotificationPermission,
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  const ctx = useContext(SocketContext)
  return (
    ctx || {
      socket: null,
      connected: false,
      on: () => () => {},
      notifications: [],
      unreadCount: 0,
      clearNotifications: () => {},
      notificationPermission: 'unsupported',
      requestNotificationPermission: async () => 'unsupported',
    }
  )
}
