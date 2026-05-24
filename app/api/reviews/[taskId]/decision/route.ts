import { Redis } from '@upstash/redis'
import { waitUntil } from '@vercel/functions'
import { NextRequest, NextResponse } from 'next/server'
import type { ReviewTask, ReviewStatus } from '@/lib/types'

const kv = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

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

  // waitUntil keeps the Vercel lambda alive until n8n resume completes,
  // while returning the response to the reviewer immediately.
  const body = JSON.stringify({ task_id: params.taskId, ...decision })
  waitUntil(
    fetch(task.resume_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    }).then(r => {
      if (!r.ok) console.error('n8n resume failed:', r.status)
    }).catch(err => {
      console.error('n8n resume unreachable:', err)
    })
  )

  return NextResponse.json({ ok: true, status: newStatus })
}
