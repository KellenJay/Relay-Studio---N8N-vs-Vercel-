'use client'
import { platformLabel, platformIcon } from '@/lib/utils'
import type { Platform } from '@/lib/types'

interface PlatformTabsProps {
  platforms: Platform[]
  active: Platform
  onChange: (p: Platform) => void
}

export function PlatformTabs({ platforms, active, onChange }: PlatformTabsProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {platforms.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`platform-tab ${p === active ? 'platform-tab-active' : 'platform-tab-inactive'}`}
        >
          <span className="mr-1.5">{platformIcon(p)}</span>
          {platformLabel(p)}
        </button>
      ))}
    </div>
  )
}
