import React from 'react';
import { cn } from '@/components/lib/utils';

// Impact Card Component - for dashboard stats
export function ImpactCard({ 
  icon: Icon, 
  title, 
  value, 
  change, 
  variant = 'critical',
  className,
  ...props 
}) {
  const variantStyles = {
    critical: 'border-b-red-600',
    success: 'border-b-emerald-600', 
    info: 'border-b-blue-600',
    warning: 'border-b-amber-600'
  };

  return (
    <div 
      className={cn(
        'bg-white shadow-sm rounded-3xl border border-slate-200 hover:shadow-lg transition-all duration-300 border-b-4 text-center p-6',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      <div className="bg-red-50 text-red-600 rounded-xl w-12 h-12 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-1">
        {value}
      </div>
      <div className="text-slate-500 text-sm font-medium mb-2">
        {title}
      </div>
      {change && (
        <div className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold inline-block">
          {change}
        </div>
      )}
    </div>
  );
}

// Icon Wrapper Component
export function IconWrapper({ icon: Icon, variant = 'red', className, ...props }) {
  const variants = {
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    slate: 'bg-slate-50 text-slate-600'
  };

  return (
    <div 
      className={cn(
        'p-3 rounded-xl flex items-center justify-center',
        variants[variant],
        className
      )}
      {...props}
    >
      <Icon className="w-6 h-6" />
    </div>
  );
}

// Navigation Bar Component
export function BMSNavbar({ children, className, ...props }) {
  return (
    <nav 
      className={cn(
        'bg-white shadow-sm border-b border-slate-200 px-4 py-3',
        className
      )}
      {...props}
    >
      {children}
    </nav>
  );
}

// Feature Card Component
export function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  variant = 'red',
  className,
  ...props 
}) {
  return (
    <div 
      className={cn(
        'bg-white shadow-sm rounded-3xl border border-slate-200 hover:shadow-lg transition-all duration-300 text-center p-6 border-t-4 border-t-red-600',
        className
      )}
      {...props}
    >
      <IconWrapper 
        icon={Icon} 
        variant={variant}
        className="w-16 h-16 mx-auto mb-4"
      />
      <h3 className="text-xl font-semibold mb-2 text-slate-900 tracking-tight">
        {title}
      </h3>
      <p className="text-slate-500 font-medium">
        {description}
      </p>
    </div>
  );
}

// Page Container Component
export function PageContainer({ children, className, ...props }) {
  return (
    <div 
      className={cn(
        'min-h-screen bg-slate-50',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Section Container Component  
export function SectionContainer({ children, className, variant = 'default', ...props }) {
  const variants = {
    default: 'bg-slate-50',
    white: 'bg-white',
    gradient: 'bg-gradient-to-br from-red-600 to-red-800 text-white'
  };

  return (
    <section 
      className={cn(
        'py-20',
        variants[variant],
        className
      )}
      {...props}
    >
      <div className="container mx-auto px-4">
        {children}
      </div>
    </section>
  );
}