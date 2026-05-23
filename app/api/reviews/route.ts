import { kv } from '@vercel/kv'
import { NextRequest, NextResponse } from 'next/server'
import type { ReviewTask, ReviewSummary } from '@/lib/types'
import { randomUUID } from 'crypto'

// POST /api/reviews — n8n calls this to create a new review task
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-relay-secret')
  if (secret !== process.env.RELAY_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { stage, resume_url, client, brief_id, brief_summary, platforms_in_scope, content } = body

  if (!stage || !resume_url || !client || !content) {
    return NextResponse.json({ error: 'Missing required fields: stage, resume_url, client, content' }, { status: 400 })
  }

  const task_id = randomUUID()
  const task: ReviewTask = {
    task_id,
    stage,
    status: 'pending',
    resume_url,
    client,
    brief_id: brief_id ?? 'unknown',
    brief_summary: brief_summary ?? '',
    platforms_in_scope: platforms_in_scope ?? ['linkedin', 'x', 'instagram'],
    created_at: new Date().toISOString(),
    content,
  }

  // Store review task with 48-hour TTL
  await kv.set(`review:${task_id}`, task, { ex: 172800 })

  // Add to the active reviews index list (trimmed to last 50)
  await kv.lpush('review:index', task_id)
  await kv.ltrim('review:index', 0, 49)

  const reviewUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/review/${task_id}`

  return NextResponse.json({ task_id, review_url: reviewUrl }, { status: 201 })
}

// GET /api/reviews — dashboard list
export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-relay-secret')
  // Dashboard is public (no secret needed), but n8n internal calls carry secret
  // We still return the list for the dashboard UI

  const ids: string[] = (await kv.lrange('review:index', 0, 49)) ?? []
  if (!ids.length) return NextResponse.json([])

  const tasks = await Promise.all(
    ids.map((id) => kv.get<ReviewTask>(`review:${id}`))
  )

  const summaries: ReviewSummary[] = tasks
    .filter((t): t is ReviewTask => t !== null)
    .map(({ task_id, stage, status, client, brief_id, brief_summary, created_at, platforms_in_scope }) => ({
      task_id, stage, status, client, brief_id, brief_summary, created_at, platforms_in_scope,
    }))

  return NextResponse.json(summaries)
}
