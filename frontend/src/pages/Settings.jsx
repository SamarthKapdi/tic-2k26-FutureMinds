import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, MapPin, Heart, Search, HandCoins, Save, Bell } from 'lucide-react';
import { Card, Button, Spinner } from '../components/ui';
import { userAPI } from '../lib/api';
import toast from 'react-hot-toast';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await userAPI.getSettings();
        if (data.success) setSettings(data.data.settings);
      } catch { /* silent */ }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await userAPI.updateSettings({
        alert_radius_km: settings.alert_radius_km,
        blood_alerts: settings.blood_alerts,
        missing_alerts: settings.missing_alerts,
        fund_alerts: settings.fund_alerts,
      });
      if (data.success) {
        setSettings(data.data.settings);
        toast.success('Settings saved!');
      }
    } catch (err) {
      toast.error('Failed to save settings');
    }
    setSaving(false);
  };

  if (loading) return <Spinner size="lg" />;
  if (!settings) return <p className="text-center text-text-muted py-12">Could not load settings</p>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text flex items-center justify-center gap-2">
          <SettingsIcon className="h-7 w-7 text-secondary" />
          Smart Alert Settings
        </h1>
        <p className="text-text-secondary mt-1">Control your emergency alerts and notification preferences</p>
      </div>

      {/* Alert Radius */}
      <Card hover={false}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-green-100">
            <MapPin className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-text">Alert Radius</h3>
            <p className="text-sm text-text-secondary">Get alerts for emergencies within this distance</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">5 km</span>
            <span className="text-2xl font-bold text-primary">{settings.alert_radius_km} km</span>
            <span className="text-sm text-text-muted">50 km</span>
          </div>
          <input
            type="range"
            min="5"
            max="50"
            step="1"
            value={settings.alert_radius_km}
            onChange={(e) => setSettings({ ...settings, alert_radius_km: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="grid grid-cols-3 gap-2">
            {[10, 25, 50].map((val) => (
              <button
                key={val}
                onClick={() => setSettings({ ...settings, alert_radius_km: val })}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
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
            <h3 className="font-semibold text-text">Notification Preferences</h3>
            <p className="text-sm text-text-secondary">Choose which alerts you want to receive</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { key: 'blood_alerts', icon: Heart, label: 'Blood Donation Alerts', desc: 'Get notified when someone nearby needs blood', color: 'text-red-500' },
            { key: 'missing_alerts', icon: Search, label: 'Missing Person Alerts', desc: 'Get notified about missing persons near you', color: 'text-blue-500' },
            { key: 'fund_alerts', icon: HandCoins, label: 'Fundraising Alerts', desc: 'Get notified about donation updates', color: 'text-amber-500' },
          ].map((item) => (
            <label key={item.key} className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-surface-hover transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <item.icon className={`h-5 w-5 ${item.color}`} />
                <div>
                  <p className="text-sm font-medium text-text">{item.label}</p>
                  <p className="text-xs text-text-muted">{item.desc}</p>
                </div>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={settings[item.key]}
                  onChange={(e) => setSettings({ ...settings, [item.key]: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
              </div>
            </label>
          ))}
        </div>
      </Card>

      <motion.div whileTap={{ scale: 0.98 }}>
        <Button onClick={handleSave} loading={saving} className="w-full" size="lg">
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </motion.div>
    </div>
  );
}
