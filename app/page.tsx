'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { ReviewSummary } from '@/lib/types'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { timeAgo, platformLabel, platformIcon } from '@/lib/utils'

function NewBriefForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    brief_id: '',
    client: 'Loopin',
    platform: 'linkedin',
    topic_hint: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/trigger-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error ?? `Error ${res.status}`)
      }
      setForm({ brief_id: '', client: 'Loopin', platform: 'linkedin', topic_hint: '' })
      setOpen(false)
      onSubmitted()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to trigger brief')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="btn-primary text-sm px-4 py-2 rounded-lg"
      >
        {open ? 'Cancel' : '+ New Brief'}
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="mt-4 card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-loopin-text">Trigger new brief</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-loopin-text-secondary mb-1">Brief ID</label>
              <input
                required
                value={form.brief_id}
                onChange={e => setForm(f => ({ ...f, brief_id: e.target.value }))}
                placeholder="TB-06"
                className="w-full bg-loopin-border/30 border border-loopin-border rounded-lg px-3 py-2 text-sm text-loopin-text placeholder:text-loopin-muted focus:outline-none focus:border-loopin-purple"
              />
            </div>
            <div>
              <label className="block text-xs text-loopin-text-secondary mb-1">Client</label>
              <input
                required
                value={form.client}
                onChange={e => setForm(f => ({ ...f, client: e.target.value }))}
                placeholder="Loopin"
                className="w-full bg-loopin-border/30 border border-loopin-border rounded-lg px-3 py-2 text-sm text-loopin-text placeholder:text-loopin-muted focus:outline-none focus:border-loopin-purple"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-loopin-text-secondary mb-1">Platform</label>
            <select
              value={form.platform}
              onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}
              className="w-full bg-loopin-border/30 border border-loopin-border rounded-lg px-3 py-2 text-sm text-loopin-text focus:outline-none focus:border-loopin-purple"
            >
              <option value="linkedin">LinkedIn</option>
              <option value="x">X / Twitter</option>
              <option value="instagram">Instagram</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-loopin-text-secondary mb-1">Topic hint</label>
            <textarea
              required
              rows={3}
              value={form.topic_hint}
              onChange={e => setForm(f => ({ ...f, topic_hint: e.target.value }))}
              placeholder="Describe what this content should be about…"
              className="w-full bg-loopin-border/30 border border-loopin-border rounded-lg px-3 py-2 text-sm text-loopin-text placeholder:text-loopin-muted focus:outline-none focus:border-loopin-purple resize-none"
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary text-sm px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {submitting ? 'Triggering…' : 'Trigger workflow →'}
          </button>
        </form>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const [reviews, setReviews] = useState<ReviewSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function loadReviews() {
    setLoading(true)
    fetch('/api/reviews')
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => setReviews(data))
      .catch(() => setError('Could not load reviews — KV not configured yet.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadReviews() }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-loopin-text">Review Queue</h1>
          <p className="text-loopin-text-secondary mt-1 text-sm">Content waiting for your approval</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {!loading && !error && (
            <span className="text-xs text-loopin-text-secondary bg-loopin-border/50 px-3 py-1.5 rounded-full">
              {reviews.length} {reviews.length === 1 ? 'item' : 'items'}
            </span>
          )}
          <NewBriefForm onSubmitted={() => setTimeout(loadReviews, 2000)} />
        </div>
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
            Use the New Brief button above to trigger your first content review.
          </p>
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
                    <ProgressBar current={r.stage} status={r.status} />
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
