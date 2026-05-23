interface Props {
  copy: string
  hashtags: string[]
  imageUrl?: string
  client: string
  variant: 'a' | 'b'
  selected?: boolean
}

export function XMockup({ copy, hashtags, imageUrl, client, variant, selected }: Props) {
  const initials = client.slice(0, 2).toUpperCase()
  // Split into tweet thread if multi-line or over 280 chars
  const tweets = copy.split('\n\n').filter(Boolean)

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

      {/* X / Twitter thread */}
      <div className="p-4 bg-[#1E1E30] space-y-4">
        {tweets.map((tweet, i) => (
          <div key={i} className="flex gap-3">
            {/* Thread line */}
            <div className="flex flex-col items-center shrink-0">
              <div className="w-9 h-9 rounded-full bg-[#1D9BF0] flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
              {i < tweets.length - 1 && (
                <div className="w-0.5 flex-1 bg-slate-700 mt-2 min-h-[1rem]" />
              )}
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-sm font-bold text-white">{client}</span>
                <span className="text-sm text-slate-500">@{client.toLowerCase().replace(/\s/g, '')} · now</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                {tweet}
              </p>
              {/* Hashtags on last tweet */}
              {i === tweets.length - 1 && hashtags.length > 0 && (
                <p className="text-sm text-[#1D9BF0] mt-1">
                  {hashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(' ')}
                </p>
              )}
              {/* Image on first tweet */}
              {i === 0 && imageUrl && (
                <div className="rounded-2xl overflow-hidden mt-2 bg-loopin-border/30 aspect-video">
                  <img src={imageUrl} alt="Post visual" className="w-full h-full object-cover" />
                </div>
              )}
              {i === 0 && !imageUrl && (
                <div className="rounded-2xl mt-2 bg-loopin-border/20 border border-loopin-border/40 aspect-video flex items-center justify-center">
                  <span className="text-loopin-muted text-xs">Image will appear here</span>
                </div>
              )}
              {/* Engagement */}
              <div className="flex items-center gap-5 mt-2 text-xs text-slate-500">
                <span>💬</span>
                <span>🔁</span>
                <span>♡</span>
                <span>↗</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
