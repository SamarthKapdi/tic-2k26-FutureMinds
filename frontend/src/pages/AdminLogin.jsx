import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import { Button, Input, Card } from '../components/ui'
import { adminAPI } from '../lib/api'

const BRAND_LOGO_SRC = '/WhatsApp%20Image%202026-04-05%20at%201.07.09%20AM.jpeg'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await adminAPI.login({ email, password })
      if (data.success) {
        localStorage.setItem('sahyog_admin_token', data.data.token)
        localStorage.setItem('sahyog_admin', JSON.stringify(data.data.admin))
        navigate('/admin/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDummyAdminLogin = () => {
    localStorage.setItem('sahyog_admin_token', 'dummy_admin_token')
    localStorage.setItem(
      'sahyog_admin',
      JSON.stringify({
        id: 'dummy',
        name: 'Dev Admin',
        email: 'admin@sahyog.org',
        role: 'super_admin',
      })
    )
    navigate('/admin/dashboard')
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src={BRAND_LOGO_SRC}
            alt="SAHYOG Logo"
            className="w-16 h-16 rounded-2xl object-cover mx-auto mb-4 shadow-lg shadow-secondary/20"
          />
          <h1 className="font-heading text-2xl font-bold text-text">
            Admin Panel
          </h1>
          <p className="text-text-secondary mt-1">
            Login with your admin credentials
          </p>
        </div>
        <Card hover={false}>
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              id="admin_email"
              label="Email"
              type="email"
              placeholder="admin@sahyog.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              id="admin_pass"
              label="Password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
              variant="secondary"
            >
              Login as Admin <ArrowRight className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              onClick={handleDummyAdminLogin}
              className="w-full bg-gray-800 text-white hover:bg-gray-900"
              size="lg"
            >
              Dummy Admin Login (Dev Only)
            </Button>
          </form>
        </Card>
        <p className="text-center text-xs text-text-muted mt-4">
          Default: admin@sahyog.org / admin123
        </p>
      </div>
    </div>
  )
}
