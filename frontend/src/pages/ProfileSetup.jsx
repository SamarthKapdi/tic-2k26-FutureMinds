import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Save, UserRound, Mail, Home, Building2 } from 'lucide-react';
import { Card, Input, Button } from '../components/ui';
import { userAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const isNewUser = useMemo(() => !user?.name || !user.name.trim(), [user]);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [city, setCity] = useState(user?.city || '');
  const [state, setState] = useState(user?.state || '');
  const [address, setAddress] = useState(user?.address || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Full name is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim() || null,
        city: city.trim() || null,
        state: state.trim() || null,
        address: address.trim() || null,
      };

      const { data } = await userAPI.updateProfile(payload);
      if (!data.success) {
        throw new Error(data.message || 'Failed to update profile');
      }

      updateUser(data.data.user);
      setSuccess(isNewUser ? 'Profile setup completed successfully' : 'Profile updated successfully');

      if (isNewUser) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
            <UserRound className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-text">
            {isNewUser ? 'Complete Your Profile' : 'Update Profile'}
          </h1>
          <p className="text-text-secondary mt-2">
            {isNewUser
              ? 'Before continuing, please complete your profile details.'
              : 'Keep your profile up to date for better trust and matching.'}
          </p>
        </div>

        <Card hover={false}>
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && !isNewUser && (
            <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                id="name"
                label="Full Name *"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                id="email"
                label="Email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                id="city"
                label="City"
                type="text"
                placeholder="Your city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <Input
                id="state"
                label="State"
                type="text"
                placeholder="Your state"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </div>

            <Input
              id="address"
              label="Address"
              type="text"
              placeholder="Your address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            <div className="grid sm:grid-cols-2 gap-3 text-xs text-text-secondary">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-hover border border-border">
                <Mail className="h-4 w-4 text-primary" />
                <span>Email helps recovery and updates</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-hover border border-border">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Location helps emergency matching</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-hover border border-border">
                <Home className="h-4 w-4 text-primary" />
                <span>Address improves trust verification</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-hover border border-border">
                <Building2 className="h-4 w-4 text-primary" />
                <span>City/state improve nearby discovery</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              {!isNewUser && (
                <Button type="button" variant="ghost" className="flex-1" onClick={() => navigate('/dashboard')}>
                  Back to Dashboard
                </Button>
              )}
              <Button type="submit" loading={saving} className="flex-1" size="lg">
                <Save className="h-4 w-4" />
                {isNewUser ? 'Complete Setup' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
