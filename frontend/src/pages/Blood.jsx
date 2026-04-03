import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MapPin, Clock, Users, Plus, Search, Filter } from 'lucide-react';
import { Button, Card, Input, Select, Badge, Spinner, EmptyState } from '../components/ui';
import { bloodAPI } from '../lib/api';
import { timeAgo, getUrgencyColor } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Blood() {
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState('requests'); // requests | donate | history
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDonorModal, setShowDonorModal] = useState(false);

  // Create request form
  const [reqForm, setReqForm] = useState({
    patient_name: '', blood_group: 'A+', units_needed: 1, urgency: 'normal',
    hospital_name: '', hospital_address: '', latitude: '', longitude: '',
    city: '', contact_number: '', description: '',
  });

  // Donor form
  const [donorForm, setDonorForm] = useState({
    blood_group: 'A+', latitude: '', longitude: '', address: '', city: '',
  });

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const { data } = await bloodAPI.getRequests({ limit: 50 });
      setRequests(data?.data?.requests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude.toString();
        const lng = pos.coords.longitude.toString();
        setReqForm((f) => ({ ...f, latitude: lat, longitude: lng }));
        setDonorForm((f) => ({ ...f, latitude: lat, longitude: lng }));
      });
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      await bloodAPI.createRequest(reqForm);
      setFormSuccess('Blood request created successfully!');
      setShowCreateModal(false);
      loadRequests();
      setTimeout(() => setFormSuccess(''), 3000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create request');
    } finally {
      setFormLoading(false);
    }
  };

  const handleRegisterDonor = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      await bloodAPI.registerDonor(donorForm);
      setFormSuccess('Registered as blood donor successfully!');
      setShowDonorModal(false);
      setTimeout(() => setFormSuccess(''), 3000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to register as donor');
    } finally {
      setFormLoading(false);
    }
  };

  const handleRespond = async (requestId) => {
    try {
      await bloodAPI.respond({ request_id: requestId, message: 'I would like to donate!' });
      setFormSuccess('Response submitted!');
      setTimeout(() => setFormSuccess(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to respond');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text flex items-center gap-2">
            <Heart className="h-7 w-7 text-primary" />
            Blood Donation
          </h1>
          <p className="text-text-secondary mt-1">Save lives by donating blood or requesting donors near you</p>
        </div>
        {isAuthenticated && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { getLocation(); setShowDonorModal(true); }}>
              <Users className="h-4 w-4" />
              Register as Donor
            </Button>
            <Button onClick={() => { getLocation(); setShowCreateModal(true); }}>
              <Plus className="h-4 w-4" />
              Request Blood
            </Button>
          </div>
        )}
      </div>

      {/* Success message */}
      <AnimatePresence>
        {formSuccess && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
            ✅ {formSuccess}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Requests Grid */}
      {loading ? <Spinner /> : requests.length === 0 ? (
        <EmptyState icon={Heart} title="No active blood requests" description="There are no blood requests at the moment. Check back later or create one." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map((req) => (
            <Card key={req.id} className="!p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">{req.blood_group}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-text">{req.patient_name}</h3>
                    <p className="text-xs text-text-secondary">{req.requester_name}</p>
                  </div>
                </div>
                <Badge variant={req.urgency}>{req.urgency}</Badge>
              </div>
              {req.hospital_name && (
                <p className="text-sm text-text-secondary flex items-center gap-1 mb-1">
                  <MapPin className="h-3.5 w-3.5" /> {req.hospital_name}
                </p>
              )}
              <p className="text-sm text-text-secondary flex items-center gap-1 mb-3">
                <Clock className="h-3.5 w-3.5" /> {timeAgo(req.created_at)}
              </p>
              {req.description && <p className="text-sm text-text-secondary mb-3 line-clamp-2">{req.description}</p>}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-xs text-text-muted">{req.units_needed} unit(s) needed · {req.response_count || 0} responses</span>
                {isAuthenticated && (
                  <Button size="sm" variant="outline" onClick={() => handleRespond(req.id)}>
                    Donate
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Request Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowCreateModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <h2 className="font-heading text-xl font-bold text-text mb-4">Create Blood Request</h2>
              {formError && <div className="mb-3 p-3 rounded-xl bg-red-50 text-sm text-red-700">{formError}</div>}
              <form onSubmit={handleCreateRequest} className="space-y-4">
                <Input id="patient" label="Patient Name" value={reqForm.patient_name} onChange={(e) => setReqForm({ ...reqForm, patient_name: e.target.value })} required />
                <div className="grid grid-cols-2 gap-4">
                  <Select id="blood_group" label="Blood Group" value={reqForm.blood_group} onChange={(e) => setReqForm({ ...reqForm, blood_group: e.target.value })}
                    options={bloodGroups.map((g) => ({ value: g, label: g }))} />
                  <Select id="urgency" label="Urgency" value={reqForm.urgency} onChange={(e) => setReqForm({ ...reqForm, urgency: e.target.value })}
                    options={[{ value: 'normal', label: 'Normal' }, { value: 'urgent', label: 'Urgent' }, { value: 'critical', label: 'Critical' }]} />
                </div>
                <Input id="hospital" label="Hospital Name" value={reqForm.hospital_name} onChange={(e) => setReqForm({ ...reqForm, hospital_name: e.target.value })} />
                <Input id="city" label="City" value={reqForm.city} onChange={(e) => setReqForm({ ...reqForm, city: e.target.value })} />
                <div className="grid grid-cols-2 gap-4">
                  <Input id="lat" label="Latitude" value={reqForm.latitude} onChange={(e) => setReqForm({ ...reqForm, latitude: e.target.value })} required />
                  <Input id="lng" label="Longitude" value={reqForm.longitude} onChange={(e) => setReqForm({ ...reqForm, longitude: e.target.value })} required />
                </div>
                <Input id="contact" label="Contact Number" value={reqForm.contact_number} onChange={(e) => setReqForm({ ...reqForm, contact_number: e.target.value })} />
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                  <Button type="submit" loading={formLoading} className="flex-1">Create Request</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Register Donor Modal */}
      <AnimatePresence>
        {showDonorModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowDonorModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
              <h2 className="font-heading text-xl font-bold text-text mb-4">Register as Blood Donor</h2>
              {formError && <div className="mb-3 p-3 rounded-xl bg-red-50 text-sm text-red-700">{formError}</div>}
              <form onSubmit={handleRegisterDonor} className="space-y-4">
                <Select id="donor_bg" label="Blood Group" value={donorForm.blood_group} onChange={(e) => setDonorForm({ ...donorForm, blood_group: e.target.value })}
                  options={bloodGroups.map((g) => ({ value: g, label: g }))} />
                <Input id="donor_city" label="City" value={donorForm.city} onChange={(e) => setDonorForm({ ...donorForm, city: e.target.value })} />
                <div className="grid grid-cols-2 gap-4">
                  <Input id="donor_lat" label="Latitude" value={donorForm.latitude} onChange={(e) => setDonorForm({ ...donorForm, latitude: e.target.value })} required />
                  <Input id="donor_lng" label="Longitude" value={donorForm.longitude} onChange={(e) => setDonorForm({ ...donorForm, longitude: e.target.value })} required />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setShowDonorModal(false)}>Cancel</Button>
                  <Button type="submit" loading={formLoading} className="flex-1">Register</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
