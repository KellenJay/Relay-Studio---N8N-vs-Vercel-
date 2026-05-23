import { stageName } from '@/lib/utils'
import type { Stage } from '@/lib/types'

export function ProgressBar({ current }: { current: Stage }) {
  const stages: Stage[] = [1, 2, 3]
  return (
    <div className="flex items-center gap-2">
      {stages.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 text-xs font-medium ${
            s === current ? 'text-loopin-purple' :
            s < current  ? 'text-loopin-teal'   : 'text-loopin-text-secondary'
          }`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border ${
              s === current ? 'bg-loopin-purple border-loopin-purple text-white' :
              s < current  ? 'bg-loopin-teal border-loopin-teal text-loopin-bg' :
                             'border-loopin-border text-loopin-muted'
            }`}>
              {s < current ? '✓' : s}
            </div>
            <span className="hidden sm:block">{stageName(s)}</span>
          </div>
          {i < stages.length - 1 && (
            <div className={`w-8 h-px ${s < current ? 'bg-loopin-teal' : 'bg-loopin-border'}`} />
          )}
        </div>
      ))}
    </div>
  )
}
