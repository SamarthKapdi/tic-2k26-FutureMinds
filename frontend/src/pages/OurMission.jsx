import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Target, Eye, Sparkles, Zap, Shield, Users, Globe, ArrowRight,
  HeartHandshake, Scale, Radio,
} from 'lucide-react';
import { Button } from '../components/ui';

const goals = [
  {
    icon: Zap,
    title: 'Real-Time Response',
    desc: 'Instantly connect emergency requests to verified responders using GPS-powered AI matching — cutting response time from hours to minutes.',
  },
  {
    icon: Shield,
    title: 'Full Transparency',
    desc: 'Every donation, every campaign, every action is tracked and visible. Trust scores, document verification, and audit trails ensure zero fraud.',
  },
  {
    icon: Users,
    title: 'Community Trust Network',
    desc: 'Build a self-sustaining ecosystem where community members validate, support, and empower each other during life\'s toughest moments.',
  },
];

const milestones = [
  { label: 'Platform Launch', status: 'done' },
  { label: 'Blood Network Activation', status: 'done' },
  { label: 'Trust Score Engine', status: 'done' },
  { label: 'Pan-India Rollout', status: 'upcoming' },
  { label: 'NGO Partnerships', status: 'upcoming' },
  { label: 'Government Integration', status: 'upcoming' },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

export default function OurMission() {
  return (
    <div className="py-8 sm:py-12 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* ── Hero ── */}
        <motion.div {...fadeUp} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
            <Sparkles className="h-4 w-4" />
            Our Purpose
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-text mb-6">
            Our{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Mission & Vision
            </span>
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            We are driven by a singular goal: to create a world where critical help is always accessible, verified, and transparent.
          </p>
        </motion.div>

        {/* ── Mission + Vision Cards ── */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 sm:p-10 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Target className="w-32 h-32 text-primary" />
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold font-heading text-text mb-4">Our Mission</h2>
              <p className="text-text-secondary leading-relaxed text-lg">
                To empower communities through modern technology, ensuring that blood donations, fundraising,
                and missing person searches are fast, reliable, and entirely transparent. We strive to save
                lives by making connections that count.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 sm:p-10 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Eye className="w-32 h-32 text-secondary" />
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6">
                <Eye className="h-8 w-8 text-secondary" />
              </div>
              <h2 className="text-2xl font-bold font-heading text-text mb-4">Our Vision</h2>
              <p className="text-text-secondary leading-relaxed text-lg">
                Build India's most trusted emergency network — a future where technology eliminates the gap
                between tragedy and assistance, where fraud cannot survive transparency, and where every
                community member becomes a first responder.
              </p>
            </div>
          </motion.div>
        </div>

        {/* ── Strategic Goals ── */}
        <section className="mb-20">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold text-text mb-4">
              Our Strategic <span className="text-primary">Goals</span>
            </h2>
            <p className="text-text-secondary max-w-lg mx-auto">
              Three pillars that guide every decision we make at SAHYOG.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {goals.map((goal, i) => {
              const Icon = goal.icon;
              return (
                <motion.div
                  key={goal.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-8 text-center group"
                >
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-xl text-text mb-3">{goal.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{goal.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ── Roadmap ── */}
        <section className="mb-20">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold text-text mb-4">
              Our <span className="text-secondary">Roadmap</span>
            </h2>
          </motion.div>

          <div className="max-w-2xl mx-auto">
            <div className="space-y-4">
              {milestones.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-4"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    item.status === 'done'
                      ? 'bg-success/10 text-success'
                      : 'bg-gray-100 text-text-muted'
                  }`}>
                    {item.status === 'done' ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <Radio className="w-4 h-4" />
                    )}
                  </div>
                  <div className={`flex-1 py-3 px-5 rounded-xl ${
                    item.status === 'done'
                      ? 'bg-success/5 border border-success/20'
                      : 'bg-gray-50 border border-border'
                  }`}>
                    <span className={`font-medium text-sm ${item.status === 'done' ? 'text-text' : 'text-text-muted'}`}>
                      {item.label}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <motion.div
          {...fadeUp}
          className="bg-gradient-to-r from-primary to-primary-dark rounded-3xl p-8 sm:p-12 text-center shadow-xl"
        >
          <HeartHandshake className="w-12 h-12 text-white mx-auto mb-6 opacity-80" />
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">Join Us in Making a Difference</h3>
          <p className="text-white/80 max-w-2xl mx-auto mb-8 text-lg">
            Every verified donor, every sincere contribution, and every shared alert brings us one step closer to our vision.
          </p>
          <Link to="/login">
            <Button variant="outline" size="lg" className="!border-white !text-white hover:!bg-white hover:!text-primary">
              Get Involved <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
