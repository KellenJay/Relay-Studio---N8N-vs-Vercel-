import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'
import type { ReviewTask } from '@/lib/types'

const kv = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

// GET /api/reviews/[taskId] — review page fetches full task data
export async function GET(
  _req: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const task = await kv.get<ReviewTask>(`review:${params.taskId}`)
  if (!task) {
    return NextResponse.json({ error: 'Review not found or expired' }, { status: 404 })
  }
  return NextResponse.json(task)
}

// PATCH /api/reviews/[taskId] — append voice note transcription
export async function PATCH(
  req: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const secret = req.headers.get('x-relay-secret')
  if (secret !== process.env.RELAY_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const task = await kv.get<ReviewTask>(`review:${params.taskId}`)
  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { voice_note_text } = await req.json()
  const updated = { ...task, voice_note: voice_note_text, voice_note_at: new Date().toISOString() }
  await kv.set(`review:${params.taskId}`, updated, { ex: 172800 })

  return NextResponse.json({ ok: true })
}
