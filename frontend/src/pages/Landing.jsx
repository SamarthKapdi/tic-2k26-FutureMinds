import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, Users, Zap, ArrowRight, MapPin, CheckCircle,
  Heart, HandCoins, Search, ChevronRight,
} from 'lucide-react';
import { Button } from '../components/ui';

/* ── Data ── */
const stats = [
  { value: '10K+', label: 'Lives Saved', icon: Heart },
  { value: '50K+', label: 'Active Donors', icon: Users },
  { value: '₹2Cr+', label: 'Funds Raised', icon: HandCoins },
  { value: '500+', label: 'Families Reunited', icon: Search },
];

const features = [
  {
    icon: Heart,
    title: 'Blood Donation',
    desc: 'GPS-powered real-time matching between blood requests and nearby verified donors.',
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    link: '/info/blood',
  },
  {
    icon: HandCoins,
    title: 'Verified Fundraising',
    desc: 'Document-verified campaigns with transparency tracking so every rupee reaches the right hands.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    link: '/info/fund',
  },
  {
    icon: Search,
    title: 'Missing Persons',
    desc: 'Geo-fenced community alerts and real-time sighting reports to locate missing loved ones fast.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    link: '/info/missing',
  },
];

const trustPoints = [
  'Document-verified user profiles',
  'AI-powered fraud detection',
  'Community-driven trust scores',
];

/* ── Animations ── */
const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export default function Landing() {
  return (
    <div>
      {/* ═══════════ Hero Section ═══════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-red-50/30 to-blue-50/20 py-24 sm:py-32 lg:py-40">
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl float-animation" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-secondary/5 blur-3xl float-animation-delay" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/3 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div {...fadeUp}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-8 border border-primary/20">
                <Zap className="h-4 w-4" />
                AI-Powered Emergency Network
              </div>
            </motion.div>

            <motion.h1
              {...fadeUp}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="font-heading text-5xl sm:text-6xl lg:text-7xl font-extrabold text-text leading-tight"
            >
              When Every Second
              <span className="block bg-gradient-to-r from-primary via-primary-dark to-secondary bg-clip-text text-transparent">
                Counts, Trust SAHYOG
              </span>
            </motion.h1>

            <motion.p
              {...fadeUp}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mt-6 text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed"
            >
              A unified platform connecting people in crisis with those who can help — blood, funds, and search support in real time.
            </motion.p>

            <motion.div
              {...fadeUp}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/login">
                <Button size="lg" className="text-base px-10">
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/info/map">
                <Button variant="outline" size="lg" className="text-base">
                  <MapPin className="h-5 w-5" />
                  View Live Map
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ Stats Bar ═══════════ */}
      <section className="bg-white border-y border-border py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold font-heading bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-text-secondary mt-1 font-medium">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ Trust Highlight (compact) ═══════════ */}
      <section className="py-20 bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text side */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-semibold mb-6">
                <Shield className="h-3.5 w-3.5" />
                Trust Score System
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text mb-4">
                Built on Trust,{' '}
                <span className="text-secondary">Verified by Community</span>
              </h2>
              <p className="text-text-secondary leading-relaxed mb-8">
                Every user earns a dynamic trust score ensuring that every donation reaches the right hands and every emergency gets genuine help.
              </p>
              <div className="space-y-3">
                {trustPoints.map((text) => (
                  <div key={text} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-success shrink-0" />
                    <span className="text-sm font-medium text-text">{text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Trust card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="glass-card p-8 relative overflow-hidden max-w-sm mx-auto lg:mx-0 lg:ml-auto">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-secondary/10 to-transparent rounded-bl-[60px]" />
                <div className="text-center relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-secondary to-secondary-dark flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Users className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-text">Trust Score</h3>
                  <div className="text-5xl font-extrabold text-secondary mt-2">87/100</div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '87%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      className="bg-gradient-to-r from-secondary to-secondary-light h-3 rounded-full"
                    />
                  </div>
                  <p className="text-sm text-text-secondary mt-3">Verified Donor · 12 Contributions</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ Feature Cards (brief) ═══════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text mb-4">
              Three Pillars of <span className="gradient-text">Emergency Response</span>
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              Each module addresses a critical gap in India's emergency infrastructure.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                >
                  <Link
                    to={feat.link}
                    className="block glass-card p-8 h-full group cursor-pointer"
                  >
                    <div className={`w-14 h-14 rounded-2xl ${feat.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <Icon className={`h-7 w-7 ${feat.color}`} />
                    </div>
                    <h3 className="font-heading font-bold text-xl text-text mb-3">
                      {feat.title}
                    </h3>
                    <p className="text-text-secondary text-sm leading-relaxed mb-4">
                      {feat.desc}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                      Learn more <ChevronRight className="h-4 w-4" />
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary-dark to-secondary-dark relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute bottom-10 left-10 w-64 h-64 rounded-full bg-white/5 blur-2xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-6">
              Join India's Most Trusted Emergency Network
            </h2>
            <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
              Be the change. Register as a donor, start a verified campaign, or help find someone's missing loved one.
            </p>
            <Link to="/login">
              <Button variant="outline" size="lg" className="!border-white !text-white hover:!bg-white hover:!text-primary text-base">
                Join SAHYOG Now
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
