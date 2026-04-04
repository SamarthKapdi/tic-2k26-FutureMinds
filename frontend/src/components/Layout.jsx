import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import {
  Heart,
  HandCoins,
  Search,
  MapPin,
  LayoutDashboard,
  Menu,
  X,
  LogOut,
  User,
  Shield,
  Trophy,
  Settings as SettingsIcon,
  ChevronRight,
  ChevronDown,
  Globe,
  MessageSquare,
  Link2,
  Mail,
} from 'lucide-react'
import NotificationBell from './NotificationBell'

/* ── Public nav links (shown in navbar for everyone) ── */
const publicLinks = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/mission', label: 'Mission' },
  { path: '/team', label: 'Team' },
  { path: '/contact', label: 'Contact' },
]

/* ── Authenticated nav links ── */
const authLinks = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/blood', label: 'Blood', icon: Heart },
  { path: '/fund', label: 'Fund', icon: HandCoins },
  { path: '/missing', label: 'Missing', icon: Search },
  { path: '/map', label: 'Map', icon: MapPin },
  { path: '/leaderboard', label: 'Board', icon: Trophy },
]

/* ── Footer link groups ── */
const footerGroups = [
  {
    title: 'Platform',
    links: [
      { to: '/info/blood', label: 'Blood Donation' },
      { to: '/info/fund', label: 'Fundraising' },
      { to: '/info/missing', label: 'Missing Persons' },
      { to: '/info/map', label: 'Live Map' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/about', label: 'About Us' },
      { to: '/mission', label: 'Our Mission' },
      { to: '/team', label: 'Team' },
      { to: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { to: '#', label: 'Privacy Policy' },
      { to: '#', label: 'Terms of Service' },
      { to: '#', label: 'Cookie Policy' },
    ],
  },
]

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const profileMenuRef = useRef(null)

  /* ── Scroll-aware navbar shadow ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ── Auto-close mobile menu on route change ── */
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    setProfileMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setProfileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isLanding = location.pathname === '/'

  return (
    <div className="min-h-screen bg-bg">
      {/* ══════════════════════════════════════════
          NAVBAR
         ══════════════════════════════════════════ */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-border'
            : 'bg-white/80 backdrop-blur-xl border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center group-hover:scale-105 transition-transform">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="font-heading text-xl font-bold text-text">
                SAHYOG
              </span>
            </Link>

            {/* ── Desktop navigation ── */}
            <div className="hidden md:flex items-center gap-1">
              {isAuthenticated
                ? /* Authenticated: show module links */
                  authLinks.map((link) => {
                    const Icon = link.icon
                    const isActive = location.pathname === link.path
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-text-secondary hover:text-text hover:bg-surface-hover'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {link.label}
                        {isActive && (
                          <motion.div
                            layoutId="navbar-indicator"
                            className="absolute -bottom-[1px] left-3 right-3 h-[2px] bg-primary rounded-full"
                          />
                        )}
                      </Link>
                    )
                  })
                : /* Guest: show public links */
                  publicLinks.map((link) => {
                    const isActive = location.pathname === link.path
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'text-primary'
                            : 'text-text-secondary hover:text-text hover:bg-surface-hover'
                        }`}
                      >
                        {link.label}
                        {isActive && (
                          <motion.div
                            layoutId="navbar-indicator"
                            className="absolute -bottom-[1px] left-3 right-3 h-[2px] bg-primary rounded-full"
                          />
                        )}
                      </Link>
                    )
                  })}
            </div>

            {/* ── Right side ── */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <NotificationBell />
                  <Link
                    to="/settings"
                    className="relative p-2 rounded-xl text-text-secondary hover:bg-surface-hover transition-colors hidden sm:block"
                    title="Settings"
                  >
                    <SettingsIcon className="h-5 w-5" />
                  </Link>
                  <div
                    className="relative hidden sm:block"
                    ref={profileMenuRef}
                  >
                    <button
                      onClick={() => setProfileMenuOpen((prev) => !prev)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-hover hover:bg-surface transition-colors"
                      title="Open profile menu"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-secondary to-secondary-dark flex items-center justify-center overflow-hidden">
                        {user?.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user?.name || 'User'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-text max-w-[100px] truncate">
                        {user?.name || 'User'}
                      </span>
                      <ChevronDown className="h-4 w-4 text-text-muted" />
                    </button>

                    <AnimatePresence>
                      {profileMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.98 }}
                          transition={{ duration: 0.12 }}
                          className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-white shadow-lg z-50 p-1"
                        >
                          <Link
                            to="/settings"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text hover:bg-surface-hover"
                          >
                            <User className="h-4 w-4" />
                            Edit Profile
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl text-text-secondary hover:bg-red-50 hover:text-danger transition-colors cursor-pointer"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <div className="hidden sm:flex gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-text hover:bg-surface-hover transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition-all shadow-sm hover:shadow-md"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-xl text-text-secondary hover:bg-surface-hover cursor-pointer"
              >
                {mobileOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border bg-white"
            >
              <div className="px-4 py-3 space-y-1">
                {isAuthenticated ? (
                  <>
                    {authLinks.map((link) => {
                      const Icon = link.icon
                      const isActive = location.pathname === link.path
                      return (
                        <Link
                          key={link.path}
                          to={link.path}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                            isActive
                              ? 'bg-primary/10 text-primary'
                              : 'text-text-secondary hover:bg-surface-hover'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          {link.label}
                        </Link>
                      )
                    })}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-danger hover:bg-red-50 transition-all cursor-pointer"
                    >
                      <LogOut className="h-5 w-5" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    {publicLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          location.pathname === link.path
                            ? 'bg-primary/10 text-primary'
                            : 'text-text-secondary hover:bg-surface-hover'
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                    <div className="pt-2 space-y-2">
                      <Link
                        to="/login"
                        className="block px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:bg-surface-hover transition-all text-center"
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="block px-4 py-3 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition-all text-center"
                      >
                        Get Started
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ══════════════════════════════════════════
          MAIN CONTENT
         ══════════════════════════════════════════ */}
      <main
        className={
          isLanding ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'
        }
      >
        {children}
      </main>

      {/* ══════════════════════════════════════════
          FOOTER
         ══════════════════════════════════════════ */}
      <footer className="border-t border-border mt-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-12 gap-8">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-4">
              <Link to="/" className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="font-heading text-xl font-bold text-text">
                  SAHYOG
                </span>
              </Link>
              <p className="text-sm text-text-secondary leading-relaxed mb-4 max-w-xs">
                India's first AI-powered emergency & trust network. Connecting
                people in crisis with those who can help.
              </p>
              <div className="flex gap-3">
                {[Globe, MessageSquare, Link2, Mail].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-9 h-9 rounded-xl bg-surface-hover flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-all"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link groups */}
            {footerGroups.map((group) => (
              <div key={group.title} className="col-span-1 md:col-span-2">
                <h4 className="font-heading font-semibold text-text text-sm mb-4">
                  {group.title}
                </h4>
                <ul className="space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="text-sm text-text-secondary hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Newsletter */}
            <div className="col-span-2">
              <h4 className="font-heading font-semibold text-text text-sm mb-4">
                Stay Updated
              </h4>
              <p className="text-sm text-text-secondary mb-3">
                Get updates on emergency response and community safety.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 px-3 py-2 rounded-xl border border-border bg-surface text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                <button className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors cursor-pointer">
                  Join
                </button>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="section-divider mt-10 mb-6" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-text-muted">
              © {new Date().getFullYear()} SAHYOG — AI Powered Emergency & Trust
              Network
            </p>
            <p className="text-xs text-text-muted">
              Built with ❤️ by{' '}
              <span className="font-semibold text-text-secondary">
                Team FutureMinds
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
