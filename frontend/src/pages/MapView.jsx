import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { motion } from 'framer-motion';
import { MapPin, Heart, Search, Filter, RefreshCw, Eye } from 'lucide-react';
import { Badge, Spinner, Card } from '../components/ui';
import TrustBadge from '../components/TrustBadge';
import { bloodAPI, missingAPI } from '../lib/api';
import { timeAgo, formatDate } from '../lib/utils';
import 'leaflet/dist/leaflet.css';

const bloodIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23E63946" width="32" height="32"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const missingIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23457B9D" width="32" height="32"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center[0] !== 20.5937) {
      map.setView(center, 12);
    }
  }, [center, map]);
  return null;
}

export default function MapView() {
  const [bloodRequests, setBloodRequests] = useState([]);
  const [missingCases, setMissingCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [center, setCenter] = useState([20.5937, 78.9629]);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [isLive, setIsLive] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [bloodRes, missRes] = await Promise.all([
        bloodAPI.getRequests({ limit: 200 }),
        missingAPI.list({ limit: 200 }),
      ]);
      setBloodRequests((bloodRes.data?.data?.requests || []).filter((r) => r.latitude && r.longitude));
      setMissingCases((missRes.data?.data?.missing_persons || []).filter((m) => m.latitude && m.longitude));
      setLastRefresh(Date.now());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCenter([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  }, [loadData]);

  // Auto-refresh every 15 seconds when live
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [isLive, loadData]);

  const filteredBlood = filter === 'missing' ? [] : bloodRequests;
  const filteredMissing = filter === 'blood' ? [] : missingCases;
  const totalMarkers = filteredBlood.length + filteredMissing.length;

  const urgencyColors = {
    critical: 'bg-red-500',
    urgent: 'bg-amber-500',
    normal: 'bg-gray-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text flex items-center gap-2">
            <MapPin className="h-7 w-7 text-green-600" />
            Live Emergency Map
            {isLive && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-100 px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                LIVE
              </span>
            )}
          </h1>
          <p className="text-text-secondary mt-1">
            Real-time visualization of {totalMarkers} active emergencies
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { value: 'all', label: 'All', icon: Filter },
            { value: 'blood', label: 'Blood', icon: Heart },
            { value: 'missing', label: 'Missing', icon: Search },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f.value ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-surface-hover'
              }`}
            >
              <f.icon className="h-4 w-4" />
              {f.label}
            </button>
          ))}
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              isLive ? 'bg-green-100 text-green-700' : 'text-text-secondary hover:bg-surface-hover'
            }`}
          >
            <RefreshCw className={`h-4 w-4 ${isLive ? 'animate-spin' : ''}`} style={isLive ? { animationDuration: '3s' } : {}} />
            {isLive ? 'Live' : 'Paused'}
          </button>
        </div>
      </div>

      {/* Process Info */}
      <div className="bg-green-600/5 border border-green-600/20 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-green-700 mb-2">Problem & Implementation</h2>
        <p className="text-text-secondary leading-relaxed text-sm">
          <strong>The Problem:</strong> People inherently want to help during emergencies, but they usually lack geographic awareness of verified crises taking place within their own local vicinities.<br/>
          <strong>Our Process:</strong> The system continuously aggregates all active, verified emergencies—like imminent blood requests and missing person tracking—onto one centralized, constantly updating framework. By mapping out crises visually and locally, we eliminate "situational blindness," allowing capable community volunteers to locate exact emergencies near them and coordinate rapid response right when and where it is critically needed.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="!p-4" hover={false}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-100"><Heart className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold text-text">{bloodRequests.length}</p>
              <p className="text-xs text-text-secondary">Blood Requests</p>
            </div>
          </div>
        </Card>
        <Card className="!p-4" hover={false}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100"><Search className="h-5 w-5 text-secondary" /></div>
            <div>
              <p className="text-2xl font-bold text-text">{missingCases.length}</p>
              <p className="text-xs text-text-secondary">Missing Cases</p>
            </div>
          </div>
        </Card>
        <Card className="!p-4" hover={false}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100"><Eye className="h-5 w-5 text-amber-600" /></div>
            <div>
              <p className="text-2xl font-bold text-text">{totalMarkers}</p>
              <p className="text-xs text-text-secondary">Active Markers</p>
            </div>
          </div>
        </Card>
        <Card className="!p-4" hover={false}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-green-100"><RefreshCw className="h-5 w-5 text-green-600" /></div>
            <div>
              <p className="text-sm font-bold text-text">{new Date(lastRefresh).toLocaleTimeString()}</p>
              <p className="text-xs text-text-secondary">Last Updated</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Map */}
      {loading ? <Spinner size="lg" /> : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-[500px] sm:h-[600px] rounded-2xl overflow-hidden border border-border shadow-sm"
        >
          <MapContainer center={center} zoom={5} className="h-full w-full" scrollWheelZoom={true}>
            <RecenterMap center={center} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredBlood.map((req) => (
              <Marker key={`blood-${req.id}`} position={[parseFloat(req.latitude), parseFloat(req.longitude)]} icon={bloodIcon}>
                <Popup maxWidth={280}>
                  <div className="min-w-[220px] p-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      <strong className="text-sm text-red-600">Blood Request</strong>
                      <span className={`ml-auto w-2.5 h-2.5 rounded-full ${urgencyColors[req.urgency]}`} title={req.urgency} />
                    </div>
                    <p className="text-sm font-bold">{req.patient_name}</p>
                    <div className="mt-1.5 space-y-0.5 text-xs text-gray-600">
                      <p>🩸 Blood Group: <strong className="text-red-600">{req.blood_group}</strong> ({req.units_needed || 1} units)</p>
                      {req.hospital_name && <p>🏥 {req.hospital_name}</p>}
                      {req.city && <p>📍 {req.city}</p>}
                      {req.contact_number && <p>📞 {req.contact_number}</p>}
                      {req.distance_km && <p>📏 {req.distance_km} km away</p>}
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                      <span className="text-[11px] text-gray-400">{timeAgo(req.created_at)}</span>
                      {req.trust_score !== undefined && (
                        <span className="text-[11px]">Trust: {req.trust_score}/100</span>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
            {filteredMissing.map((mp) => (
              <Marker key={`missing-${mp.id}`} position={[parseFloat(mp.latitude), parseFloat(mp.longitude)]} icon={missingIcon}>
                <Popup maxWidth={280}>
                  <div className="min-w-[220px] p-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Search className="h-4 w-4 text-blue-500" />
                      <strong className="text-sm text-blue-600">Missing Person</strong>
                      <span className={`ml-auto w-2.5 h-2.5 rounded-full ${urgencyColors[mp.urgency]}`} title={mp.urgency} />
                    </div>
                    <p className="text-sm font-bold">{mp.name}</p>
                    {mp.image_url && (
                      <img src={mp.image_url} alt={mp.name} className="w-full h-24 object-cover rounded mt-1" />
                    )}
                    <div className="mt-1.5 space-y-0.5 text-xs text-gray-600">
                      {mp.age && <p>👤 Age: {mp.age} {mp.gender && `| ${mp.gender}`}</p>}
                      {mp.last_seen_address && <p>📍 Last seen: {mp.last_seen_address}</p>}
                      {mp.city && <p>🏙️ {mp.city}</p>}
                      {mp.contact_number && <p>📞 {mp.contact_number}</p>}
                      <p>👁️ Sightings: <strong>{mp.sighting_count || 0}</strong></p>
                      {mp.distance_km && <p>📏 {mp.distance_km} km away</p>}
                    </div>
                    {mp.description && (
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{mp.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                      <span className="text-[11px] text-gray-400">{timeAgo(mp.created_at)}</span>
                      {mp.trust_score !== undefined && (
                        <span className="text-[11px]">Trust: {mp.trust_score}/100</span>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </motion.div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm text-text-secondary">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-primary" />
          <span>Blood Requests ({filteredBlood.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-secondary" />
          <span>Missing Persons ({filteredMissing.length})</span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Critical
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ml-2" /> Urgent
            <span className="w-2.5 h-2.5 rounded-full bg-gray-400 ml-2" /> Normal
          </div>
        </div>
      </div>
    </div>
  );
}
