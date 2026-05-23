import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'
import type { ReviewTask, ReviewStatus } from '@/lib/types'

const kv = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

// POST /api/reviews/[taskId]/decision — reviewer submits decision → n8n resumes
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

  const actionToStatus: Record<string, ReviewStatus> = {
    approve: 'approved',
    approve_all: 'approved',
    approve_with_edits: 'approved',
    submit_angles: 'approved',
    send_back: 'revision',
    reject: 'rejected',
  }
  const newStatus: ReviewStatus = actionToStatus[decision.action] ?? 'revision'

  await kv.set(`review:${params.taskId}`, { ...task, status: newStatus }, { ex: 172800 })

  // Forward decision to n8n resume URL so the workflow continues
  try {
    const n8nRes = await fetch(task.resume_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id: params.taskId, ...decision }),
    })
    if (!n8nRes.ok) {
      console.error('n8n resume failed:', n8nRes.status, await n8nRes.text())
    }
  } catch (err) {
    // Decision is saved — don't fail the UI if n8n is unreachable
    console.error('Failed to reach n8n resume URL:', err)
  }

  return NextResponse.json({ ok: true, status: newStatus })
}
