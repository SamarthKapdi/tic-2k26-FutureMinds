import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export function Button({ children, variant = 'primary', size = 'md', className, loading, disabled, ...props }) {
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark shadow-sm hover:shadow-md',
    secondary: 'bg-secondary text-white hover:bg-secondary-dark shadow-sm',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
    ghost: 'text-text-secondary hover:bg-surface-hover hover:text-text',
    danger: 'bg-danger text-white hover:bg-red-700',
    success: 'bg-success text-white hover:bg-green-800',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-5 py-2.5 text-sm rounded-xl',
    lg: 'px-8 py-3.5 text-base rounded-xl',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'font-semibold transition-all duration-200 inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant], sizes[size], className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </motion.button>
  );
}

export function Card({ children, className, hover = true, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('glass-card p-6', hover && 'hover:shadow-lg', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function Input({ label, error, className, id, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={id} className="block text-sm font-medium text-text">{label}</label>}
      <input
        id={id}
        className={cn(
          'w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-text placeholder:text-text-muted',
          'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200',
          error && 'border-danger focus:ring-danger/30', className
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}

export function Select({ label, error, options, className, id, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={id} className="block text-sm font-medium text-text">{label}</label>}
      <select
        id={id}
        className={cn(
          'w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-text',
          'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}

export function Badge({ children, variant = 'normal', className }) {
  const variants = {
    critical: 'badge-critical',
    urgent: 'badge-urgent',
    normal: 'badge-normal',
    success: 'bg-green-100 text-green-800',
    info: 'bg-blue-100 text-blue-800',
  };
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', variants[variant], className)}>
      {children}
    </span>
  );
}

export function Spinner({ size = 'md' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div className="flex justify-center items-center p-8">
      <div className={cn('animate-spin rounded-full border-4 border-border border-t-primary', sizes[size])} />
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-16"
    >
      {Icon && <Icon className="mx-auto h-16 w-16 text-text-muted mb-4" strokeWidth={1} />}
      <h3 className="text-lg font-semibold text-text mb-2">{title}</h3>
      <p className="text-text-secondary mb-6 max-w-md mx-auto">{description}</p>
      {action}
    </motion.div>
  );
}

export function StatCard({ icon: Icon, label, value, trend, color = 'primary' }) {
  const colors = {
    primary: 'from-primary/10 to-primary-light/10 text-primary',
    secondary: 'from-secondary/10 to-secondary-light/10 text-secondary',
    success: 'from-success/10 to-success-light/10 text-success',
    accent: 'from-accent/10 to-accent-light/10 text-accent',
    danger: 'from-danger/10 to-red-200/30 text-danger',
  };
  return (
    <Card className="!p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-secondary">{label}</p>
          <p className="text-2xl font-bold text-text mt-1">{value}</p>
          {trend && <p className="text-xs text-success-light mt-1">{trend}</p>}
        </div>
        <div className={cn('p-3 rounded-2xl bg-gradient-to-br', colors[color])}>
          {Icon && <Icon className="h-6 w-6" />}
        </div>
      </div>
    </Card>
  );
}
