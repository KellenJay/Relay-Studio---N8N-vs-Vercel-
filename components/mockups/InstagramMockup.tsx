interface Props {
  copy: string
  hashtags: string[]
  imageUrl?: string
  client: string
  variant: 'a' | 'b'
  selected?: boolean
}

export function InstagramMockup({ copy, hashtags, imageUrl, client, variant, selected }: Props) {
  const initials = client.slice(0, 2).toUpperCase()
  const safeHashtags = hashtags ?? []

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

      {/* Phone frame */}
      <div className="p-4 bg-[#1E1E30] flex justify-center">
        <div className="w-[260px] bg-black rounded-[32px] border border-slate-700 overflow-hidden shadow-2xl">
          {/* Status bar */}
          <div className="px-5 pt-3 pb-1 flex items-center justify-between">
            <span className="text-white text-[10px] font-semibold">9:41</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-1.5 rounded-sm bg-white/60" />
              <div className="w-1 h-1.5 rounded-sm bg-white/40" />
              <div className="w-1 h-1.5 rounded-sm bg-white/20" />
            </div>
          </div>

          {/* Instagram header */}
          <div className="px-3 py-2 flex items-center justify-between border-b border-white/5">
            <span className="text-white font-semibold text-sm" style={{ fontFamily: 'cursive' }}>Instagram</span>
            <div className="flex items-center gap-3">
              <span className="text-white text-base">♡</span>
              <span className="text-white text-base">✉</span>
            </div>
          </div>

          {/* Post header */}
          <div className="px-3 py-2 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#5B4AE8] to-[#00D9C8] p-[1.5px]">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">{initials}</span>
              </div>
            </div>
            <div>
              <span className="text-white text-[11px] font-semibold block leading-none">{client.toLowerCase().replace(/\s/g, '_')}</span>
              <span className="text-slate-400 text-[10px]">Sponsored</span>
            </div>
            <span className="ml-auto text-slate-400 text-base">···</span>
          </div>

          {/* Image */}
          <div className="w-full aspect-square bg-[#1a1a2e]">
            {imageUrl ? (
              <img src={imageUrl} alt="Post visual" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-loopin-muted text-xs text-center px-4">Image will appear here</span>
              </div>
            )}
          </div>

          {/* Engagement */}
          <div className="px-3 pt-2 pb-1 flex items-center gap-3">
            <span className="text-white text-base">♡</span>
            <span className="text-white text-base">💬</span>
            <span className="text-white text-base">✈</span>
            <span className="ml-auto text-white text-base">🔖</span>
          </div>

          {/* Caption */}
          <div className="px-3 pb-3">
            <p className="text-white text-[11px] leading-relaxed line-clamp-4">
              <span className="font-semibold">{client.toLowerCase().replace(/\s/g, '_')} </span>
              {copy}
            </p>
            {safeHashtags.length > 0 && (
              <p className="text-[#5B8DE8] text-[11px] mt-1 leading-relaxed line-clamp-2">
                {safeHashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(' ')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
