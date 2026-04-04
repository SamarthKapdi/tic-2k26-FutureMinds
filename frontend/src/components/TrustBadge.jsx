import { Shield, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function TrustBadge({ score, showLabel = true, size = 'md' }) {
  const s = parseInt(score) || 0;
  let label, icon, colorClass, bgClass;

  if (s >= 70) {
    label = 'High Trust';
    icon = ShieldCheck;
    colorClass = 'text-green-600';
    bgClass = 'bg-green-100';
  } else if (s >= 40) {
    label = 'Medium Trust';
    icon = Shield;
    colorClass = 'text-amber-600';
    bgClass = 'bg-amber-100';
  } else {
    label = 'Low Trust';
    icon = ShieldAlert;
    colorClass = 'text-red-600';
    bgClass = 'bg-red-100';
  }

  const Icon = icon;
  const sizes = {
    sm: { icon: 'h-3 w-3', text: 'text-[10px]', px: 'px-1.5 py-0.5', gap: 'gap-1' },
    md: { icon: 'h-4 w-4', text: 'text-xs', px: 'px-2.5 py-1', gap: 'gap-1.5' },
    lg: { icon: 'h-5 w-5', text: 'text-sm', px: 'px-3 py-1.5', gap: 'gap-2' },
  };
  const sz = sizes[size] || sizes.md;

  return (
    <span className={`inline-flex items-center ${sz.gap} ${sz.px} rounded-full ${bgClass} ${colorClass} ${sz.text} font-semibold`}>
      <Icon className={sz.icon} />
      {showLabel && <span>{label}</span>}
      <span className="font-bold">{s}</span>
    </span>
  );
}
