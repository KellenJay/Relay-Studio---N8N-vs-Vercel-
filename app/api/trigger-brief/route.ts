import { NextRequest, NextResponse } from 'next/server'

const WEBHOOK_URL = `${process.env.N8N_WEBHOOK_BASE ?? 'https://n8n.srv1696847.hstgr.cloud/webhook'}/relay-content`

export async function POST(req: NextRequest) {
  const { brief_id, client, platform, topic_hint } = await req.json()

  if (!brief_id || !client || !topic_hint) {
    return NextResponse.json({ error: 'brief_id, client and topic_hint are required' }, { status: 400 })
  }

  const res = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ brief_id, client, platform: platform || 'linkedin', topic_hint }),
  })

  if (!res.ok) {
    return NextResponse.json({ error: `n8n returned ${res.status}` }, { status: 502 })
  }

  const data = await res.json()
  return NextResponse.json(data)
}
