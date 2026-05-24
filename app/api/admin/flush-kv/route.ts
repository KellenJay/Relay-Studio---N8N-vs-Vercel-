import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'

const kv = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

// POST /api/admin/flush-kv
// Deletes all review:* keys and the review:index list.
// Protected by RELAY_SECRET. Remove this route after use.
export async function POST(req: NextRequest) {
  if (req.headers.get('x-relay-secret') !== process.env.RELAY_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const ids: string[] = (await kv.lrange('review:index', 0, -1)) ?? []
  const keysToDelete: string[] = ['review:index', ...ids.map(id => `review:${id}`)]

  let deleted = 0
  for (const key of keysToDelete) {
    await kv.del(key)
    deleted++
  }

  return NextResponse.json({ ok: true, deleted, keys: keysToDelete })
}
