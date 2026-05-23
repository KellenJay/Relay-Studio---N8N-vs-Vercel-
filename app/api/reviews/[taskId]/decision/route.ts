import { kv } from '@vercel/kv'
import { NextRequest, NextResponse } from 'next/server'
import type { ReviewTask, ReviewStatus } from '@/lib/types'

// POST /api/reviews/[taskId]/decision — reviewer submits approval/rejection/feedback
export async function POST(
  req: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const task = await kv.get<ReviewTask>(`review:${params.taskId}`)
  if (!task) {
    return NextResponse.json({ error: 'Review not found or expired' }, { status: 404 })
  }
  if (task.status !== 'pending') {
    return NextResponse.json({ error: 'Review already actioned' }, { status: 409 })
  }

  const decision = await req.json()

  // Determine new status from action
  const actionToStatus: Record<string, ReviewStatus> = {
    approve: 'approved',
    approve_all: 'approved',
    approve_with_edits: 'approved',
    submit_angles: 'approved',
    send_back: 'revision',
    reject: 'rejected',
  }
  const newStatus: ReviewStatus = actionToStatus[decision.action] ?? 'revision'

  // Update task status in KV
  await kv.set(`review:${params.taskId}`, { ...task, status: newStatus }, { ex: 172800 })

  // Forward decision to n8n's resume URL so the workflow continues
  try {
    const n8nResponse = await fetch(task.resume_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id: params.taskId, ...decision }),
    })
    if (!n8nResponse.ok) {
      console.error('n8n resume failed:', n8nResponse.status, await n8nResponse.text())
    }
  } catch (err) {
    console.error('Failed to reach n8n resume URL:', err)
    // Don't fail the user-facing request — the decision is saved in KV
  }

  return NextResponse.json({ ok: true, status: newStatus })
}
