import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, AlertCircle, CheckCircle, MapPin, Bell, Droplets, ArrowRight, Clock } from 'lucide-react';
import { Button } from '../components/ui';

const steps = [
  {
    num: '01',
    icon: Bell,
    title: 'Raise an Emergency Alert',
    desc: 'Provide the hospital name, required blood group, and urgency level. Your request goes live instantly.',
    color: 'text-red-500',
    bg: 'bg-red-50',
  },
  {
    num: '02',
    icon: MapPin,
    title: 'AI Matches Nearby Donors',
    desc: 'Our GPS-powered system identifies verified donors of the right blood group within your vicinity and sends instant notifications.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    num: '03',
    icon: Droplets,
    title: 'Donor Responds & Saves a Life',
    desc: 'A matched donor confirms availability, arrives at the facility, and the donation is tracked for trust score updates.',
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

export default function BloodInfo() {
  return (
    <div className="py-8 sm:py-12">
      {/* ── Hero ── */}
      <div className="page-hero rounded-3xl mb-16 px-4 sm:px-8 text-center">
        <motion.div {...fadeUp}>
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <Heart className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-text mb-6">
            Blood Donation <span className="text-red-500">Network</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Real-time, GPS-powered matching between emergency blood requests and nearby verified donors.
          </p>
        </motion.div>
      </div>

      {/* ── Problem + Solution ── */}
      <div className="grid md:grid-cols-2 gap-8 mb-20">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8 border-l-4 border-l-red-500"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold font-heading text-text">The Problem</h2>
          </div>
          <p className="text-text-secondary leading-relaxed">
            India faces a shortage of <strong className="text-text">nearly 1.9 million units of blood annually</strong>.
            During emergencies, families scramble across unorganized WhatsApp groups and social media — 
            often losing precious hours while patients remain critical. Traditional blood banks face
            chronic shortages and finding willing donors nearby is a frantic, unorganized scramble.
          </p>
          <div className="mt-6 flex items-center gap-2 text-sm text-red-500 font-medium">
            <Clock className="h-4 w-4" />
            Average time to find blood: 4-6 hours
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8 border-l-4 border-l-primary"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold font-heading text-text">Our Solution</h2>
          </div>
          <p className="text-text-secondary leading-relaxed">
            SAHYOG employs a <strong className="text-text">real-time, GPS-powered matching system</strong>.
            When an emergency is broadcasted, we instantly ping verified donors in the exact vicinity
            based on their live location and blood group. This cuts down response time from hours to minutes.
          </p>
          <div className="mt-6 flex items-center gap-2 text-sm text-success font-medium">
            <CheckCircle className="h-4 w-4" />
            With SAHYOG: under 30 minutes
          </div>
        </motion.div>
      </div>

      {/* ── How It Works ── */}
      <section className="mb-16">
        <motion.div {...fadeUp} className="text-center mb-12">
          <h2 className="font-heading text-3xl font-bold text-text mb-4">
            How It <span className="text-primary">Works</span>
          </h2>
          <p className="text-text-secondary">Three steps. One life saved.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => {
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
        className="text-center bg-gradient-to-r from-red-500 to-primary rounded-3xl p-8 sm:p-12"
      >
        <h3 className="text-2xl font-bold text-white mb-4">Ready to Save a Life?</h3>
        <p className="text-white/80 mb-8 max-w-lg mx-auto">
          Register as a blood donor or request emergency blood — it takes less than 2 minutes.
        </p>
        <Link to="/login">
          <Button variant="outline" size="lg" className="!border-white !text-white hover:!bg-white hover:!text-primary">
            Get Started <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
