import { cn, getStatusColor } from '../../lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const displayStatus = status.replace(/_/g, ' ');
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium',
      getStatusColor(status),
      className
    )}>
      {displayStatus}
    </span>
  );
}

export function StockStatusBadge({ stockQuantity, minimumStock }: { stockQuantity: number; minimumStock: number }) {
  let status: string;
  let label: string;

  if (stockQuantity === 0) {
    status = 'OUT_OF_STOCK';
    label = 'Out of Stock';
  } else if (stockQuantity <= minimumStock) {
    status = 'LOW_STOCK';
    label = 'Low Stock';
  } else {
    status = 'AVAILABLE';
    label = 'Available';
  }

  return <StatusBadge status={status} className={undefined} />;
}
