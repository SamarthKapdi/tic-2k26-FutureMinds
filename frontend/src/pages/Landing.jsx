import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, HandCoins, Search, MapPin, Shield, Users, Zap, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui';

const stats = [
  { value: '10K+', label: 'Lives Saved' },
  { value: '50K+', label: 'Active Donors' },
  { value: '₹2Cr+', label: 'Funds Raised' },
  { value: '500+', label: 'Reunited Families' },
];

const features = [
  {
    icon: Heart,
    title: 'Blood Donation',
    desc: 'GPS-powered donor matching. Find verified donors within minutes when every second counts.',
    color: 'from-red-500 to-rose-600',
    link: '/info/blood',
  },
  {
    icon: HandCoins,
    title: 'Verified Fundraising',
    desc: 'Transparent crowdfunding with trust scores. Every rupee tracked, every cause verified.',
    color: 'from-amber-500 to-orange-600',
    link: '/info/fund',
  },
  {
    icon: Search,
    title: 'Missing Persons',
    desc: 'Geo-tagged sightings and community alerts. Technology-powered search for missing loved ones.',
    color: 'from-blue-500 to-indigo-600',
    link: '/info/missing',
  },
  {
    icon: MapPin,
    title: 'Live Emergency Map',
    desc: 'Real-time visualization of all emergencies near you. See, respond, and save lives.',
    color: 'from-green-500 to-emerald-600',
    link: '/info/map',
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

export default function Landing() {
  return (
    <div>
      {/* ════════════════════ HERO ════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-red-50/30 to-blue-50/30 py-20 sm:py-28 lg:py-36">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl float-animation" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-secondary/5 blur-3xl float-animation-delay" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div {...fadeUp}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-8">
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
              <span className="block gradient-text">
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
              <Link to="/register">
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

      {/* ════════════════════ STATS ════════════════════ */}
      <section className="bg-white border-y border-border py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl font-extrabold font-heading gradient-text">
                  {stat.value}
                </div>
                <div className="text-sm text-text-secondary mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ FEATURES ════════════════════ */}
      <section className="py-20 sm:py-28 bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text">
              Four Pillars of <span className="text-primary">Emergency Response</span>
            </h2>
            <p className="mt-4 text-text-secondary max-w-xl mx-auto">
              A comprehensive platform designed to save lives, reunite families, and build trust.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <Link to={feature.link} className="block glass-card p-6 h-full group">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-heading text-lg font-bold text-text mb-2">{feature.title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{feature.desc}</p>
                    <div className="flex items-center text-primary text-sm font-semibold mt-4 group-hover:gap-2 transition-all">
                      Learn more <ChevronRight className="h-4 w-4" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════ TRUST SYSTEM ════════════════════ */}
      <section className="py-20 bg-white border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-semibold mb-6">
                <Shield className="h-3.5 w-3.5" />
                Trust Score System
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text mb-6">
                Built on Trust, <br />
                <span className="text-secondary">Verified by Community</span>
              </h2>
              <p className="text-text-secondary leading-relaxed mb-8">
                Every user earns a dynamic trust score based on their contributions, verification status,
                and community feedback. This ensures every donation reaches the right hands.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Shield, text: 'Document-verified user profiles' },
                  { icon: Users, text: 'Community-driven trust scores' },
                  { icon: Zap, text: 'AI-powered fraud detection' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <item.icon className="h-4 w-4 text-secondary" />
                    </div>
                    <span className="text-sm font-medium text-text">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="glass-card p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-secondary/10 to-transparent rounded-bl-[60px]" />
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-secondary to-secondary-dark flex items-center justify-center mx-auto mb-4">
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

      {/* ════════════════════ CTA ════════════════════ */}
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
              Join India's Largest Emergency Trust Network
            </h2>
            <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
              Be the change. Register as a donor, start a campaign, or help find someone's missing loved one.
            </p>
            <Link to="/register">
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
