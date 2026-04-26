import type { EventStatus } from '@events/types'
import { cn } from '@/shared/utils/cn'

const STYLES: Record<EventStatus, string> = {
  UPCOMING: 'bg-blue-100 text-blue-800',
  ONGOING: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-slate-200 text-slate-700',
  CANCELLED: 'bg-red-100 text-red-800',
}

export function StatusBadge({ status }: { status: EventStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        STYLES[status],
      )}
    >
      {status}
    </span>
  )
}
