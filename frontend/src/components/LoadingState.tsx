const STEPS = [
  { label: 'Extracting text from PDF', detail: 'pdfplumber · dual-pass (tables + raw)' },
  { label: 'Sending to Claude', detail: 'claude-sonnet-4-20250514 · ~12k tokens' },
  { label: 'Parsing JSON response', detail: 'Pydantic validation · category mapping' },
]

export function LoadingState() {
  return (
    <div className="flex flex-col items-center py-20">
      {/* Spinner */}
      <div className="relative w-16 h-16 mb-8">
        <div className="absolute inset-0 rounded-full border-2 border-border-subtle" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent 
                        border-t-accent animate-spin" />
        <div className="absolute inset-2 rounded-full border border-border-subtle/50 
                        border-t-accent/30 animate-spin"
             style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
      </div>

      <h2 className="font-display text-xl font-semibold text-white mb-2">
        Analyzing your statement
      </h2>
      <p className="text-sm text-muted font-mono mb-10">
        This usually takes 5–15 seconds
      </p>

      {/* Processing steps */}
      <div className="w-full max-w-sm space-y-3">
        {STEPS.map((step, i) => (
          <div
            key={i}
            className="flex items-start gap-3 opacity-0 animate-fade-up"
            style={{
              animationDelay: `${i * 600}ms`,
              animationFillMode: 'forwards',
            }}
          >
            <div className="w-5 h-5 mt-0.5 rounded-full border border-accent/30 
                            bg-accent/10 flex items-center justify-center shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-slow" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{step.label}</p>
              <p className="text-xs font-mono text-muted">{step.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
