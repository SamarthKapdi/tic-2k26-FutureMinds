import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HandCoins, Plus, Target, Users, TrendingUp, Heart } from 'lucide-react';
import { Button, Card, Input, Select, Badge, Spinner, EmptyState } from '../components/ui';
import { fundAPI } from '../lib/api';
import { formatCurrency, timeAgo } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export default function Fund() {
  const { isAuthenticated } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDonateModal, setShowDonateModal] = useState(null);

  const [form, setForm] = useState({
    title: '', description: '', target_amount: '', category_id: '', urgency: 'normal',
  });
  const [donateForm, setDonateForm] = useState({
    amount: '', donor_name: '', donor_email: '', donor_phone: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [campRes, catRes] = await Promise.all([
        fundAPI.listCampaigns({ limit: 50 }),
        fundAPI.getCategories(),
      ]);
      setCampaigns(campRes.data?.data?.campaigns || []);
      setCategories(catRes.data?.data?.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      await fundAPI.createCampaign(form);
      setFormSuccess('Campaign created successfully!');
      setShowCreateModal(false);
      loadData();
      setTimeout(() => setFormSuccess(''), 3000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create campaign');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDonate = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      const { data } = await fundAPI.donate({
        campaign_id: showDonateModal,
        ...donateForm,
      });
      if (data.data?.payment_link) {
        window.open(data.data.payment_link, '_blank');
      }
      setFormSuccess('Donation order created! Completing payment...');
      setShowDonateModal(null);
      setTimeout(() => setFormSuccess(''), 5000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to process donation');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text flex items-center gap-2">
            <HandCoins className="h-7 w-7 text-accent" />
            Fundraising
          </h1>
          <p className="text-text-secondary mt-1">Support verified causes and make a real difference</p>
        </div>
        {isAuthenticated && (
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4" />
            Start Campaign
          </Button>
        )}
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button className="px-4 py-2 rounded-xl text-sm font-medium bg-primary/10 text-primary">All</button>
          {categories.map((cat) => (
            <button key={cat.id} className="px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:bg-surface-hover transition-colors">
              {cat.name}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {formSuccess && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
            ✅ {formSuccess}
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? <Spinner /> : campaigns.length === 0 ? (
        <EmptyState icon={HandCoins} title="No active campaigns" description="Be the first to start a fundraising campaign and make a difference." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((camp) => (
            <Card key={camp.id} className="!p-0 overflow-hidden">
              <div className="h-40 bg-gradient-to-br from-accent/20 via-amber-50 to-orange-50 flex items-center justify-center">
                <HandCoins className="h-16 w-16 text-accent/40" />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-heading font-bold text-text line-clamp-2 flex-1">{camp.title}</h3>
                  <Badge variant={camp.urgency} className="ml-2 flex-shrink-0">{camp.urgency}</Badge>
                </div>
                {camp.category_name && (
                  <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-medium mb-3">
                    {camp.category_name}
                  </span>
                )}
                <p className="text-sm text-text-secondary line-clamp-2 mb-4">{camp.description}</p>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-text">{formatCurrency(camp.raised_amount)}</span>
                    <span className="text-text-muted">of {formatCurrency(camp.target_amount)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(camp.progress_percentage || 0, 100)}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="bg-gradient-to-r from-accent to-amber-500 h-2.5 rounded-full"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-text-muted mb-4">
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {camp.donor_count || 0} donors</span>
                  <span>{timeAgo(camp.created_at)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted flex-1">
                    by {camp.creator_name} {camp.is_verified && '✓'}
                  </span>
                  {isAuthenticated && (
                    <Button size="sm" onClick={() => setShowDonateModal(camp.id)}>
                      <Heart className="h-3.5 w-3.5" />
                      Donate
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Campaign Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowCreateModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <h2 className="font-heading text-xl font-bold text-text mb-4">Start a Campaign</h2>
              {formError && <div className="mb-3 p-3 rounded-xl bg-red-50 text-sm text-red-700">{formError}</div>}
              <form onSubmit={handleCreateCampaign} className="space-y-4">
                <Input id="camp_title" label="Campaign Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text">Description</label>
                  <textarea id="camp_desc" className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all h-24 resize-none"
                    value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input id="camp_amount" label="Target Amount (₹)" type="number" min="100" value={form.target_amount} onChange={(e) => setForm({ ...form, target_amount: e.target.value })} required />
                  <Select id="camp_urgency" label="Urgency" value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                    options={[{ value: 'normal', label: 'Normal' }, { value: 'urgent', label: 'Urgent' }, { value: 'critical', label: 'Critical' }]} />
                </div>
                {categories.length > 0 && (
                  <Select id="camp_cat" label="Category" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    options={[{ value: '', label: 'Select Category' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]} />
                )}
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                  <Button type="submit" loading={formLoading} className="flex-1">Create Campaign</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Donate Modal */}
      <AnimatePresence>
        {showDonateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowDonateModal(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <h2 className="font-heading text-xl font-bold text-text mb-4">Make a Donation</h2>
              {formError && <div className="mb-3 p-3 rounded-xl bg-red-50 text-sm text-red-700">{formError}</div>}
              <form onSubmit={handleDonate} className="space-y-4">
                <Input id="donate_amount" label="Amount (₹)" type="number" min="1" value={donateForm.amount} onChange={(e) => setDonateForm({ ...donateForm, amount: e.target.value })} required />
                <Input id="donate_name" label="Your Name" value={donateForm.donor_name} onChange={(e) => setDonateForm({ ...donateForm, donor_name: e.target.value })} />
                <Input id="donate_email" label="Email" type="email" value={donateForm.donor_email} onChange={(e) => setDonateForm({ ...donateForm, donor_email: e.target.value })} />
                <Input id="donate_phone" label="Phone" value={donateForm.donor_phone} onChange={(e) => setDonateForm({ ...donateForm, donor_phone: e.target.value })} />
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setShowDonateModal(null)}>Cancel</Button>
                  <Button type="submit" loading={formLoading} className="flex-1">
                    <Heart className="h-4 w-4" />
                    Donate Now
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
