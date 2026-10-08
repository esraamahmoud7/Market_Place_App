import { useCallback, useEffect, useState } from 'react'
import { api } from './api'

// GET a path and track loading / error. Pass null to skip fetching.
export function useApi(path) {
  const [tick, setTick] = useState(0)
  const key = path ? `${path}#${tick}` : null
  const [result, setResult] = useState({ key: null, data: null, error: '' })

  useEffect(() => {
    if (!key) return
    let cancelled = false
    api(path)
      .then((data) => !cancelled && setResult({ key, data, error: '' }))
      .catch((e) => !cancelled && setResult({ key, data: null, error: e.message }))
    return () => { cancelled = true }
  }, [key, path])

  const reload = useCallback(() => setTick((t) => t + 1), [])
  const settled = result.key === key
  return {
    data: settled ? result.data : null,
    error: settled ? result.error : '',
    loading: Boolean(key) && !settled,
    reload,
  }
}
