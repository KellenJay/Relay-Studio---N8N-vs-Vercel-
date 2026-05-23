'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { ReviewSummary } from '@/lib/types'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { timeAgo, platformLabel, platformIcon } from '@/lib/utils'

export default function DashboardPage() {
  const [reviews, setReviews] = useState<ReviewSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/reviews')
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => setReviews(data))
      .catch(() => setError('Could not load reviews — KV not configured yet.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-loopin-text">Review Queue</h1>
          <p className="text-loopin-text-secondary mt-1 text-sm">Content waiting for your approval</p>
        </div>
        {!loading && !error && (
          <span className="text-xs text-loopin-text-secondary bg-loopin-border/50 px-3 py-1.5 rounded-full">
            {reviews.length} {reviews.length === 1 ? 'item' : 'items'}
          </span>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-loopin-purple border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="card p-8 text-center">
          <div className="w-10 h-10 rounded-xl bg-red-400/10 border border-red-400/30 flex items-center justify-center mx-auto mb-3">
            <span className="text-lg">⚠</span>
          </div>
          <p className="text-loopin-text text-sm font-medium mb-1">Could not load reviews</p>
          <p className="text-loopin-text-secondary text-xs">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && reviews.length === 0 && (
        <div className="card p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-loopin-purple-light border border-loopin-purple/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📋</span>
          </div>
          <h3 className="font-semibold text-loopin-text mb-1">No reviews yet</h3>
          <p className="text-loopin-text-secondary text-sm max-w-xs mx-auto">
            Trigger the n8n workflow to create your first content review.
          </p>
          <div className="mt-4 text-xs text-loopin-muted font-mono bg-loopin-border/30 rounded-lg px-4 py-2 inline-block">
            POST /webhook/relay-content
          </div>
        </div>
      )}

      {/* Review cards */}
      {!loading && !error && reviews.length > 0 && (
        <div className="space-y-3">
          {reviews.map((r) => (
            <Link key={r.task_id} href={`/review/${r.task_id}`} className="block group">
              <div className="card p-5 group-hover:border-loopin-purple/50 transition-all duration-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-loopin-purple uppercase tracking-wide">{r.client}</span>
                      <span className="text-loopin-border text-xs">·</span>
                      <span className="text-xs text-loopin-text-secondary font-mono">{r.brief_id}</span>
                    </div>
                    <p className="text-sm font-medium text-loopin-text truncate mb-3">{r.brief_summary}</p>
                    <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                      {r.platforms_in_scope.map(p => (
                        <span key={p} className="inline-flex items-center gap-1 text-xs text-loopin-text-secondary bg-loopin-border/40 px-2 py-0.5 rounded-md">
                          {platformIcon(p)} {platformLabel(p)}
                        </span>
                      ))}
                    </div>
                    <ProgressBar current={r.stage} />
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <StatusBadge status={r.status} />
                    <span className="text-xs text-loopin-muted">{timeAgo(r.created_at)}</span>
                    <span className="text-xs text-loopin-purple opacity-0 group-hover:opacity-100 transition-opacity">
                      Open →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
