import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, HandCoins, Search, MapPin, Shield, TrendingUp, Users, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StatCard, Card, Badge, Spinner } from '../components/ui';
import { bloodAPI, fundAPI, missingAPI } from '../lib/api';
import { timeAgo, formatCurrency, getUrgencyColor, getTrustScoreColor } from '../lib/utils';

export default function Dashboard() {
  const { user } = useAuth();
  const [recentRequests, setRecentRequests] = useState([]);
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [recentMissing, setRecentMissing] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [reqRes, campRes, missRes] = await Promise.all([
          bloodAPI.getRequests({ limit: 5 }),
          fundAPI.listCampaigns({ limit: 5 }),
          missingAPI.list({ limit: 5 }),
        ]);
        setRecentRequests(reqRes.data?.data?.requests || []);
        setRecentCampaigns(campRes.data?.data?.campaigns || []);
        setRecentMissing(missRes.data?.data?.missing_persons || []);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Spinner size="lg" />;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text">
              Welcome back, {user?.name || 'User'} 👋
            </h1>
            <p className="text-text-secondary mt-1">Here's what's happening in your community</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/10">
            <Shield className="h-4 w-4 text-secondary" />
            <span className={`font-bold ${getTrustScoreColor(user?.trust_score || 50)}`}>
              Trust: {user?.trust_score || 50}/100
            </span>
            {user?.is_verified && <Badge variant="success">Verified</Badge>}
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Heart} label="Blood Donations" value={user?.stats?.blood_donations || 0} color="danger" />
        <StatCard icon={HandCoins} label="Funds Raised" value={formatCurrency(user?.stats?.total_raised || 0)} color="accent" />
        <StatCard icon={Search} label="Missing Reports" value={user?.stats?.missing_reports || 0} color="secondary" />
        <StatCard icon={TrendingUp} label="Campaigns" value={user?.stats?.campaigns_created || 0} color="success" />
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { to: '/blood', icon: Heart, label: 'Donate Blood', color: 'from-red-500 to-rose-600' },
          { to: '/fund', icon: HandCoins, label: 'Start Campaign', color: 'from-amber-500 to-orange-600' },
          { to: '/missing', icon: Search, label: 'Report Missing', color: 'from-blue-500 to-indigo-600' },
          { to: '/map', icon: MapPin, label: 'View Map', color: 'from-green-500 to-emerald-600' },
        ].map((action) => (
          <Link key={action.to} to={action.to}>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`p-5 rounded-2xl bg-gradient-to-br ${action.color} text-white flex items-center gap-4 cursor-pointer shadow-lg`}
            >
              <action.icon className="h-8 w-8" />
              <span className="font-semibold text-lg">{action.label}</span>
            </motion.div>
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
            <Link to="/blood" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentRequests.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-4">No active requests</p>
            ) : (
              recentRequests.slice(0, 4).map((req) => (
                <div key={req.id} className="flex items-center justify-between p-3 rounded-xl bg-bg">
                  <div>
                    <p className="text-sm font-semibold text-text">{req.patient_name}</p>
                    <p className="text-xs text-text-secondary">{req.hospital_name || req.city}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={req.urgency}>{req.blood_group}</Badge>
                    <p className="text-xs text-text-muted mt-1">{timeAgo(req.created_at)}</p>
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
            <Link to="/fund" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentCampaigns.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-4">No active campaigns</p>
            ) : (
              recentCampaigns.slice(0, 4).map((camp) => (
                <div key={camp.id} className="p-3 rounded-xl bg-bg">
                  <p className="text-sm font-semibold text-text truncate">{camp.title}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className="bg-gradient-to-r from-accent to-amber-500 h-2 rounded-full"
                        style={{ width: `${Math.min(camp.progress_percentage || 0, 100)}%` }}
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
            <Link to="/missing" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentMissing.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-4">No active cases</p>
            ) : (
              recentMissing.slice(0, 4).map((mp) => (
                <div key={mp.id} className="flex items-center justify-between p-3 rounded-xl bg-bg">
                  <div>
                    <p className="text-sm font-semibold text-text">{mp.name}</p>
                    <p className="text-xs text-text-secondary">{mp.city || 'Unknown'}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={mp.urgency}>{mp.urgency}</Badge>
                    <p className="text-xs text-text-muted mt-1">{mp.sighting_count || 0} sightings</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
