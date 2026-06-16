interface Props {
  message: string
  onReset: () => void
}

export function ErrorState({ message, onReset }: Props) {
  return (
    <div className="flex flex-col items-center py-20">
      <div className="w-14 h-14 mb-5 rounded-2xl bg-danger/10 border border-danger/20
                      flex items-center justify-center">
        <svg className="w-6 h-6 text-danger" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>

      <h2 className="font-display text-xl font-semibold text-white mb-2">Analysis Failed</h2>
      <p className="text-sm font-mono text-danger text-center max-w-md mb-8 leading-relaxed">
        {message}
      </p>

      <button
        onClick={onReset}
        className="flex items-center gap-2 px-6 py-2.5 border border-border rounded-xl
                   text-sm text-subtle hover:text-white hover:border-border-strong 
                   hover:bg-bg-raised transition-all font-mono"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
        Try again
      </button>
    </div>
  )
}
