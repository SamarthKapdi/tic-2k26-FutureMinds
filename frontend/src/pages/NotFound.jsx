import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Shield } from 'lucide-react';
import { Button } from '../components/ui';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md mx-auto px-4"
      >
        {/* Animated 404 */}
        <div className="relative mb-8">
          <div className="text-[140px] sm:text-[180px] font-extrabold font-heading leading-none bg-gradient-to-br from-primary/20 to-secondary/20 bg-clip-text text-transparent select-none">
            404
          </div>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-xl">
              <Shield className="h-10 w-10 text-white" />
            </div>
          </motion.div>
        </div>

        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text mb-3">
          Page Not Found
        </h1>
        <p className="text-text-secondary mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/">
            <Button size="lg">
              <Home className="h-5 w-5" />
              Go Home
            </Button>
          </Link>
          <Link to="/about">
            <Button variant="outline" size="lg">
              <ArrowLeft className="h-5 w-5" />
              Learn About SAHYOG
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
