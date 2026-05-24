import { stageName } from '@/lib/utils'
import type { Stage, ReviewStatus } from '@/lib/types'

export function ProgressBar({ current, status }: { current: Stage; status?: ReviewStatus }) {
  const stages: Stage[] = [1, 2, 3]
  const allDone = status === 'approved'
  return (
    <div className="flex items-center gap-2">
      {stages.map((s, i) => {
        const done = s < current || (allDone && s === current)
        const active = s === current && !allDone
        return (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 text-xs font-medium ${
              active ? 'text-loopin-purple' :
              done   ? 'text-loopin-teal'   : 'text-loopin-text-secondary'
            }`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border ${
                active ? 'bg-loopin-purple border-loopin-purple text-white' :
                done   ? 'bg-loopin-teal border-loopin-teal text-loopin-bg' :
                         'border-loopin-border text-loopin-muted'
              }`}>
                {done ? '✓' : s}
              </div>
              <span className="hidden sm:block">{stageName(s)}</span>
            </div>
            {i < stages.length - 1 && (
              <div className={`w-8 h-px ${done ? 'bg-loopin-teal' : 'bg-loopin-border'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
