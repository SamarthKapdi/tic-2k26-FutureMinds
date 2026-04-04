import { useState, useEffect, useCallback, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Icon } from 'leaflet'
import { motion } from 'framer-motion'
import {
  MapPin,
  Heart,
  Search,
  Filter,
  Navigation,
  Loader2,
} from 'lucide-react'
import { Card } from '../components/ui'
import { bloodAPI, missingAPI } from '../lib/api'
import { useSocket } from '../context/SocketContext'
import { timeAgo } from '../lib/utils'
import 'leaflet/dist/leaflet.css'

// Custom marker icons using inline SVG data URIs
const bloodIcon = new Icon({
  iconUrl:
    'data:image/svg+xml;base64,' +
    btoa(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#E63946" width="32" height="32"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`
    ),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
})

const missingIcon = new Icon({
  iconUrl:
    'data:image/svg+xml;base64,' +
    btoa(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#457B9D" width="32" height="32"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`
    ),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
})

const userLocationIcon = new Icon({
  iconUrl:
    'data:image/svg+xml;base64,' +
    btoa(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3b82f6" width="24" height="24"><circle cx="12" cy="12" r="10" stroke="#ffffff" stroke-width="2"/></svg>`
    ),
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
})

// Component to handle map centering programmatically
function MapController({ center, zoom, flyTo }) {
  const map = useMap()
  useEffect(() => {
    if (center && flyTo) {
      map.flyTo(center, zoom, { duration: 1.5 })
    } else if (center) {
      map.setView(center, zoom)
    }
  }, [center, zoom, flyTo, map])
  return null
}

const DEFAULT_CENTER = [22.7196, 75.8577] // Indore
const MAP_REFRESH_INTERVAL_MS = 10000
const MIN_LOCATION_DELTA = 0.00003

export default function MapView() {
  const [bloodRequests, setBloodRequests] = useState([])
  const [missingCases, setMissingCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [center, setCenter] = useState(DEFAULT_CENTER)
  const [userLocation, setUserLocation] = useState(null)
  const [locatingUser, setLocatingUser] = useState(true)
  const [flyTo, setFlyTo] = useState(false)
  const centeredToUserRef = useRef(false)
  const { on } = useSocket()

  // Watch user's real-time location continuously without re-subscribing.
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocatingUser(false)
      return
    }

    const applyLocation = (coords) => {
      const next = [coords.latitude, coords.longitude]

      setUserLocation((prev) => {
        if (
          prev &&
          Math.abs(prev[0] - next[0]) < MIN_LOCATION_DELTA &&
          Math.abs(prev[1] - next[1]) < MIN_LOCATION_DELTA
        ) {
          return prev
        }
        return next
      })

      if (!centeredToUserRef.current) {
        setCenter(next)
        centeredToUserRef.current = true
      }

      setLocatingUser(false)
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => applyLocation(pos.coords),
      () => setLocatingUser(false),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 7000 }
    )

    const watchId = navigator.geolocation.watchPosition(
      (pos) => applyLocation(pos.coords),
      () => setLocatingUser(false),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  const loadData = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true)
    try {
      const [bloodRes, missRes] = await Promise.all([
        bloodAPI.getRequests({ limit: 100 }),
        missingAPI.list({ limit: 100 }),
      ])
      setBloodRequests(
        (bloodRes.data?.data?.requests || []).filter(
          (r) => r.latitude && r.longitude
        )
      )
      setMissingCases(
        (missRes.data?.data?.missing_persons || []).filter(
          (m) => m.latitude && m.longitude
        )
      )
    } catch (err) {
      console.error(err)
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Real-time sync on map-affecting events + short polling fallback.
  useEffect(() => {
    const events = [
      'dashboard:refresh',
      'blood:new_request',
      'missing:new_report',
      'missing:new_sighting',
    ]

    const unsubs = events.map((eventName) =>
      on(eventName, () => loadData({ silent: true }))
    )

    const poller = setInterval(() => {
      loadData({ silent: true })
    }, MAP_REFRESH_INTERVAL_MS)

    const refreshOnFocus = () => loadData({ silent: true })
    const refreshOnVisible = () => {
      if (document.visibilityState === 'visible') {
        loadData({ silent: true })
      }
    }

    window.addEventListener('focus', refreshOnFocus)
    document.addEventListener('visibilitychange', refreshOnVisible)

    return () => {
      clearInterval(poller)
      window.removeEventListener('focus', refreshOnFocus)
      document.removeEventListener('visibilitychange', refreshOnVisible)
      unsubs.forEach((unsub) => unsub && unsub())
    }
  }, [on, loadData])

  const goToMyLocation = () => {
    if (userLocation) {
      setFlyTo(true)
      setCenter([...userLocation]) // force new reference to trigger effect
    }
  }

  const filteredBlood = filter === 'missing' ? [] : bloodRequests
  const filteredMissing = filter === 'blood' ? [] : missingCases

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text flex items-center gap-2">
            <MapPin className="h-7 w-7 text-green-600" />
            Emergency Map
          </h1>
          <p className="text-text-secondary mt-1">
            Real-time OpenStreetMap visualization with live syncing
          </p>
        </div>
        <div className="flex gap-2">
          {[
            { value: 'all', label: 'All', icon: Filter },
            { value: 'blood', label: 'Blood', icon: Heart },
            { value: 'missing', label: 'Missing', icon: Search },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                filter === f.value
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary hover:bg-surface-hover'
              }`}
            >
              <f.icon className="h-4 w-4" />
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="!p-4" hover={false}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-100">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">
                {bloodRequests.length}
              </p>
              <p className="text-xs text-text-secondary">Blood Requests</p>
            </div>
          </div>
        </Card>
        <Card className="!p-4" hover={false}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100">
              <Search className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">
                {missingCases.length}
              </p>
              <p className="text-xs text-text-secondary">Missing Cases</p>
            </div>
          </div>
        </Card>
        <Card className="!p-4" hover={false}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-green-100">
              {locatingUser ? (
                <Loader2 className="h-5 w-5 text-green-600 animate-spin" />
              ) : (
                <Navigation className="h-5 w-5 text-green-600" />
              )}
            </div>
            <div>
              <p className="text-2xl font-bold text-text">
                {userLocation ? 'Live' : 'Off'}
              </p>
              <p className="text-xs text-text-secondary">Your Location</p>
            </div>
          </div>
        </Card>
        <Card className="!p-4" hover={false}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-100">
              <MapPin className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">
                {bloodRequests.length + missingCases.length}
              </p>
              <p className="text-xs text-text-secondary">Total Markers</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-[500px] sm:h-[600px] rounded-2xl overflow-hidden border border-border shadow-sm z-0"
      >
        <MapContainer
          center={center}
          zoom={userLocation ? 14 : 5}
          className="h-full w-full"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <MapController center={center} zoom={14} flyTo={flyTo} />

          {/* User's current location marker */}
          {userLocation && (
            <Marker position={userLocation} icon={userLocationIcon}>
              <Popup>
                <div className="text-center p-1">
                  <p className="font-semibold">You are here</p>
                  <p className="text-xs text-text-secondary mt-1">
                    Live Location Tracking
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Blood request markers */}
          {filteredBlood.map((req) => (
            <Marker
              key={`blood-${req.id}`}
              position={[parseFloat(req.latitude), parseFloat(req.longitude)]}
              icon={bloodIcon}
            >
              <Popup>
                <div className="min-w-[200px] p-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-4 w-4 text-primary" />
                    <strong className="text-sm">Blood Request</strong>
                  </div>
                  <p className="text-sm font-semibold">{req.patient_name}</p>
                  <p className="text-xs text-gray-600">
                    Blood Group: <strong>{req.blood_group}</strong>
                  </p>
                  {req.hospital_name && (
                    <p className="text-xs text-gray-600">
                      Hospital: {req.hospital_name}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {timeAgo(req.created_at)}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Missing person markers */}
          {filteredMissing.map((mp) => (
            <Marker
              key={`missing-${mp.id}`}
              position={[parseFloat(mp.latitude), parseFloat(mp.longitude)]}
              icon={missingIcon}
            >
              <Popup>
                <div className="min-w-[200px] p-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Search className="h-4 w-4 text-secondary" />
                    <strong className="text-sm">Missing Person</strong>
                  </div>
                  <p className="text-sm font-semibold">{mp.name}</p>
                  {mp.age && (
                    <p className="text-xs text-gray-600">Age: {mp.age}</p>
                  )}
                  {mp.city && (
                    <p className="text-xs text-gray-600">
                      Last seen: {mp.city}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {timeAgo(mp.created_at)}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* My Location button overlay */}
        {userLocation && (
          <button
            onClick={goToMyLocation}
            className="absolute bottom-6 right-6 p-3 bg-white rounded-xl shadow-lg border border-border hover:bg-surface-hover transition-all cursor-pointer"
            style={{ zIndex: 1000 }}
            title="Go to my live location"
          >
            <Navigation className="h-5 w-5 text-blue-500" />
          </button>
        )}
      </motion.div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm text-text-secondary">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-primary" />
          <span>Blood Requests</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-secondary" />
          <span>Missing Persons</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500" />
          <span>Your Location</span>
        </div>
      </div>
    </div>
  )
}
