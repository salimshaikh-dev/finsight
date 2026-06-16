import { useState, useRef, DragEvent, ChangeEvent } from 'react'

interface Props {
  onFile: (file: File) => void
  loading: boolean
}

const MAX_SIZE_MB = 10

export function UploadZone({ onFile, loading }: Props) {
  const [dragging, setDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function validateAndSet(file: File) {
    setError(null)
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are accepted.')
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File exceeds the ${MAX_SIZE_MB}MB limit.`)
      return
    }
    setSelectedFile(file)
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) validateAndSet(file)
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) validateAndSet(file)
  }

  function handleAnalyze() {
    if (selectedFile) onFile(selectedFile)
  }

  function handleReset() {
    setSelectedFile(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="flex flex-col items-center">

      {/* Headline */}
      <h1 className="font-display text-5xl font-bold tracking-tight text-white text-center mb-4 leading-[1.05]">
        Understand your<br />
        <span className="text-accent">bank statement</span><br />
        in seconds
      </h1>
      <p className="text-subtle text-base mb-10 text-center max-w-md">
        Upload any bank statement PDF. Claude reads every transaction and returns structured financial data.
      </p>

      {/* Drop zone */}
      <div
        className={`relative w-full max-w-xl border-2 border-dashed rounded-2xl px-10 py-14 
                    cursor-pointer transition-all text-center
                    ${dragging
                      ? 'border-accent bg-accent/5'
                      : 'border-border hover:border-border-strong hover:bg-bg-raised'
                    }`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !selectedFile && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleChange}
        />

        {/* Glow when dragging */}
        {dragging && (
          <div className="absolute inset-0 rounded-2xl bg-accent/5 pointer-events-none" />
        )}

        {/* Upload icon */}
        <div className="w-14 h-14 mx-auto mb-5 rounded-2xl border border-border-subtle
                        bg-bg-raised flex items-center justify-center">
          <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>

        {selectedFile ? (
          <div>
            <p className="text-white font-medium mb-1">{selectedFile.name}</p>
            <p className="text-xs font-mono text-muted mb-4">
              {(selectedFile.size / 1024).toFixed(1)} KB · Ready to analyze
            </p>
            <button
              onClick={(e) => { e.stopPropagation(); handleReset() }}
              className="text-xs text-muted hover:text-subtle underline underline-offset-2"
            >
              Remove file
            </button>
          </div>
        ) : (
          <div>
            <p className="text-white font-medium mb-1.5">
              Drop your bank statement here
            </p>
            <p className="text-xs font-mono text-muted">
              or click to browse — PDF only · max {MAX_SIZE_MB}MB
            </p>
          </div>
        )}
      </div>

      {/* Validation error */}
      {error && (
        <p className="mt-3 text-sm text-danger font-mono">{error}</p>
      )}

      {/* Analyze button */}
      <button
        onClick={handleAnalyze}
        disabled={!selectedFile || loading}
        className="mt-6 flex items-center gap-2.5 bg-accent text-bg-base font-display 
                   font-semibold px-8 py-3.5 rounded-xl text-sm tracking-wide
                   hover:bg-accent-hover transition-all
                   disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none
                   hover:-translate-y-0.5 active:translate-y-0"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-bg-base/30 border-t-bg-base 
                           rounded-full animate-spin" />
            Analyzing…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
            </svg>
            Run Analysis
          </>
        )}
      </button>

      {/* Trust signals */}
      <div className="mt-8 flex items-center gap-6 text-[11px] font-mono text-muted">
        <span className="flex items-center gap-1.5">
          <svg className="w-3 h-3 text-success" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          PDF parsed locally
        </span>
        <span className="flex items-center gap-1.5">
          <svg className="w-3 h-3 text-success" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Claude API · claude-sonnet
        </span>
        <span className="flex items-center gap-1.5">
          <svg className="w-3 h-3 text-success" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          No data stored
        </span>
      </div>
    </div>
  )
}
