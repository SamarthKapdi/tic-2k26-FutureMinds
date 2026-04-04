import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, EyeOff, Radio, MapPin, Users, Bell,
  ArrowRight, CheckCircle, AlertTriangle,
} from 'lucide-react';
import { Button } from '../components/ui';

const howItWorks = [
  {
    num: '01',
    icon: AlertTriangle,
    title: 'Report a Missing Person',
    desc: 'Upload a photo, provide description and last-known location. The case goes live with a geo-fenced radius instantly.',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    num: '02',
    icon: Bell,
    title: 'Community Gets Alerted',
    desc: 'All SAHYOG users within the geo-fenced area receive a real-time push notification with the missing person\'s details.',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
  },
  {
    num: '03',
    icon: MapPin,
    title: 'Report Sightings',
    desc: 'Anyone who spots the individual can report a geo-tagged sighting with a photo, creating a live radar trail for authorities.',
    color: 'text-success',
    bg: 'bg-success/10',
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

export default function MissingInfo() {
  return (
    <div className="py-8 sm:py-12">
      {/* ── Hero ── */}
      <div className="page-hero rounded-3xl mb-16 px-4 sm:px-8 text-center">
        <motion.div {...fadeUp}>
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
            <Search className="h-8 w-8 text-blue-500" />
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-text mb-6">
            Missing Persons <span className="text-blue-500">Tracker</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Geo-fenced community alerts and real-time sighting reports to locate missing loved ones — fast.
          </p>
        </motion.div>
      </div>

      {/* ── Problem + Solution ── */}
      <div className="grid lg:grid-cols-2 gap-10 mb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <div className="glass-card p-8 border-l-4 border-l-gray-400">
            <h2 className="text-xl font-bold flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <EyeOff className="w-5 h-5 text-gray-500" />
              </div>
              The Core Challenge
            </h2>
            <p className="text-text-secondary leading-relaxed">
              When a loved one goes missing, the <strong className="text-text">first 24 hours are critical</strong>.
              But spreading awareness locally is painfully slow — posters take time to print, police networks 
              are overwhelmed, and social media forwards have no geographical targeting, making them largely inefficient.
            </p>
            <div className="mt-5 p-4 rounded-xl bg-red-50 border border-red-100">
              <p className="text-sm text-red-600 font-medium">
                Over 100,000 children go missing in India every year. There's no unified national alert system.
              </p>
            </div>
          </div>

          <div className="glass-card p-8 border-l-4 border-l-blue-500">
            <h2 className="text-xl font-bold flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Radio className="w-5 h-5 text-blue-500" />
              </div>
              SAHYOG's Active Radar
            </h2>
            <p className="text-text-secondary leading-relaxed">
              SAHYOG changes the paradigm with <strong className="text-text">localized, geo-fenced alerts</strong>.
              When a person is reported missing, a targeted alert is pushed to all SAHYOG users in that 
              specific area. Sighting reports create a live radar — actively aiding law enforcement and families.
            </p>
            <div className="mt-5 space-y-2">
              {['Geo-targeted push notifications', 'Photo-based sighting reports', 'Real-time map tracking', 'Law enforcement integration'].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-500 shrink-0" />
                  <span className="text-sm text-text">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex flex-col justify-center"
        >
          <img
            src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=600"
            alt="Community coming together to help"
            className="rounded-3xl shadow-xl w-full object-cover h-[420px]"
          />
          <div className="mt-6 glass-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="font-bold text-text text-sm">Community-Powered Search</p>
              <p className="text-text-secondary text-xs">Every SAHYOG user becomes a volunteer searcher in their neighborhood</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── How It Works ── */}
      <section className="mb-16">
        <motion.div {...fadeUp} className="text-center mb-12">
          <h2 className="font-heading text-3xl font-bold text-text mb-4">
            How the <span className="text-blue-500">Sighting System</span> Works
          </h2>
          <p className="text-text-secondary">Three steps to activate community search.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {howItWorks.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="glass-card p-8 text-center relative group"
              >
                <div className="absolute top-4 right-4 text-4xl font-extrabold text-border/50 font-heading">
                  {step.num}
                </div>
                <div className={`w-14 h-14 rounded-2xl ${step.bg} flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-7 w-7 ${step.color}`} />
                </div>
                <h3 className="font-heading font-bold text-lg text-text mb-3">{step.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── CTA ── */}
      <motion.div
        {...fadeUp}
        className="text-center bg-gradient-to-r from-blue-500 to-blue-700 rounded-3xl p-8 sm:p-12"
      >
        <h3 className="text-2xl font-bold text-white mb-4">Help Reunite Families</h3>
        <p className="text-white/80 mb-8 max-w-lg mx-auto">
          Join the SAHYOG network and become a community searcher. Your eyes could bring someone home.
        </p>
        <Link to="/login">
          <Button variant="outline" size="lg" className="!border-white !text-white hover:!bg-white hover:!text-blue-600">
            Join Network <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
