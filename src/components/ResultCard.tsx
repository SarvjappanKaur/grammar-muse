import { cn } from '@/lib/utils';

interface ResultCardProps {
  title: string;
  icon: React.ReactNode;
  status?: 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
}

export function ResultCard({ title, icon, status = 'info', children }: ResultCardProps) {
  const statusStyles = {
    success: 'border-l-4 border-l-accent',
    warning: 'border-l-4 border-l-chart-5',
    error: 'border-l-4 border-l-destructive',
    info: 'border-l-4 border-l-primary',
  };

  return (
    <div className={cn('bg-card rounded-lg p-4 shadow-[var(--shadow-card)]', statusStyles[status])}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-primary">{icon}</span>
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}
