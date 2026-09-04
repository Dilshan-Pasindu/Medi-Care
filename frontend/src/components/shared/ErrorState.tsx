import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Something went wrong', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="p-3 bg-danger-light rounded-full mb-4">
        <AlertCircle className="h-8 w-8 text-danger" />
      </div>
      <h3 className="text-base font-medium text-foreground mb-1">Error</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-600 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
