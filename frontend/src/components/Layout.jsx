import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Heart, HandCoins, Search, MapPin, LayoutDashboard,
  Menu, X, LogOut, User, Shield, Trophy, Settings as SettingsIcon,
  ChevronRight, Globe, MessageSquare, Link2, Mail,
} from 'lucide-react';
import NotificationBell from './NotificationBell';

/* ── Authenticated nav links (shown after login) ── */
const appNavLinks = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/blood', label: 'Blood', icon: Heart },
  { path: '/fund', label: 'Fund', icon: HandCoins },
  { path: '/missing', label: 'Missing', icon: Search },
  { path: '/map', label: 'Map', icon: MapPin },
  { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
];

/* ── Public nav links (shown before login) ── */
const publicNavLinks = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/mission', label: 'Mission' },
  { path: '/team', label: 'Team' },
  { path: '/contact', label: 'Contact' },
];

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  /* Track scroll for navbar shadow */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Close mobile menu on route change */
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const isLanding = location.pathname === '/';

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* ─────────── Navbar ─────────── */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-md border-b border-border'
            : 'bg-white/80 backdrop-blur-xl border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo ── Left */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="font-heading text-xl font-bold text-text tracking-tight">
                SAHYOG
              </span>
            </Link>

            {/* Desktop Nav ── Center */}
            <div className="hidden md:flex items-center gap-1">
              {isAuthenticated
                ? appNavLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isActive(link.path)
                            ? 'bg-primary/10 text-primary'
                            : 'text-text-secondary hover:text-text hover:bg-surface-hover'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {link.label}
                      </Link>
                    );
                  })
                : publicNavLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive(link.path)
                          ? 'text-primary'
                          : 'text-text-secondary hover:text-text hover:bg-surface-hover'
                      }`}
                    >
                      {link.label}
                      {isActive(link.path) && (
                        <motion.div
                          layoutId="nav-indicator"
                          className="absolute -bottom-[1px] left-3 right-3 h-0.5 bg-primary rounded-full"
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        />
                      )}
                    </Link>
                  ))}
            </div>

            {/* Right Side ── CTA / Profile */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <div className="hidden sm:block">
                    <NotificationBell />
                  </div>
                  <Link
                    to="/profile/setup"
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-hover hover:bg-primary/10 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-secondary to-secondary-dark flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-text">{user?.name || 'User'}</span>
                  </Link>
                  <Link
                    to="/settings"
                    className="hidden sm:flex p-2 rounded-xl text-text-secondary hover:bg-surface-hover transition-colors"
                    title="Settings"
                  >
                    <SettingsIcon className="h-5 w-5" />
                  </Link>
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
                    className="px-5 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-text hover:bg-surface-hover transition-all border border-border"
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
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ─── Mobile Menu ─── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="md:hidden border-t border-border bg-white overflow-hidden"
            >
              <div className="px-4 py-3 space-y-1">
                {isAuthenticated ? (
                  <>
                    {appNavLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.path}
                          to={link.path}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                            isActive(link.path)
                              ? 'bg-primary/10 text-primary'
                              : 'text-text-secondary hover:bg-surface-hover'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          {link.label}
                        </Link>
                      );
                    })}
                    <Link
                      to="/profile/setup"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:bg-surface-hover transition-all"
                    >
                      <User className="h-5 w-5" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:bg-surface-hover transition-all"
                    >
                      <SettingsIcon className="h-5 w-5" />
                      Settings
                    </Link>
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
                    {publicNavLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          isActive(link.path)
                            ? 'bg-primary/10 text-primary'
                            : 'text-text-secondary hover:bg-surface-hover'
                        }`}
                      >
                        {link.label}
                        <ChevronRight className="h-4 w-4 opacity-40" />
                      </Link>
                    ))}
                    <div className="pt-3 border-t border-border mt-2 space-y-2">
                      <Link
                        to="/login"
                        className="block px-4 py-3 rounded-xl text-sm font-medium text-center border border-border text-text-secondary hover:bg-surface-hover transition-all"
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

      {/* ─────────── Main Content ─────────── */}
      <main className="flex-1">
        {isLanding ? (
          children
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        )}
      </main>

      {/* ─────────── Footer ─────────── */}
      <footer className="border-t border-border mt-auto bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main footer grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-16">
            {/* Brand column */}
            <div className="md:col-span-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <span className="font-heading font-bold text-text text-lg">SAHYOG</span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed mb-6 max-w-xs">
                India's first AI-powered emergency and trust network. Connecting verified donors, transparent fundraising, and community-driven search — all in one platform.
              </p>
              <div className="flex items-center gap-3">
                {[MessageSquare, Globe, Link2, Mail].map((Icon, i) => (
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

            {/* Platform links */}
            <div className="md:col-span-2">
              <h4 className="font-bold text-text mb-4 text-sm uppercase tracking-wider">Platform</h4>
              <ul className="space-y-2.5">
                <li><Link to="/info/blood" className="text-sm text-text-secondary hover:text-primary transition-colors">Blood Donation</Link></li>
                <li><Link to="/info/fund" className="text-sm text-text-secondary hover:text-primary transition-colors">Fundraising</Link></li>
                <li><Link to="/info/missing" className="text-sm text-text-secondary hover:text-primary transition-colors">Missing Persons</Link></li>
                <li><Link to="/info/map" className="text-sm text-text-secondary hover:text-primary transition-colors">Live Map</Link></li>
              </ul>
            </div>

            {/* Company links */}
            <div className="md:col-span-2">
              <h4 className="font-bold text-text mb-4 text-sm uppercase tracking-wider">Company</h4>
              <ul className="space-y-2.5">
                <li><Link to="/about" className="text-sm text-text-secondary hover:text-primary transition-colors">About Us</Link></li>
                <li><Link to="/mission" className="text-sm text-text-secondary hover:text-primary transition-colors">Our Mission</Link></li>
                <li><Link to="/team" className="text-sm text-text-secondary hover:text-primary transition-colors">Our Team</Link></li>
                <li><Link to="/contact" className="text-sm text-text-secondary hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Resources links */}
            <div className="md:col-span-2">
              <h4 className="font-bold text-text mb-4 text-sm uppercase tracking-wider">Resources</h4>
              <ul className="space-y-2.5">
                <li><Link to="/about" className="text-sm text-text-secondary hover:text-primary transition-colors">How It Works</Link></li>
                <li><Link to="/leaderboard" className="text-sm text-text-secondary hover:text-primary transition-colors">Leaderboard</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="md:col-span-2">
              <h4 className="font-bold text-text mb-4 text-sm uppercase tracking-wider">Legal</h4>
              <ul className="space-y-2.5">
                <li><Link to="#" className="text-sm text-text-secondary hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link to="#" className="text-sm text-text-secondary hover:text-primary transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-border py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-text-muted">
              © {new Date().getFullYear()} SAHYOG — Built with ❤️ by Team FutureMinds
            </p>
            <p className="text-xs text-text-muted">
              When every second counts, trust SAHYOG.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
