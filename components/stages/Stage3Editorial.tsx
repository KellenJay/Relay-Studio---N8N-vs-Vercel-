'use client'
import { useState } from 'react'
import type { ReviewTask, Stage3Content, Platform, PlatformCompliance } from '@/lib/types'
import { PlatformTabs } from '@/components/ui/PlatformTabs'
import { LinkedInMockup } from '@/components/mockups/LinkedInMockup'
import { XMockup } from '@/components/mockups/XMockup'
import { InstagramMockup } from '@/components/mockups/InstagramMockup'

interface Props {
  task: ReviewTask
  onDecision: () => void
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 8 ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30'
    : score >= 6 ? 'text-amber-400 bg-amber-400/10 border-amber-400/30'
    : 'text-red-400 bg-red-400/10 border-red-400/30'
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border ${color}`}>
      {score}/10
    </span>
  )
}

function CompliancePanel({ platform, compliance }: { platform: Platform; compliance: PlatformCompliance }) {
  const label = platform === 'x' ? 'X (Twitter)' : platform.charAt(0).toUpperCase() + platform.slice(1)
  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-loopin-text">{label}</span>
        <ScoreBadge score={compliance.compliance_score} />
      </div>

      {compliance.issues.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-loopin-text-secondary uppercase tracking-widest mb-2">Issues</p>
          <ul className="space-y-1">
            {compliance.issues.map((issue, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-amber-400">
                <span className="mt-0.5 shrink-0">⚠</span>
                <span>{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {compliance.suggested_edits.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-loopin-text-secondary uppercase tracking-widest mb-2">Suggested edits</p>
          <ul className="space-y-1">
            {compliance.suggested_edits.map((edit, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-loopin-text-secondary">
                <span className="mt-0.5 shrink-0 text-loopin-teal">→</span>
                <span>{edit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={`text-xs px-3 py-2 rounded-lg border ${
        compliance.verdict === 'approved'
          ? 'bg-emerald-400/5 border-emerald-400/20 text-emerald-400'
          : 'bg-amber-400/5 border-amber-400/20 text-amber-400'
      }`}>
        <span className="font-semibold">{compliance.verdict === 'approved' ? '✓ Approved' : '↩ Needs revision'}</span>
        {' — '}{compliance.verdict_reason}
      </div>
    </div>
  )
}

export function Stage3Editorial({ task, onDecision }: Props) {
  const content = task.content as Stage3Content
  const platforms = task.platforms_in_scope

  const [activePlatform, setActivePlatform] = useState<Platform>(platforms[0])
  const [feedback, setFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const compliance = content?.platforms?.[activePlatform]
  const MComponent = activePlatform === 'linkedin' ? LinkedInMockup
    : activePlatform === 'x' ? XMockup
    : InstagramMockup

  const overallApproved = content?.overall_verdict === 'approved'

  async function handleSubmit(action: 'approve_all' | 'send_back' | 'reject') {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/reviews/${task.task_id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, feedback }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        if (res.status === 409) throw new Error('This review was already submitted — check the queue for a newer version.')
        throw new Error(err.error ?? `Server error ${res.status}`)
      }
      setSubmitted(true)
      setTimeout(onDecision, 1800)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="card p-14 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-loopin-teal/10 border border-loopin-teal/30 flex items-center justify-center mx-auto mb-5">
          <span className="text-3xl text-loopin-teal">✓</span>
        </div>
        <h3 className="text-lg font-semibold text-loopin-text mb-2">All done</h3>
        <p className="text-loopin-text-secondary text-sm">Content logged and ready to publish.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Overall verdict banner */}
      <div className={`card p-5 flex items-start gap-4 ${
        overallApproved ? 'border-emerald-400/30 bg-emerald-400/5' : 'border-amber-400/30 bg-amber-400/5'
      }`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          overallApproved ? 'bg-emerald-400/10 border border-emerald-400/20' : 'bg-amber-400/10 border border-amber-400/20'
        }`}>
          <span className="text-lg">{overallApproved ? '✓' : '⚠'}</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-loopin-text mb-1">
            Taylor's verdict: {overallApproved ? 'Approved' : 'Needs revision'}
          </p>
          <p className="text-xs text-loopin-text-secondary leading-relaxed">{content?.overall_notes}</p>
        </div>
      </div>

      {/* Platform switcher */}
      <div className="card p-4 flex items-center justify-between gap-4 flex-wrap">
        <PlatformTabs platforms={platforms} active={activePlatform} onChange={setActivePlatform} />
      </div>

      {/* Split view: compliance + mockup */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: compliance report */}
        <div className="space-y-4">
          {compliance ? (
            <CompliancePanel platform={activePlatform} compliance={compliance} />
          ) : (
            <div className="card p-8 text-center text-loopin-text-secondary text-sm">
              No compliance data for this platform.
            </div>
          )}
        </div>

        {/* Right: final mockup */}
        <div>
          {compliance ? (
            <MComponent
              copy={compliance.final_copy}
              hashtags={compliance.hashtags}
              cta=""
              imageUrl={compliance.image_url}
              client={task.client}
              variant="a"
              selected={false}
            />
          ) : null}
        </div>
      </div>

      {/* Feedback */}
      <div>
        <label className="block text-xs font-semibold text-loopin-text-secondary uppercase tracking-widest mb-2">
          Feedback <span className="normal-case font-normal text-loopin-muted">(optional)</span>
        </label>
        <textarea
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          placeholder="Any final notes before publishing..."
          rows={2}
          className="w-full bg-loopin-card border border-loopin-border rounded-xl px-4 py-3 text-sm text-loopin-text placeholder-loopin-muted resize-none focus:outline-none focus:border-loopin-purple transition-colors"
        />
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between pt-2 border-t border-loopin-border flex-wrap gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => handleSubmit('send_back')}
            disabled={submitting}
            className="text-sm text-loopin-text-secondary border border-loopin-border rounded-xl px-4 py-2.5 hover:border-loopin-text-secondary transition-colors"
          >
            ↩ Send back
          </button>
          <button
            onClick={() => handleSubmit('reject')}
            disabled={submitting}
            className="text-sm text-red-400 border border-red-400/30 rounded-xl px-4 py-2.5 hover:border-red-400/60 transition-colors"
          >
            ✕ Reject
          </button>
        </div>
        <button
          onClick={() => handleSubmit('approve_all')}
          disabled={submitting}
          className="btn-primary min-w-[180px]"
        >
          {submitting ? (
            <span className="flex items-center gap-2 justify-center">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting...
            </span>
          ) : '✓ Approve & publish →'}
        </button>
      </div>
    </div>
  )
}
