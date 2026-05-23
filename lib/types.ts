export type Platform = 'linkedin' | 'x' | 'instagram'
export type Stage = 1 | 2 | 3
export type ReviewStatus = 'pending' | 'approved' | 'revision' | 'rejected'
export type DecisionAction = 'approve' | 'reject' | 'feedback' | 'regenerate_image'

// ─── Stage 1 — Sofia Strategy ─────────────────────────────────────────────

export interface Angle {
  angle_id: string
  title: string
  rationale: string
  content_type: string
  hook_idea: string
}

export interface Stage1Content {
  brief_id: string
  brief_summary: string
  client: string
  analytics_context: {
    linkedin: string
    x: string
    instagram: string
  }
  platforms: {
    linkedin: { angles: Angle[] }
    x: { angles: Angle[] }
    instagram: { angles: Angle[] }
  }
}

// ─── Stage 2 — Marcus Copy + Visuals ──────────────────────────────────────

export interface CopyVariant {
  copy: string
  hashtags: string[]
  char_count: number
  cta: string
}

export interface PlatformDraft {
  angle_selected: string
  variant_a: CopyVariant
  variant_b: CopyVariant
  image_url: string
  image_prompt: string
}

export interface Stage2Content {
  brief_id: string
  brief_summary: string
  client: string
  platforms: {
    linkedin?: PlatformDraft
    x?: PlatformDraft
    instagram?: PlatformDraft
  }
}

// ─── Stage 3 — Taylor Editorial ───────────────────────────────────────────

export interface PlatformCompliance {
  compliance_score: number
  issues: string[]
  suggested_edits: string[]
  verdict: 'approved' | 'needs_revision'
  verdict_reason: string
  final_copy: string
  image_url: string
  hashtags: string[]
}

export interface Stage3Content {
  brief_id: string
  brief_summary: string
  client: string
  overall_verdict: 'approved' | 'needs_revision'
  overall_notes: string
  platforms: {
    linkedin?: PlatformCompliance
    x?: PlatformCompliance
    instagram?: PlatformCompliance
  }
}

// ─── Review Task (stored in Vercel KV) ────────────────────────────────────

export interface ReviewTask {
  task_id: string
  stage: Stage
  status: ReviewStatus
  resume_url: string
  client: string
  brief_id: string
  brief_summary: string
  platforms_in_scope: Platform[]
  created_at: string
  content: Stage1Content | Stage2Content | Stage3Content
}

// ─── Decision payload (frontend → n8n) ────────────────────────────────────

export interface Stage1Decision {
  action: 'submit_angles'
  selected_angles: {
    linkedin?: string   // angle_id
    x?: string
    instagram?: string
  }
  reviewer_notes: {
    linkedin?: string
    x?: string
    instagram?: string
  }
}

export interface Stage2Decision {
  action: 'approve' | 'send_back'
  platform_decisions: {
    [key in Platform]?: {
      selected_variant: 'a' | 'b' | 'custom'
      custom_copy?: string
      image_approved: boolean
      image_revision_notes?: string
    }
  }
  overall_feedback?: string
}

export interface Stage3Decision {
  action: 'approve_all' | 'approve_with_edits' | 'send_back' | 'reject'
  platform_edits?: {
    [key in Platform]?: { final_copy: string }
  }
  feedback?: string
}

// ─── Dashboard list item ───────────────────────────────────────────────────

export interface ReviewSummary {
  task_id: string
  stage: Stage
  status: ReviewStatus
  client: string
  brief_id: string
  brief_summary: string
  created_at: string
  platforms_in_scope: Platform[]
}
