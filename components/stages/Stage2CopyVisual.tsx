'use client'
import { useState } from 'react'
import type { ReviewTask, Stage2Content, Platform } from '@/lib/types'
import { PlatformTabs } from '@/components/ui/PlatformTabs'
import { LinkedInMockup } from '@/components/mockups/LinkedInMockup'
import { XMockup } from '@/components/mockups/XMockup'
import { InstagramMockup } from '@/components/mockups/InstagramMockup'
import { charCountColor } from '@/lib/utils'

interface Props {
  task: ReviewTask
  onDecision: () => void
}

type VariantChoice = 'a' | 'b'

export function Stage2CopyVisual({ task, onDecision }: Props) {
  const content = task.content as Stage2Content
  const platforms = task.platforms_in_scope

  const [activePlatform, setActivePlatform] = useState<Platform>(platforms[0])
  const [selected, setSelected] = useState<Partial<Record<Platform, VariantChoice>>>({})
  const [imageApproved, setImageApproved] = useState<Partial<Record<Platform, boolean>>>({})
  const [imageNotes, setImageNotes] = useState<Partial<Record<Platform, string>>>({})
  const [overallFeedback, setOverallFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const draft = content?.platforms?.[activePlatform]
  const allSelected = platforms.every(p => selected[p] && imageApproved[p] !== undefined)
  const selectedCount = platforms.filter(p => selected[p]).length

  async function handleSubmit(action: 'approve' | 'send_back') {
    if (action === 'approve' && !allSelected) return
    setSubmitting(true)
    try {
      const platform_decisions: Record<string, object> = {}
      for (const p of platforms) {
        platform_decisions[p] = {
          selected_variant: selected[p] ?? 'a',
          image_approved: imageApproved[p] ?? false,
          image_revision_notes: imageNotes[p] ?? '',
        }
      }
      const res = await fetch(`/api/reviews/${task.task_id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, platform_decisions, overall_feedback: overallFeedback }),
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
        <h3 className="text-lg font-semibold text-loopin-text mb-2">Decision submitted</h3>
        <p className="text-loopin-text-secondary text-sm">Taylor is running the final review...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Platform switcher */}
      <div className="card p-4 flex items-center justify-between gap-4 flex-wrap">
        <PlatformTabs platforms={platforms} active={activePlatform} onChange={setActivePlatform} />
        <span className="text-xs text-loopin-text-secondary">
          {selectedCount} of {platforms.length} variant{platforms.length !== 1 ? 's' : ''} selected
        </span>
      </div>

      {!draft ? (
        <div className="card p-8 text-center text-loopin-text-secondary text-sm">
          No copy available for this platform yet.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Angle reference */}
          <div className="card p-4 border-l-2 border-l-loopin-purple">
            <p className="text-xs text-loopin-text-secondary uppercase tracking-widest font-semibold mb-1">Approved angle</p>
            <p className="text-sm text-loopin-text">{draft.angle_selected}</p>
          </div>

          {/* Copy variants — side by side on desktop */}
          <div>
            <h2 className="text-xs font-semibold text-loopin-text-secondary uppercase tracking-widest mb-4">
              Pick one variant — {activePlatform === 'x' ? 'X (Twitter)' : activePlatform.charAt(0).toUpperCase() + activePlatform.slice(1)}
            </h2>
            <div className="grid gap-4 lg:grid-cols-2">
              {(['a', 'b'] as const).map(v => {
                const variant = v === 'a' ? draft.variant_a : draft.variant_b
                const isSelected = selected[activePlatform] === v
                const MComponent = activePlatform === 'linkedin' ? LinkedInMockup
                  : activePlatform === 'x' ? XMockup
                  : InstagramMockup

                return (
                  <div key={v} className="space-y-3">
                    <button
                      onClick={() => setSelected(s => ({ ...s, [activePlatform]: v }))}
                      className="w-full text-left"
                    >
                      <MComponent
                        copy={variant.copy}
                        hashtags={variant.hashtags}
                        cta={variant.cta}
                        imageUrl={draft.image_url}
                        client={task.client}
                        variant={v}
                        selected={isSelected}
                      />
                    </button>

                    {/* Char count */}
                    <div className="flex items-center justify-between px-1 text-xs">
                      <span className="text-loopin-text-secondary">{variant.cta && `CTA: ${variant.cta}`}</span>
                      <span className={charCountColor(variant.char_count,
                        activePlatform === 'linkedin' ? 1500
                          : activePlatform === 'x' ? 280
                          : 400
                      )}>
                        {variant.char_count} chars
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Image approval */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-loopin-text-secondary uppercase tracking-widest">
                Image approval
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setImageApproved(a => ({ ...a, [activePlatform]: true }))}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    imageApproved[activePlatform] === true
                      ? 'bg-loopin-teal/10 border-loopin-teal/50 text-loopin-teal'
                      : 'border-loopin-border text-loopin-text-secondary hover:border-loopin-teal/40'
                  }`}
                >
                  ✓ Approve image
                </button>
                <button
                  onClick={() => setImageApproved(a => ({ ...a, [activePlatform]: false }))}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    imageApproved[activePlatform] === false
                      ? 'bg-amber-400/10 border-amber-400/50 text-amber-400'
                      : 'border-loopin-border text-loopin-text-secondary hover:border-amber-400/40'
                  }`}
                >
                  ↩ Request new image
                </button>
              </div>
            </div>

            {imageApproved[activePlatform] === false && (
              <textarea
                value={imageNotes[activePlatform] ?? ''}
                onChange={e => setImageNotes(n => ({ ...n, [activePlatform]: e.target.value }))}
                placeholder="Describe what you'd like changed..."
                rows={2}
                className="w-full bg-loopin-card border border-loopin-border rounded-xl px-4 py-3 text-sm text-loopin-text placeholder-loopin-muted resize-none focus:outline-none focus:border-loopin-purple transition-colors"
              />
            )}

            {draft.image_prompt && (
              <p className="text-xs text-loopin-muted italic">
                Marcus prompt: "{draft.image_prompt}"
              </p>
            )}
          </div>

          {/* Overall feedback */}
          <div>
            <label className="block text-xs font-semibold text-loopin-text-secondary uppercase tracking-widest mb-2">
              Overall feedback <span className="normal-case font-normal text-loopin-muted">(optional)</span>
            </label>
            <textarea
              value={overallFeedback}
              onChange={e => setOverallFeedback(e.target.value)}
              placeholder="Any cross-platform notes..."
              rows={2}
              className="w-full bg-loopin-card border border-loopin-border rounded-xl px-4 py-3 text-sm text-loopin-text placeholder-loopin-muted resize-none focus:outline-none focus:border-loopin-purple transition-colors"
            />
          </div>
        </div>
      )}

      {/* Submit bar */}
      <div className="flex items-center justify-between pt-2 border-t border-loopin-border flex-wrap gap-3">
        <button
          onClick={() => handleSubmit('send_back')}
          disabled={submitting}
          className="text-sm text-loopin-text-secondary border border-loopin-border rounded-xl px-4 py-2.5 hover:border-loopin-text-secondary transition-colors"
        >
          ↩ Send back to Sofia
        </button>
        <div className="flex items-center gap-3">
          <p className="text-xs text-loopin-text-secondary hidden sm:block">
            {allSelected ? 'Ready for final review' : 'Select a variant + image decision for each platform'}
          </p>
          <button
            onClick={() => handleSubmit('approve')}
            disabled={!allSelected || submitting}
            className="btn-primary min-w-[160px]"
          >
            {submitting ? (
              <span className="flex items-center gap-2 justify-center">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </span>
            ) : 'Send to Taylor →'}
          </button>
        </div>
      </div>
    </div>
  )
}
