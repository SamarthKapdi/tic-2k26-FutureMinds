import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HandCoins, AlertTriangle, ShieldCheck, FileCheck, TrendingUp,
  Eye, ArrowRight, IndianRupee, CheckCircle,
} from 'lucide-react';
import { Button } from '../components/ui';

const solutions = [
  {
    icon: FileCheck,
    title: 'Document Verification',
    desc: 'Every medical fundraiser requires hospital billing estimates and doctor prescriptions. No documents = no campaign.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: TrendingUp,
    title: 'AI Trust Scores',
    desc: 'Campaigns receive an AI-calculated trust score based on document authenticity, user history, and community upvotes.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: Eye,
    title: 'Transparent Trail',
    desc: 'Every rupee raised is tracked end-to-end. Donors see exactly how their contribution was utilized in real time.',
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

export default function FundInfo() {
  return (
    <div className="py-8 sm:py-12">
      {/* ── Hero ── */}
      <div className="page-hero rounded-3xl mb-16 px-4 sm:px-8 text-center">
        <motion.div {...fadeUp}>
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
            <HandCoins className="h-8 w-8 text-amber-500" />
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-text mb-6">
            Verified <span className="text-amber-500">Fundraising</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Transparent, document-verified crowdfunding where every rupee is tracked and every campaign earns a trust score.
          </p>
        </motion.div>
      </div>

      {/* ── Problem Statement ── */}
      <section className="mb-20">
        <div className="grid lg:grid-cols-5 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3 glass-card p-8 sm:p-10 border-l-4 border-l-amber-500"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-50 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold font-heading text-text">The Problem</h2>
            </div>
            <p className="text-text-secondary leading-relaxed mb-4 text-lg">
              Crowdfunding for medical emergencies is severely plagued by fraud. <strong className="text-text">Potential donors hesitate</strong> because they cannot verify if a campaign is genuine.
            </p>
            <p className="text-text-secondary leading-relaxed">
              Authentic families struggling with massive medical bills often fail to raise the required funds, while fraudulent campaigns syphon away goodwill. There's a profound lack of an audited, transparent channel.
            </p>
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50">
                <IndianRupee className="h-5 w-5 text-red-500 shrink-0" />
                <span className="text-sm text-text">₹500 Cr+ lost to online fraud yearly</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
                <span className="text-sm text-text">40% Indians hesitate to donate online</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 glass-card p-8 border-t-4 border-t-success"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-success/10 rounded-xl">
                <ShieldCheck className="w-6 h-6 text-success" />
              </div>
              <h2 className="text-xl font-bold font-heading text-text">SAHYOG's Answer</h2>
            </div>
            <p className="text-text-secondary leading-relaxed mb-6">
              We make fundraising <strong className="text-text">fraud-proof</strong> by design. Every campaign must pass document verification before going live, and a real-time trust score keeps donors informed.
            </p>
            <div className="space-y-3">
              {['Verified hospital documents required', 'AI-calculated trust scores', 'Real-time fund tracking', 'Community validation'].map((t) => (
                <div key={t} className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-success shrink-0" />
                  <span className="text-sm text-text">{t}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="mb-16">
        <motion.div {...fadeUp} className="text-center mb-12">
          <h2 className="font-heading text-3xl font-bold text-text mb-4">
            Transparency by <span className="text-amber-500">Design</span>
          </h2>
          <p className="text-text-secondary max-w-lg mx-auto">
            Three layers of verification protect every donation.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {solutions.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="glass-card p-8 text-center group"
              >
                <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-7 w-7 ${item.color}`} />
                </div>
                <h3 className="font-heading font-bold text-lg text-text mb-3">{item.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── CTA ── */}
      <motion.div
        {...fadeUp}
        className="text-center bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-8 sm:p-12"
      >
        <h3 className="text-2xl font-bold text-white mb-4">Start a Verified Campaign</h3>
        <p className="text-white/80 mb-8 max-w-lg mx-auto">
          Create a trusted, transparent fundraiser that donors can believe in.
        </p>
        <Link to="/login">
          <Button variant="outline" size="lg" className="!border-white !text-white hover:!bg-white hover:!text-amber-600">
            Create Campaign <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
