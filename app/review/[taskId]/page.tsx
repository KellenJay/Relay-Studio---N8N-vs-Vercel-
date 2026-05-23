'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import type { ReviewTask } from '@/lib/types'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Stage1Strategy } from '@/components/stages/Stage1Strategy'
import { Stage2CopyVisual } from '@/components/stages/Stage2CopyVisual'
import { Stage3Editorial } from '@/components/stages/Stage3Editorial'
import { stageName } from '@/lib/utils'

export default function ReviewPage() {
  const { taskId } = useParams<{ taskId: string }>()
  const router = useRouter()
  const [task, setTask] = useState<ReviewTask | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/reviews/${taskId}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(setTask)
      .catch(code => setError(
        code === 404 ? 'Review not found or expired.' : 'Could not load review.'
      ))
      .finally(() => setLoading(false))
  }, [taskId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-6 h-6 border-2 border-loopin-purple border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="card p-10">
          <div className="w-12 h-12 rounded-xl bg-red-400/10 border border-red-400/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-xl">✕</span>
          </div>
          <p className="text-loopin-text font-semibold mb-1">Review not found</p>
          <p className="text-loopin-text-secondary text-sm mb-6">{error}</p>
          <Link href="/" className="btn-primary text-sm px-5 py-2.5 inline-block">
            ← Back to queue
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link href="/" className="text-loopin-text-secondary hover:text-loopin-text transition-colors">
          Queue
        </Link>
        <span className="text-loopin-border">/</span>
        <span className="text-loopin-text font-medium">{task.brief_id}</span>
        <span className="text-loopin-border">/</span>
        <span className="text-loopin-text-secondary">{stageName(task.stage)}</span>
      </div>

      {/* Header */}
      <div className="card p-5 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-semibold text-loopin-purple uppercase tracking-wide">
                {task.client}
              </span>
              <span className="text-loopin-border text-xs">·</span>
              <span className="text-xs text-loopin-text-secondary font-mono">{task.brief_id}</span>
            </div>
            <p className="text-base font-semibold text-loopin-text mb-4 leading-snug">
              {task.brief_summary}
            </p>
            <ProgressBar current={task.stage} />
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <StatusBadge status={task.status} />
            <span className="text-xs text-loopin-text-secondary">Stage {task.stage} of 3</span>
          </div>
        </div>
      </div>

      {/* Stage content */}
      {task.stage === 1 && (
        <Stage1Strategy task={task} onDecision={() => router.push('/')} />
      )}
      {task.stage === 2 && (
        <Stage2CopyVisual task={task} onDecision={() => router.push('/')} />
      )}
      {task.stage === 3 && (
        <Stage3Editorial task={task} onDecision={() => router.push('/')} />
      )}
    </div>
  )
}
