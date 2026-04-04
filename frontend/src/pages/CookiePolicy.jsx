import { motion } from 'framer-motion'

export default function CookiePolicy() {
  const updatedAt = 'April 5, 2026'

  return (
    <div className="min-h-[80vh] py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-text mb-3">
          Cookie Policy
        </h1>
        <p className="text-sm text-text-muted mb-8">
          Last updated: {updatedAt}
        </p>

        <div className="space-y-7 text-text-secondary leading-relaxed">
          <section>
            <h2 className="font-heading text-xl font-semibold text-text mb-2">
              1. What Are Cookies
            </h2>
            <p>
              Cookies are small text files stored on your device by websites and
              applications. They help remember preferences, keep sessions
              active, and improve user experience.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-text mb-2">
              2. How SAHYOG Uses Cookies and Local Storage
            </h2>
            <p>
              We use browser storage and similar technologies to maintain login
              sessions, preserve selected settings, keep notification state, and
              improve reliability of emergency workflows.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-text mb-2">
              3. Types of Cookies
            </h2>
            <p>
              Essential: required for authentication and core functionality.
              Performance: help us understand usage patterns to improve speed
              and stability. Preference: remember selected options such as UI
              state.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-text mb-2">
              4. Third-Party Technologies
            </h2>
            <p>
              Some integrated services, including payment and hosting providers,
              may set their own cookies based on their policies. We recommend
              reviewing those providers' privacy and cookie documentation.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-text mb-2">
              5. Managing Cookies
            </h2>
            <p>
              You can disable or clear cookies in your browser settings. Please
              note that blocking essential cookies may affect login status,
              session continuity, and certain platform features.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-text mb-2">
              6. Updates to This Policy
            </h2>
            <p>
              We may update this page as technologies and legal requirements
              evolve. The latest version will always be available here.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  )
}
