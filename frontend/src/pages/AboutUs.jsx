import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, Users, Target, AlertTriangle, Heart, HandCoins, Search,
  ArrowRight, CheckCircle, TrendingUp, Clock,
} from 'lucide-react';
import { Button } from '../components/ui';

const problems = [
  {
    icon: Heart,
    title: 'Blood Shortage Crisis',
    desc: 'India faces a shortage of nearly 1.9 million units of blood annually. During emergencies, families scramble across unorganized WhatsApp groups and social media — often losing precious hours.',
    color: 'text-red-500',
    bg: 'bg-red-50',
    border: 'border-l-red-500',
  },
  {
    icon: HandCoins,
    title: 'Fundraising Fraud',
    desc: 'Over 40% of Indians hesitate to donate online due to rampant fraud. Genuine families struggling with medical bills fail to raise funds, while fake campaigns erode public trust.',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    border: 'border-l-amber-500',
  },
  {
    icon: Search,
    title: 'Missing Persons Gap',
    desc: 'Over 100,000 children go missing in India every year. There is no unified national alert system that can geo-target communities near a last-known location in real time.',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    border: 'border-l-blue-500',
  },
];

const values = [
  { icon: Shield, title: 'Trust First', desc: 'Every user, campaign, and donation is verified through documents and community validation.' },
  { icon: Users, title: 'Community Driven', desc: 'Powered by everyday people who form a real-time response network across cities.' },
  { icon: Target, title: 'AI-Powered', desc: 'Smart matching algorithms ensure the right help reaches the right person in record time.' },
  { icon: TrendingUp, title: 'Transparent', desc: 'Every rupee, every action, every response is tracked and visible to all stakeholders.' },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

export default function AboutUs() {
  return (
    <div className="py-8 sm:py-12">
      {/* ── Hero ── */}
      <div className="page-hero rounded-3xl mb-16 px-4 sm:px-8 text-center">
        <motion.div {...fadeUp}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
            <Shield className="h-4 w-4" />
            About SAHYOG
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-text mb-6 max-w-3xl mx-auto">
            India's First{' '}
            <span className="gradient-text">AI-Powered Emergency</span>{' '}
            & Trust Network
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            SAHYOG connects verified donors, facilitates transparent fundraising, and helps reunite
            missing loved ones — all through a single, community-powered platform.
          </p>
        </motion.div>
      </div>

      {/* ── What Problem We Solve ── */}
      <section className="mb-20">
        <motion.div {...fadeUp} className="text-center mb-12">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text mb-4">
            Why SAHYOG <span className="text-primary">Exists</span>
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Real emergencies demand real-time, verified, trustworthy solutions — not scattered social media posts.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`glass-card p-7 border-l-4 ${item.border}`}
              >
                <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mb-5`}>
                  <Icon className={`h-6 w-6 ${item.color}`} />
                </div>
                <h3 className="font-heading font-bold text-lg text-text mb-3">{item.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Our Story ── */}
      <section className="mb-20">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <img
              src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800"
              alt="Community helping each other"
              className="rounded-3xl shadow-xl border border-border w-full object-cover h-[380px]"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-semibold">
              <Clock className="h-3.5 w-3.5" />
              Our Story
            </div>
            <h2 className="font-heading text-3xl font-bold text-text">
              Born from a <span className="text-secondary">Real Problem</span>
            </h2>
            <p className="text-text-secondary leading-relaxed">
              In times of critical emergencies, every second matters. We noticed a significant gap between
              those who needed urgent help and those willing to provide it. <strong className="text-text">Trust was the missing factor.</strong>
            </p>
            <p className="text-text-secondary leading-relaxed">
              SAHYOG was built to bridge this gap. By combining AI-driven matching, document verification,
              and community-driven trust scores, we've created a platform where authenticity, speed, and
              real-time coordination come together to save lives.
            </p>
            <Link to="/mission">
              <Button variant="ghost" className="mt-2 !px-0 text-primary hover:!bg-transparent">
                Read Our Mission <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Core Values ── */}
      <section>
        <motion.div {...fadeUp} className="text-center mb-12">
          <h2 className="font-heading text-3xl font-bold text-text mb-4">
            What We Stand For
          </h2>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card p-6 text-center"
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-lg text-text mb-2">{item.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
