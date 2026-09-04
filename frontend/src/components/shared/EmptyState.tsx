import { FileSearch } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-full blur-xl opacity-30"
          style={{ background: 'hsl(175 84% 28%)' }} />
        <div className="relative p-4 rounded-2xl border border-teal-100"
          style={{ background: 'linear-gradient(135deg, #edfafa, #d5f5f6)' }}>
          <FileSearch className="h-8 w-8 text-teal-500" />
        </div>
      </div>
      <h3 className="text-base font-bold text-slate-700 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-400 max-w-sm leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
