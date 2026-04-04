import { motion } from 'framer-motion'

export default function PrivacyPolicy() {
  const updatedAt = 'April 5, 2026'

  return (
    <div className="min-h-[80vh] py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-text mb-3">
          Privacy Policy
        </h1>
        <p className="text-sm text-text-muted mb-8">
          Last updated: {updatedAt}
        </p>

        <div className="space-y-7 text-text-secondary leading-relaxed">
          <section>
            <h2 className="font-heading text-xl font-semibold text-text mb-2">
              1. Overview
            </h2>
            <p>
              SAHYOG provides emergency response and trust-network services,
              including blood donation requests, fundraising campaigns, missing
              person alerts, and location-based support features. This policy
              explains what data we collect, how we use it, and the choices you
              have regarding your information.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-text mb-2">
              2. Information We Collect
            </h2>
            <p>
              We may collect account details (name, email, phone), profile data
              (city, state, address, avatar), emergency module submissions
              (blood, fund, missing reports), uploaded documents/images, and
              technical data such as IP address, browser type, and usage logs.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-text mb-2">
              3. How We Use Information
            </h2>
            <p>
              We use data to operate platform features, verify trust signals,
              match requests with nearby responders, process donations,
              communicate important alerts, improve service reliability, and
              protect users from abuse and fraud.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-text mb-2">
              4. Data Sharing
            </h2>
            <p>
              We share limited data only when necessary: with payment providers,
              cloud storage/hosting partners, notification services, legal
              authorities when required by law, and users who need information
              to respond to emergency requests. We do not sell personal data.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-text mb-2">
              5. Location and Emergency Visibility
            </h2>
            <p>
              Some features use your location to provide faster local matching.
              When you submit emergency content, parts of the report may be
              visible to nearby users and responders to improve response speed.
              Please avoid sharing unnecessary sensitive details.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-text mb-2">
              6. Data Retention
            </h2>
            <p>
              We retain data for as long as needed for platform operations,
              legal compliance, dispute resolution, and safety investigations.
              Some emergency logs and transaction records may be retained longer
              for accountability and fraud prevention.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-text mb-2">
              7. Your Rights
            </h2>
            <p>
              You can update your account profile at any time. You may request
              correction or deletion of your personal data, subject to legal and
              operational constraints. For requests, contact us at
              support@sahyog.in.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-text mb-2">
              8. Security
            </h2>
            <p>
              We use reasonable safeguards such as authenticated access,
              restricted admin controls, encrypted transport, and monitored
              infrastructure. No system is fully risk-free, so keep your
              password secure and report suspicious activity immediately.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-text mb-2">
              9. Policy Updates
            </h2>
            <p>
              We may update this policy over time to reflect product changes,
              legal requirements, and security improvements. Significant updates
              will be reflected by changing the "Last updated" date on this
              page.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  )
}
