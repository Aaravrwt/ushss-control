import React from 'react';

// Status badge component
export function StatusBadge({
  status,
  size = 'md',
}: {
  status: 'present' | 'absent' | 'pending' | 'approved' | 'rejected' | 'qualified' | 'defalcated' | 'open' | 'closed';
  size?: 'sm' | 'md';
}) {
  const s = status.toLowerCase();
  
  let styles = 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60';
  let dotColor = 'bg-zinc-400';
  let label: string = status;

  if (s === 'present' || s === 'approved' || s === 'qualified' || s === 'open') {
    styles = 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60';
    dotColor = 'bg-emerald-400';
    if (s === 'qualified') label = 'Eligible (≥75%)';
  } else if (s === 'absent' || s === 'rejected' || s === 'defalcated') {
    styles = 'bg-rose-950/40 text-rose-300 border-rose-800/60';
    dotColor = 'bg-rose-400';
    if (s === 'defalcated') label = 'Deficit (<75%)';
  } else if (s === 'pending') {
    styles = 'bg-amber-950/40 text-amber-300 border-amber-800/60';
    dotColor = 'bg-amber-400';
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${padding} ${styles} font-sans capitalize tracking-wide select-none`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{label}</span>
    </span>
  );
}

// Enterprise Button component
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}) {
  const base =
    'inline-flex items-center justify-center font-medium transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:opacity-50 disabled:pointer-events-none select-none rounded-lg cursor-pointer';

  const variants = {
    primary:
      'bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-500/20 active:bg-blue-700',
    secondary:
      'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/80 active:bg-zinc-850',
    destructive:
      'bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-600/20 active:bg-rose-700',
    ghost:
      'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 active:bg-zinc-800',
    outline:
      'border border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-900 hover:text-white',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-xs px-3.5 py-2 gap-2',
    lg: 'text-sm px-4 py-2.5 gap-2.5',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

// Enterprise Input component
export function Input({
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full px-3 py-2 bg-zinc-900/90 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
      {...props}
    />
  );
}

// Enterprise Select component
export function Select({
  className = '',
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full px-3 py-2 bg-zinc-900/90 border border-zinc-800 rounded-lg text-sm text-zinc-100 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

// Enterprise Card Component
export function Card({
  children,
  className = '',
  hover = false,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-5 ${
        hover ? 'hover:border-zinc-700 hover:bg-zinc-900/90 transition-all duration-150 ease-out' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

// Skeleton Table Loader
export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full animate-pulse p-4 space-y-3">
      <div className="h-4 bg-zinc-800/80 rounded w-1/4 mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-4 bg-zinc-800/50 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
