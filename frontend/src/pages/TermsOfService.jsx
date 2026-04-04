import { motion } from 'framer-motion'

export default function TermsOfService() {
  const updatedAt = 'April 5, 2026'

  return (
    <div className="min-h-[80vh] py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-text mb-3">
          Terms of Service
        </h1>
        <p className="text-sm text-text-muted mb-8">
          Last updated: {updatedAt}
        </p>

        <div className="space-y-7 text-text-secondary leading-relaxed">
          <section>
            <h2 className="font-heading text-xl font-semibold text-text mb-2">
              1. Acceptance of Terms
            </h2>
            <p>
              By creating an account or using SAHYOG, you agree to these terms.
              If you do not agree, do not use the platform.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-text mb-2">
              2. Platform Purpose
            </h2>
            <p>
              SAHYOG is intended to support emergency coordination, trusted
              fundraising, and community response. You agree to use the service
              responsibly and only for legitimate requests and assistance.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-text mb-2">
              3. User Responsibilities
            </h2>
            <p>
              You are responsible for truthful submissions, lawful behavior, and
              safeguarding your account credentials. You must not impersonate
              others, upload forged evidence, or use the platform to harass,
              spam, exploit, or mislead users.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-text mb-2">
              4. Content and Verification
            </h2>
            <p>
              Reports, campaigns, and profile content may be reviewed and
              moderated. We may request additional proof, limit visibility, or
              remove content that appears harmful, inaccurate, or non-compliant
              with platform safety rules.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-text mb-2">
              5. Donations and Financial Flows
            </h2>
            <p>
              Payment processing is handled by third-party providers. SAHYOG
              does not guarantee campaign outcomes and is not liable for
              external payment gateway interruptions. Users must comply with
              applicable tax and financial regulations in their jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-text mb-2">
              6. Service Availability
            </h2>
            <p>
              We aim for high availability, but uptime is not guaranteed.
              Features may be changed, suspended, or discontinued as needed for
              maintenance, legal compliance, or security reasons.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-text mb-2">
              7. Limitation of Liability
            </h2>
            <p>
              To the extent permitted by law, SAHYOG is not liable for indirect
              or consequential damages, delays in response outcomes, third-party
              actions, or losses resulting from inaccurate user-submitted data.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-text mb-2">
              8. Suspension and Termination
            </h2>
            <p>
              We may suspend or terminate accounts involved in fraud, abuse,
              policy violations, or behavior that threatens user safety and
              trust.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-text mb-2">
              9. Contact
            </h2>
            <p>
              For legal, abuse, or compliance questions, contact
              support@sahyog.in.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  )
}
