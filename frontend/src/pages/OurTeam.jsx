import { motion } from 'framer-motion'
import { Link2, Code, Palette, Brain, Megaphone } from 'lucide-react'

const teamMembers = [
  {
    name: 'Samarth Kapdi',
    role: 'Team Lead & UI/UX Designer',
    img: '/WhatsApp%20Image%202026-04-04%20at%202.23.02%20PM.jpeg',
    linkedin: 'https://www.linkedin.com/in/samarthkapdi/',
    icon: Code,
    accent: 'from-primary to-primary-dark',
  },
  {
    name: 'Ashish Parihar',
    role: 'Backend Developer & DevOps & System Architect',
    img: '/WhatsApp%20Image%202026-04-04%20at%202.36.56%20PM.jpeg',
    linkedin: 'https://www.linkedin.com/in/ashish-parihar-96b2b83b1/',
    icon: Megaphone,
    accent: 'from-success to-green-700',
  },
  {
    name: 'Nikhil Soni',
    role: 'Backend Lead',
    img: '/WhatsApp%20Image%202026-04-04%20at%202.23.07%20PM.jpeg',
    linkedin: 'https://www.linkedin.com/in/nikhilsoni111/',
    icon: Palette,
    accent: 'from-secondary to-secondary-dark',
  },
  {
    name: 'Rohit Rajure',
    role: 'QA & Testing',
    img: '/WhatsApp%20Image%202026-04-04%20at%202.23.11%20PM.jpeg',
    linkedin: 'https://www.linkedin.com/in/rohit-rajure-bb9508302/',
    icon: Megaphone,
    accent: 'from-success to-green-700',
  },
  {
    name: 'Aditya Kapse',
    role: 'Research & Documentation',
    img: '/WhatsApp%20Image%202026-04-04%20at%202.07.54%20PM.jpeg',
    linkedin: 'https://www.linkedin.com/in/adityakapse1991/',
    icon: Brain,
    accent: 'from-accent to-amber-600',
  },
]

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

export default function OurTeam() {
  return (
    <div className="py-8 sm:py-12">
      {/* ── Hero ── */}
      <motion.div {...fadeUp} className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-semibold mb-6">
          Team FutureMinds
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-text mb-4">
          Meet Our <span className="text-secondary">Team</span>
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
          We are a group of developers, designers, and innovators passionate
          about building products that make a real difference in people's lives.
        </p>
      </motion.div>

      {/* ── Team Grid ── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
        {teamMembers.map((member, i) => {
          const RoleIcon = member.icon
          return (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass-card overflow-hidden group"
            >
              {/* Top accent bar */}
              <div className={`h-1.5 bg-gradient-to-r ${member.accent}`} />

              <div className="p-6 text-center">
                {/* Avatar */}
                <div className="relative w-28 h-28 mx-auto mb-5">
                  <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <img
                      src={member.img}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div
                    className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-lg bg-gradient-to-br ${member.accent} flex items-center justify-center shadow-md`}
                  >
                    <RoleIcon className="h-4 w-4 text-white" />
                  </div>
                </div>

                {/* Info */}
                <h3 className="font-heading font-bold text-lg text-text mb-1">
                  {member.name}
                </h3>
                <p className="text-primary font-medium text-sm mb-4">
                  {member.role}
                </p>
                <p className="text-text-secondary text-sm leading-relaxed mb-5">
                  {member.bio}
                </p>

                {/* Social links */}
                <div className="flex items-center justify-center gap-2">
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${member.name} LinkedIn`}
                    title="LinkedIn"
                    className="w-8 h-8 rounded-lg bg-surface-hover flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-all"
                  >
                    <Link2 className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* ── Join Us Banner ── */}
      <motion.div
        {...fadeUp}
        className="bg-gradient-to-r from-secondary-dark to-secondary rounded-3xl p-8 sm:p-12 text-center"
      >
        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          Want to Build With Us?
        </h3>
        <p className="text-white/80 max-w-xl mx-auto text-lg">
          We're always looking for passionate individuals who want to use their
          skills for social impact.
        </p>
      </motion.div>
    </div>
  )
}
