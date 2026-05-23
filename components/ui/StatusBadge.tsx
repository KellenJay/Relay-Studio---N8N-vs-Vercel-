import { statusColor, statusLabel } from '@/lib/utils'
import type { ReviewStatus } from '@/lib/types'

export function StatusBadge({ status }: { status: ReviewStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor(status)}`}>
      {statusLabel(status)}
    </span>
  )
}
