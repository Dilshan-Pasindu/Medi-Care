import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

export function formatCurrency(amount: number): string {
  return `Rs. ${amount.toFixed(2)}`;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    BOOKED: 'bg-info-light text-info',
    COMPLETED: 'bg-success-light text-success',
    CANCELLED: 'bg-danger-light text-danger',
    CREATED: 'bg-muted text-muted-foreground',
    SENT_TO_PHARMACY: 'bg-info-light text-info',
    PROCESSING: 'bg-warning-light text-yellow-800',
    DISPENSED: 'bg-success-light text-success',
    AVAILABLE: 'bg-success-light text-success',
    LOW_STOCK: 'bg-warning-light text-yellow-800',
    OUT_OF_STOCK: 'bg-danger-light text-danger',
  };
  return colors[status] || 'bg-muted text-muted-foreground';
}
