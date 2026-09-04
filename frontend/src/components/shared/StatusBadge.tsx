import { cn, getStatusColor } from '../../lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { dot: string; classes: string }> = {
  BOOKED:      { dot: 'bg-blue-500',    classes: 'bg-blue-50 text-blue-700 border-blue-200' },
  COMPLETED:   { dot: 'bg-emerald-500', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CANCELLED:   { dot: 'bg-red-500',     classes: 'bg-red-50 text-red-700 border-red-200' },
  PENDING:     { dot: 'bg-amber-500',   classes: 'bg-amber-50 text-amber-700 border-amber-200' },
  DISPENSED:   { dot: 'bg-teal-500',    classes: 'bg-teal-50 text-teal-700 border-teal-200' },
  AVAILABLE:   { dot: 'bg-emerald-500', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  LOW_STOCK:   { dot: 'bg-amber-500',   classes: 'bg-amber-50 text-amber-700 border-amber-200' },
  OUT_OF_STOCK:{ dot: 'bg-red-500',     classes: 'bg-red-50 text-red-700 border-red-200' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const displayStatus = status.replace(/_/g, ' ');
  const config = statusConfig[status];

  if (config) {
    return (
      <span className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        config.classes,
        className,
      )}>
        <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
        {displayStatus}
      </span>
    );
  }

  // Fallback
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
      getStatusColor(status),
      className,
    )}>
      {displayStatus}
    </span>
  );
}

export function StockStatusBadge({ stockQuantity, minimumStock }: { stockQuantity: number; minimumStock: number }) {
  let status: string;

  if (stockQuantity === 0) {
    status = 'OUT_OF_STOCK';
  } else if (stockQuantity <= minimumStock) {
    status = 'LOW_STOCK';
  } else {
    status = 'AVAILABLE';
  }

  return <StatusBadge status={status} className={undefined} />;
}
