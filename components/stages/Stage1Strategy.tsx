'use client'
import { useState } from 'react'
import type { ReviewTask, Stage1Content, Platform, Angle } from '@/lib/types'
import { PlatformTabs } from '@/components/ui/PlatformTabs'

interface Props {
  task: ReviewTask
  onDecision: () => void
}

export function Stage1Strategy({ task, onDecision }: Props) {
  const content = task.content as Stage1Content
  const platforms = task.platforms_in_scope

  const [activePlatform, setActivePlatform] = useState<Platform>(platforms[0])
  const [selected, setSelected] = useState<Partial<Record<Platform, string>>>({})
  const [notes, setNotes] = useState<Partial<Record<Platform, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const angles: Angle[] = content?.platforms?.[activePlatform]?.angles ?? []
  const allSelected = platforms.every(p => selected[p])
  const selectedCount = platforms.filter(p => selected[p]).length

  async function handleSubmit() {
    if (!allSelected) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/reviews/${task.task_id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_angles',
          selected_angles: selected,
          reviewer_notes: notes,
        }),
      })
      if (!res.ok) throw new Error()
      setSubmitted(true)
      setTimeout(onDecision, 1800)
    } catch {
      alert('Failed to submit. Please try again.')
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
        <h3 className="text-lg font-semibold text-loopin-text mb-2">Angles submitted</h3>
        <p className="text-loopin-text-secondary text-sm">Sofia is writing your copy now...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Platform switcher */}
      <div className="card p-4 flex items-center justify-between gap-4 flex-wrap">
        <PlatformTabs platforms={platforms} active={activePlatform} onChange={setActivePlatform} />
        <span className="text-xs text-loopin-text-secondary">
          {selectedCount} of {platforms.length} platform{platforms.length !== 1 ? 's' : ''} selected
        </span>
      </div>

      {/* Angle cards */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xs font-semibold text-loopin-text-secondary uppercase tracking-widest">
            Pick one angle — {activePlatform === 'x' ? 'X (Twitter)' : activePlatform.charAt(0).toUpperCase() + activePlatform.slice(1)}
          </h2>
          {selected[activePlatform] && (
            <span className="text-xs text-loopin-teal bg-loopin-teal/10 border border-loopin-teal/30 px-2 py-0.5 rounded-full">
              ✓ Selected
            </span>
          )}
        </div>

        {angles.length === 0 ? (
          <div className="card p-8 text-center text-loopin-text-secondary text-sm">
            No angles available for this platform yet.
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-3">
            {angles.map((angle, i) => {
              const id = angle.angle_id ?? String(i)
              const isSelected = selected[activePlatform] === id
              return (
                <button
                  key={id}
                  onClick={() => setSelected(s => ({ ...s, [activePlatform]: id }))}
                  className={`angle-card text-left ${isSelected ? 'angle-card-selected' : ''}`}
                >
                  {/* Number + title */}
                  <div className="flex items-start gap-3 mb-3">
                    <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      isSelected ? 'bg-loopin-purple text-white' : 'bg-loopin-border text-loopin-muted'
                    }`}>
                      {i + 1}
                    </span>
                    <h3 className="text-sm font-semibold text-loopin-text leading-snug">{angle.title}</h3>
                  </div>

                  {/* Content type tag */}
                  {angle.content_type && (
                    <span className="inline-block text-xs text-loopin-teal bg-loopin-teal/10 px-2 py-0.5 rounded mb-2">
                      {angle.content_type}
                    </span>
                  )}

                  {/* Rationale */}
                  <p className="text-xs text-loopin-text-secondary leading-relaxed mb-3">
                    {angle.rationale}
                  </p>

                  {/* Hook idea */}
                  {angle.hook_idea && (
                    <div className="border-t border-loopin-border/60 pt-2.5 mt-auto">
                      <p className="text-xs text-loopin-muted italic leading-relaxed">
                        "{angle.hook_idea}"
                      </p>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-semibold text-loopin-text-secondary uppercase tracking-widest mb-2">
          Notes for Sofia — {activePlatform} <span className="normal-case font-normal text-loopin-muted">(optional)</span>
        </label>
        <textarea
          value={notes[activePlatform] ?? ''}
          onChange={e => setNotes(n => ({ ...n, [activePlatform]: e.target.value }))}
          placeholder="Tone tweaks, specific hooks to try, things to avoid..."
          rows={3}
          className="w-full bg-loopin-card border border-loopin-border rounded-xl px-4 py-3 text-sm text-loopin-text placeholder-loopin-muted resize-none focus:outline-none focus:border-loopin-purple transition-colors"
        />
      </div>

      {/* Submit bar */}
      <div className="flex items-center justify-between pt-2 border-t border-loopin-border">
        <p className="text-xs text-loopin-text-secondary">
          {allSelected
            ? 'All platforms selected — ready to submit'
            : `Select an angle for each platform to continue`}
        </p>
        <button
          onClick={handleSubmit}
          disabled={!allSelected || submitting}
          className="btn-primary min-w-[160px]"
        >
          {submitting ? (
            <span className="flex items-center gap-2 justify-center">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting...
            </span>
          ) : 'Send to Sofia →'}
        </button>
      </div>
    </div>
  )
}
