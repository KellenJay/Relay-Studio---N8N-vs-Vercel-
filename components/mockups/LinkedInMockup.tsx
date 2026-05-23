import type { CopyVariant } from '@/lib/types'

interface Props {
  copy: string
  hashtags: string[]
  cta: string
  imageUrl?: string
  client: string
  variant: 'a' | 'b'
  selected?: boolean
}

export function LinkedInMockup({ copy, hashtags, cta, imageUrl, client, variant, selected }: Props) {
  const initials = client.slice(0, 2).toUpperCase()

  return (
    <div className={`rounded-xl border transition-all duration-200 overflow-hidden ${
      selected
        ? 'border-loopin-purple shadow-[0_0_0_2px_rgba(91,74,232,0.3)]'
        : 'border-loopin-border'
    } bg-[#1B1B2E]`}>
      {/* Variant label */}
      <div className={`px-4 py-2 flex items-center justify-between border-b border-loopin-border ${
        selected ? 'bg-loopin-purple/10' : 'bg-loopin-card'
      }`}>
        <span className="text-xs font-semibold text-loopin-text-secondary uppercase tracking-widest">
          Variant {variant.toUpperCase()}
        </span>
        {selected && (
          <span className="text-xs text-loopin-purple font-medium">Selected</span>
        )}
      </div>

      {/* LinkedIn card */}
      <div className="p-4 bg-[#1E1E30]">
        {/* Author row */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-loopin-purple flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">{initials}</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-white leading-tight">{client}</div>
            <div className="text-xs text-slate-400 leading-tight">Content Agency · Just now</div>
          </div>
        </div>

        {/* Copy */}
        <p className="text-sm text-slate-200 leading-relaxed mb-3 whitespace-pre-wrap line-clamp-6">
          {copy}
        </p>

        {/* Hashtags */}
        {hashtags.length > 0 && (
          <p className="text-sm text-[#5B8DE8] mb-3 leading-relaxed">
            {hashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(' ')}
          </p>
        )}

        {/* Image */}
        {imageUrl ? (
          <div className="rounded-lg overflow-hidden mb-3 bg-loopin-border/30 aspect-[1200/627]">
            <img src={imageUrl} alt="Post visual" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="rounded-lg mb-3 bg-loopin-border/20 border border-loopin-border/40 aspect-[1200/627] flex items-center justify-center">
            <span className="text-loopin-muted text-xs">Image will appear here</span>
          </div>
        )}

        {/* Engagement bar */}
        <div className="flex items-center gap-4 pt-2 border-t border-white/5 text-xs text-slate-500">
          <span>👍 Like</span>
          <span>💬 Comment</span>
          <span>↗ Share</span>
        </div>
      </div>
    </div>
  )
}
