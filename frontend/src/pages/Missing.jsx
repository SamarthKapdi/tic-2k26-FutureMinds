import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Plus, Eye, Clock, User } from 'lucide-react'
import {
  Button,
  Card,
  Input,
  Select,
  Badge,
  Spinner,
  EmptyState,
} from '../components/ui'
import { missingAPI } from '../lib/api'
import { timeAgo, formatDate } from '../lib/utils'
import { useAuth } from '../context/AuthContext'

export default function Missing() {
  const { isAuthenticated } = useAuth()
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showSightingModal, setShowSightingModal] = useState(null)
  const [reportImage, setReportImage] = useState(null)

  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: '',
    description: '',
    latitude: '',
    longitude: '',
    last_seen_address: '',
    city: '',
    contact_number: '',
    urgency: 'normal',
    unique_identifiers: '',
  })
  const [sightForm, setSightForm] = useState({
    latitude: '',
    longitude: '',
    address: '',
    description: '',
  })
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  useEffect(() => {
    loadCases()
  }, [])

  const loadCases = async () => {
    setLoading(true)
    try {
      const { data } = await missingAPI.list({ limit: 50 })
      setCases(data?.data?.missing_persons || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude.toString()
        const lng = pos.coords.longitude.toString()
        setForm((f) => ({ ...f, latitude: lat, longitude: lng }))
        setSightForm((f) => ({ ...f, latitude: lat, longitude: lng }))
      })
    }
  }

  const handleReport = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormLoading(true)
    try {
      const payload = new FormData()
      Object.entries(form).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          payload.append(key, value)
        }
      })
      if (reportImage) {
        payload.append('image', reportImage)
      }

      await missingAPI.report(payload)
      setFormSuccess('Missing person report created!')
      setShowReportModal(false)
      setReportImage(null)
      loadCases()
      setTimeout(() => setFormSuccess(''), 3000)
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create report')
    } finally {
      setFormLoading(false)
    }
  }

  const handleSighting = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormLoading(true)
    try {
      await missingAPI.reportSighting({
        missing_person_id: showSightingModal,
        ...sightForm,
      })
      setFormSuccess('Sighting reported! Thank you for your help.')
      setShowSightingModal(null)
      loadCases()
      setTimeout(() => setFormSuccess(''), 3000)
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to report sighting')
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text flex items-center gap-2">
            <Search className="h-7 w-7 text-secondary" />
            Missing Persons
          </h1>
          <p className="text-text-secondary mt-1">
            Help find missing loved ones through community reporting
          </p>
        </div>
        {isAuthenticated && (
          <Button
            onClick={() => {
              getLocation()
              setShowReportModal(true)
            }}
          >
            <Plus className="h-4 w-4" />
            Report Missing
          </Button>
        )}
      </div>

      <AnimatePresence>
        {formSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium"
          >
            ✅ {formSuccess}
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <Spinner />
      ) : cases.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No missing person reports"
          description="Currently there are no active missing person reports."
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((mp) => (
            <Card key={mp.id} className="!p-0 overflow-hidden">
              <div className="h-44 bg-gradient-to-br from-secondary/20 via-blue-50 to-indigo-50 flex items-center justify-center relative overflow-hidden">
                {mp.image_url ? (
                  <img
                    src={mp.image_url}
                    alt={mp.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-20 w-20 text-secondary/30" />
                )}
                <div className="absolute top-3 right-3">
                  <Badge variant={mp.urgency}>{mp.urgency}</Badge>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-heading text-lg font-bold text-text">
                  {mp.name}
                </h3>
                <div className="flex items-center gap-3 text-sm text-text-secondary mt-1">
                  {mp.age && <span>Age: {mp.age}</span>}
                  {mp.gender && <span>• {mp.gender}</span>}
                </div>
                {mp.city && (
                  <p className="text-sm text-text-secondary flex items-center gap-1 mt-2">
                    <MapPin className="h-3.5 w-3.5" /> Last seen:{' '}
                    {mp.last_seen_address || mp.city}
                  </p>
                )}
                <p className="text-sm text-text-secondary flex items-center gap-1 mt-1">
                  <Clock className="h-3.5 w-3.5" /> Reported{' '}
                  {timeAgo(mp.created_at)}
                </p>
                {mp.description && (
                  <p className="text-sm text-text-secondary mt-2 line-clamp-2">
                    {mp.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
                  <span className="text-xs text-text-muted flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" /> {mp.sighting_count || 0}{' '}
                    sightings
                  </span>
                  {isAuthenticated && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        getLocation()
                        setShowSightingModal(mp.id)
                      }}
                    >
                      Report Sighting
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Report Missing Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowReportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-heading text-xl font-bold text-text mb-4">
                Report Missing Person
              </h2>
              {formError && (
                <div className="mb-3 p-3 rounded-xl bg-red-50 text-sm text-red-700">
                  {formError}
                </div>
              )}
              <form onSubmit={handleReport} className="space-y-4">
                <Input
                  id="mp_name"
                  label="Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    id="mp_age"
                    label="Age"
                    type="number"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                  />
                  <Select
                    id="mp_gender"
                    label="Gender"
                    value={form.gender}
                    onChange={(e) =>
                      setForm({ ...form, gender: e.target.value })
                    }
                    options={[
                      { value: '', label: 'Select' },
                      { value: 'Male', label: 'Male' },
                      { value: 'Female', label: 'Female' },
                      { value: 'Other', label: 'Other' },
                    ]}
                  />
                  <Select
                    id="mp_urgency"
                    label="Urgency"
                    value={form.urgency}
                    onChange={(e) =>
                      setForm({ ...form, urgency: e.target.value })
                    }
                    options={[
                      { value: 'normal', label: 'Normal' },
                      { value: 'urgent', label: 'Urgent' },
                      { value: 'critical', label: 'Critical' },
                    ]}
                  />
                </div>
                <Input
                  id="mp_address"
                  label="Last Seen Address"
                  value={form.last_seen_address}
                  onChange={(e) =>
                    setForm({ ...form, last_seen_address: e.target.value })
                  }
                />
                <Input
                  id="mp_city"
                  label="City"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="mp_lat"
                    label="Latitude"
                    value={form.latitude}
                    onChange={(e) =>
                      setForm({ ...form, latitude: e.target.value })
                    }
                    required
                  />
                  <Input
                    id="mp_lng"
                    label="Longitude"
                    value={form.longitude}
                    onChange={(e) =>
                      setForm({ ...form, longitude: e.target.value })
                    }
                    required
                  />
                </div>
                <Input
                  id="mp_contact"
                  label="Contact Number"
                  value={form.contact_number}
                  onChange={(e) =>
                    setForm({ ...form, contact_number: e.target.value })
                  }
                />
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text">
                    Description
                  </label>
                  <textarea
                    id="mp_desc"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all h-20 resize-none"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>
                <Input
                  id="mp_ids"
                  label="Unique Identifiers (scars, tattoos, etc.)"
                  value={form.unique_identifiers}
                  onChange={(e) =>
                    setForm({ ...form, unique_identifiers: e.target.value })
                  }
                />
                <div className="space-y-1.5">
                  <label
                    htmlFor="mp_img"
                    className="block text-sm font-medium text-text"
                  >
                    Upload Image (optional)
                  </label>
                  <input
                    id="mp_img"
                    type="file"
                    accept="image/*"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-text file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20"
                    onChange={(e) =>
                      setReportImage(e.target.files?.[0] || null)
                    }
                  />
                  <p className="text-xs text-text-muted">Max size: 5MB</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowReportModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={formLoading}
                    className="flex-1"
                  >
                    Submit Report
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sighting Modal */}
      <AnimatePresence>
        {showSightingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowSightingModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-heading text-xl font-bold text-text mb-4">
                Report Sighting
              </h2>
              {formError && (
                <div className="mb-3 p-3 rounded-xl bg-red-50 text-sm text-red-700">
                  {formError}
                </div>
              )}
              <form onSubmit={handleSighting} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="sight_lat"
                    label="Latitude"
                    value={sightForm.latitude}
                    onChange={(e) =>
                      setSightForm({ ...sightForm, latitude: e.target.value })
                    }
                    required
                  />
                  <Input
                    id="sight_lng"
                    label="Longitude"
                    value={sightForm.longitude}
                    onChange={(e) =>
                      setSightForm({ ...sightForm, longitude: e.target.value })
                    }
                    required
                  />
                </div>
                <Input
                  id="sight_addr"
                  label="Address / Location"
                  value={sightForm.address}
                  onChange={(e) =>
                    setSightForm({ ...sightForm, address: e.target.value })
                  }
                />
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text">
                    Description
                  </label>
                  <textarea
                    id="sight_desc"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all h-20 resize-none"
                    value={sightForm.description}
                    onChange={(e) =>
                      setSightForm({
                        ...sightForm,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowSightingModal(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={formLoading}
                    className="flex-1"
                  >
                    Report Sighting
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
