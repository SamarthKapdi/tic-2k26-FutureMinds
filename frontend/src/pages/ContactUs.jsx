import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Clock,
  CheckCircle,
} from 'lucide-react'
import { Button } from '../components/ui'
import toast from 'react-hot-toast'

const contactInfo = [
  {
    icon: MapPin,
    title: 'Our Office',
    lines: ['FutureMinds Tech Hub', 'Indore, Madhya Pradesh'],
    color: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  {
    icon: Phone,
    title: 'Emergency Helpline',
    lines: ['+91 77238 11943', '+91 93405 04739'],
    color: 'bg-secondary/10',
    iconColor: 'text-secondary',
  },
  {
    icon: Mail,
    title: 'Email Us',
    lines: ['support@sahyog.in', 'partnerships@sahyog.in'],
    color: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    icon: Clock,
    title: 'Working Hours',
    lines: [
      'Emergency: 24/7 Always Available',
      'Office: Mon – Fri, 9 AM – 6 PM',
    ],
    color: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
]

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

export default function ContactUs() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    toast.success("Message sent! We'll get back to you soon.")
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div className="py-8 sm:py-12">
      {/* ── Hero ── */}
      <motion.div {...fadeUp} className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
          <MessageSquare className="h-4 w-4" />
          Get in Touch
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-text mb-4">
          Contact <span className="text-primary">Us</span>
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
          Have a question, need help with an emergency, or want to partner with
          us? We'd love to hear from you.
        </p>
      </motion.div>

      {/* ── Contact Info Cards ── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
        {contactInfo.map((item, i) => {
          const Icon = item.icon
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass-card p-6"
            >
              <div
                className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4`}
              >
                <Icon className={`h-6 w-6 ${item.iconColor}`} />
              </div>
              <h3 className="font-bold text-text mb-2">{item.title}</h3>
              {item.lines.map((line, j) => (
                <p key={j} className="text-text-secondary text-sm">
                  {line}
                </p>
              ))}
            </motion.div>
          )
        })}
      </div>

      {/* ── Contact Form ── */}
      <div className="grid lg:grid-cols-5 gap-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-2 flex flex-col justify-center"
        >
          <h2 className="font-heading text-2xl font-bold text-text mb-4">
            Let's Start a Conversation
          </h2>
          <p className="text-text-secondary leading-relaxed mb-6">
            Whether you want to volunteer as a blood donor, report a missing
            person, or explore partnership opportunities — our team is ready to
            help.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-success shrink-0" />
              <span className="text-sm text-text">
                Average response time: under 2 hours
              </span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-success shrink-0" />
              <span className="text-sm text-text">
                24/7 emergency helpline available
              </span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-success shrink-0" />
              <span className="text-sm text-text">
                Partnership onboarding within 48 hours
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-3 glass-card p-8 shadow-lg"
        >
          <h2 className="text-2xl font-bold font-heading text-text mb-6">
            Send us a Message
          </h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Doe"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Subject
              </label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                <option>General Inquiry</option>
                <option>Emergency Help</option>
                <option>Partnership</option>
                <option>Report a Bug</option>
                <option>Others</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Message
              </label>
              <textarea
                rows={4}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                placeholder="How can we help you?"
              />
            </div>
            <Button
              className="w-full mt-4 flex items-center justify-center gap-2"
              disabled={submitted}
            >
              {submitted ? (
                <>
                  Sent! <CheckCircle className="w-4 h-4" />
                </>
              ) : (
                <>
                  Send Message <Send className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
