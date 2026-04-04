import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, Heart, Search, HandCoins, RefreshCw } from 'lucide-react';
import { Card, Spinner } from '../components/ui';
import TrustBadge from '../components/TrustBadge';
import { userAPI } from '../lib/api';
import { useSocket } from '../context/SocketContext';

const rankIcons = [Crown, Medal, Medal];

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { on, connected } = useSocket();

  const loadData = useCallback(async () => {
    try {
      const { data } = await userAPI.getLeaderboard({ limit: 20 });
      if (data.success) setUsers(data.data.users);
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Real-time: refresh leaderboard on action ──
  useEffect(() => {
    const unsub = on('leaderboard:refresh', () => {
      loadData();
    });
    return unsub;
  }, [on, loadData]);

  if (loading) return <Spinner size="lg" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text flex items-center justify-center gap-2">
            <Trophy className="h-7 w-7 text-amber-500" />
            Community Leaderboard
          </h1>
          <p className="text-text-secondary mt-1">Top contributors making a difference</p>
        </div>
        <div className="flex items-center gap-2">
          {connected && (
            <span className="text-[10px] font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live
            </span>
          )}
          <button
            onClick={loadData}
            className="p-2 rounded-xl text-text-secondary hover:bg-surface-hover transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Top 3 Podium */}
      {users.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          {[1, 0, 2].map((idx) => {
            const u = users[idx];
            const isFirst = idx === 0;
            return (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15 }}
                className={`text-center ${isFirst ? 'order-2 -mt-4' : idx === 1 ? 'order-1 mt-4' : 'order-3 mt-4'}`}
              >
                <Card hover={false} className={`!p-4 ${isFirst ? '!border-amber-300 !shadow-amber-100 !shadow-lg' : ''}`}>
                  <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 ${
                    isFirst ? 'bg-amber-100' : 'bg-gray-100'
                  }`}>
                    {isFirst ? <Crown className="h-6 w-6 text-amber-500" /> :
                     idx === 1 ? <Medal className="h-5 w-5 text-gray-400" /> :
                     <Medal className="h-5 w-5 text-amber-700" />}
                  </div>
                  <p className="font-bold text-text text-sm truncate">{u.name}</p>
                  <p className="text-xs text-text-muted">{u.city || 'India'}</p>
                  <div className="mt-2">
                    <TrustBadge score={u.trust_score} size="sm" />
                  </div>
                  <div className="flex justify-center gap-3 mt-2 text-[10px] text-text-muted">
                    <span title="Donations">🩸{u.donations}</span>
                    <span title="Campaigns">💰{u.campaigns}</span>
                    <span title="Sightings">👁️{u.sightings}</span>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Rest of leaderboard */}
      <div className="space-y-2 max-w-2xl mx-auto">
        {users.slice(3).map((u, i) => (
          <motion.div
            key={u.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: (i + 3) * 0.05 }}
          >
            <Card hover={false} className="!p-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center text-sm font-bold text-text-secondary">
                  {i + 4}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-text text-sm truncate">{u.name}</p>
                    {u.is_verified && <span className="text-green-500 text-xs">✓</span>}
                  </div>
                  <p className="text-xs text-text-muted">{u.city || 'India'}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-text-muted">
                  <span className="flex items-center gap-1"><Heart className="h-3 w-3 text-red-400" />{u.donations}</span>
                  <span className="flex items-center gap-1"><HandCoins className="h-3 w-3 text-amber-400" />{u.campaigns}</span>
                  <span className="flex items-center gap-1"><Search className="h-3 w-3 text-blue-400" />{u.sightings}</span>
                </div>
                <TrustBadge score={u.trust_score} size="sm" showLabel={false} />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {users.length === 0 && (
        <p className="text-center text-text-muted py-12">No leaderboard data yet. Start contributing!</p>
      )}
    </div>
  );
}
