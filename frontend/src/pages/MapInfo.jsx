import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin, Navigation, Eye, Layers, Radio, Heart,
  HandCoins, Search, ArrowRight, CheckCircle,
} from 'lucide-react';
import { Button } from '../components/ui';

const mapLayers = [
  {
    icon: Heart,
    title: 'Blood Emergency Alerts',
    desc: 'See active blood requests pinpointed on the map with blood group and urgency.',
    color: 'text-red-500',
    bg: 'bg-red-50',
  },
  {
    icon: HandCoins,
    title: 'Active Fundraisers',
    desc: 'Browse ongoing verified campaigns and their trust scores by location.',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
  },
  {
    icon: Search,
    title: 'Missing Person Sightings',
    desc: 'Track reported sightings and last-known locations on a real-time radar.',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    icon: Radio,
    title: 'SOS Broadcasts',
    desc: 'View live SOS signals from people in immediate danger or distress.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

export default function MapInfo() {
  return (
    <div className="py-8 sm:py-12">
      {/* ── Hero ── */}
      <div className="page-hero rounded-3xl mb-16 px-4 sm:px-8 text-center">
        <motion.div {...fadeUp}>
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
            <MapPin className="h-8 w-8 text-emerald-500" />
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-text mb-6">
            Live <span className="text-emerald-500">Emergency Map</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            A bird's-eye view of all active emergencies, enabling communities to respond where help is needed most.
          </p>
        </motion.div>
      </div>

      {/* ── Problem + Solution ── */}
      <div className="grid md:grid-cols-2 gap-8 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8 border-l-4 border-l-gray-400"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <Navigation className="w-5 h-5 text-gray-500" />
            </div>
            <h2 className="text-xl font-bold text-text">Situational Blindness</h2>
          </div>
          <p className="text-text-secondary leading-relaxed">
            People often want to help in emergencies but they <strong className="text-text">aren't aware of what's happening</strong> just 
            a few kilometers away. Without geographical context, volunteers cannot effectively mobilize, and affected 
            communities remain isolated in their time of need.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 border-l-4 border-l-emerald-500"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Eye className="w-5 h-5 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-text">The Omnipresent View</h2>
          </div>
          <p className="text-text-secondary leading-relaxed">
            The Live Map aggregates <strong className="text-text">all active emergencies</strong> — SOS calls, blood requests, missing person
            sightings, and relief campaigns — on a single interactive map. It completely breaks geographical 
            disconnectivity and empowers real-time community response.
          </p>
        </motion.div>
      </div>

      {/* ── Map Layers ── */}
      <section className="mb-16">
        <motion.div {...fadeUp} className="text-center mb-12">
          <h2 className="font-heading text-3xl font-bold text-text mb-4">
            What's on the <span className="text-emerald-500">Map</span>
          </h2>
          <p className="text-text-secondary max-w-lg mx-auto">
            Four layers of emergency data, updated in real time.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mapLayers.map((layer, i) => {
            const Icon = layer.icon;
            return (
              <motion.div
                key={layer.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 text-center group"
              >
                <div className={`w-12 h-12 rounded-xl ${layer.bg} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-6 w-6 ${layer.color}`} />
                </div>
                <h3 className="font-bold text-text text-sm mb-2">{layer.title}</h3>
                <p className="text-text-secondary text-xs leading-relaxed">{layer.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── CTA ── */}
      <motion.div
        {...fadeUp}
        className="text-center bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-3xl p-8 sm:p-12"
      >
        <h3 className="text-2xl font-bold text-white mb-4">Explore the Live Map</h3>
        <p className="text-white/80 mb-8 max-w-lg mx-auto">
          See what's happening around you and respond to nearby emergencies.
        </p>
        <Link to="/login">
          <Button variant="outline" size="lg" className="!border-white !text-white hover:!bg-white hover:!text-emerald-600">
            Open Map <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
