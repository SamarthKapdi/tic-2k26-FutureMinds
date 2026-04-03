import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Heart, HandCoins, Search, MapPin, LayoutDashboard,
  Menu, X, LogOut, User, Shield, Bell
} from 'lucide-react';

const navLinks = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/blood', label: 'Blood', icon: Heart },
  { path: '/fund', label: 'Fund', icon: HandCoins },
  { path: '/missing', label: 'Missing', icon: Search },
  { path: '/map', label: 'Map', icon: MapPin },
];

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="font-heading text-xl font-bold text-text">
                SAHYOG
              </span>
            </Link>

            {/* Desktop Nav */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-text-secondary hover:text-text hover:bg-surface-hover'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <button className="relative p-2 rounded-xl text-text-secondary hover:bg-surface-hover transition-colors hidden sm:block">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
                  </button>
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-hover">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-secondary to-secondary-dark flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-text">{user?.name || 'User'}</span>
                  </div>
                  <button onClick={handleLogout} className="p-2 rounded-xl text-text-secondary hover:bg-red-50 hover:text-danger transition-colors" title="Logout">
                    <LogOut className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <div className="hidden sm:flex gap-2">
                  <Link to="/login" className="px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-text hover:bg-surface-hover transition-all">
                    Login
                  </Link>
                  <Link to="/login" className="px-4 py-2 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary-dark transition-all shadow-sm">
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile toggle */}
              <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-xl text-text-secondary hover:bg-surface-hover">
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
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
                    {navLinks.map((link) => {
                      const Icon = link.icon;
                      const isActive = location.pathname === link.path;
                      return (
                        <Link
                          key={link.path}
                          to={link.path}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                            isActive ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-surface-hover'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          {link.label}
                        </Link>
                      );
                    })}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-danger hover:bg-red-50 transition-all"
                    >
                      <LogOut className="h-5 w-5" />
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 rounded-xl text-sm font-medium text-primary hover:bg-primary/10 transition-all"
                  >
                    Login / Sign Up
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="font-heading font-bold text-text">SAHYOG</span>
            </div>
            <p className="text-sm text-text-muted">
              © {new Date().getFullYear()} SAHYOG — AI Powered Emergency & Trust Network. Built with ❤️ by FutureMinds
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
