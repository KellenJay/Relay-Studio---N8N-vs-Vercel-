import type { Platform, Stage, ReviewStatus } from './types'

export function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function stageName(stage: Stage): string {
  return { 1: 'Strategy', 2: 'Copy & Visuals', 3: 'Final Review' }[stage]
}

export function platformLabel(p: Platform): string {
  return { linkedin: 'LinkedIn', x: 'X (Twitter)', instagram: 'Instagram' }[p]
}

export function platformIcon(p: Platform): string {
  return { linkedin: '💼', x: '𝕏', instagram: '📸' }[p]
}

export function statusColor(status: ReviewStatus): string {
  return {
    pending: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    approved: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
    revision: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
    rejected: 'text-red-400 bg-red-400/10 border-red-400/30',
  }[status]
}

export function statusLabel(status: ReviewStatus): string {
  return {
    pending: 'Pending Review',
    approved: 'Approved',
    revision: 'Revision Needed',
    rejected: 'Rejected',
  }[status]
}

export function charCountColor(count: number, limit: number): string {
  const ratio = count / limit
  if (ratio > 1) return 'text-red-400'
  if (ratio > 0.9) return 'text-amber-400'
  return 'text-loopin-teal'
}
