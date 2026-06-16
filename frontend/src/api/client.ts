import axios, { AxiosError } from 'axios'
import type { AnalyzeResponse } from '../types'

// In development: Vite proxy forwards to localhost:8000
// In production: VITE_API_URL points to Railway backend
const API_BASE = import.meta.env.VITE_API_URL ?? ''

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 60_000, // 60s — Claude can be slow on large statements
})

export async function analyzeStatement(file: File): Promise<AnalyzeResponse> {
  const form = new FormData()
  form.append('file', file)

  try {
    const { data } = await apiClient.post<AnalyzeResponse>('/analyze', form)
    return data
  } catch (err) {
    const axiosErr = err as AxiosError<{ detail: string }>
    const message =
      axiosErr.response?.data?.detail ??
      axiosErr.message ??
      'An unexpected error occurred. Please try again.'
    throw new Error(message)
  }
}

export async function checkHealth(): Promise<boolean> {
  try {
    await apiClient.get('/health')
    return true
  } catch {
    return false
  }
}
