import { Loader2, Activity } from 'lucide-react';

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-30 gap-4">
      <div className="relative">
        {/* Pulsing ring */}
        <div className="absolute inset-0 rounded-full animate-ping"
          style={{ background: 'hsl(175 84% 28% / 0.2)' }} />
        <div className="relative p-4 rounded-full"
          style={{ background: 'linear-gradient(135deg, hsl(175 84% 28%), hsl(190 80% 38%))' }}>
          <Loader2 className="h-7 w-7 text-white animate-spin" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-700">{message}</p>
        <div className="flex items-center justify-center gap-1 mt-1.5">
          <Activity className="h-3 w-3 text-teal-500" />
          <p className="text-xs text-slate-400">MediCare System</p>
        </div>
      </div>
    </div>
  );
}
