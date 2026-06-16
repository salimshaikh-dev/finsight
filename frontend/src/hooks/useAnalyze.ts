import { useState, useCallback } from 'react'
import type { AnalyzeState, AnalyzeResponse } from '../types'
import { analyzeStatement } from '../api/client'

interface UseAnalyzeReturn {
  state: AnalyzeState
  analyze: (file: File) => Promise<void>
  reset: () => void
}

export function useAnalyze(): UseAnalyzeReturn {
  const [state, setState] = useState<AnalyzeState>({ status: 'idle' })

  const analyze = useCallback(async (file: File) => {
    setState({ status: 'loading' })
    try {
      const data: AnalyzeResponse = await analyzeStatement(file)
      setState({ status: 'success', data })
    } catch (err) {
      setState({
        status: 'error',
        message: err instanceof Error ? err.message : 'An unknown error occurred.',
      })
    }
  }, [])

  const reset = useCallback(() => {
    setState({ status: 'idle' })
  }, [])

  return { state, analyze, reset }
}
