import { useCallback, useEffect, useRef, useState } from 'react'

const stableKey = (deps) => {
  try {
    return JSON.stringify(deps ?? [])
  } catch {
    return String(Date.now())
  }
}

export function useApiQuery(fetcher, deps = [], { skip = false, initialData = null, onSuccess, onError } = {}) {
  const [data, setData] = useState(initialData)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(!skip)
  const [nonce, setNonce] = useState(0)
  const aliveRef = useRef(true)
  const callbacksRef = useRef({ onSuccess, onError })
  callbacksRef.current = { onSuccess, onError }

  useEffect(() => {
    aliveRef.current = true
    return () => {
      aliveRef.current = false
    }
  }, [])

  const key = stableKey([...deps, nonce])

  useEffect(() => {
    if (skip || typeof fetcher !== 'function') {
      setLoading(false)
      return undefined
    }

    const controller = new AbortController()
    setLoading(true)
    setError(null)

    Promise.resolve(fetcher({ signal: controller.signal }))
      .then((result) => {
        if (!aliveRef.current || controller.signal.aborted) return
        setData(result)
        callbacksRef.current.onSuccess?.(result)
      })
      .catch((err) => {
        if (!aliveRef.current || controller.signal.aborted) return
        setError(err)
        callbacksRef.current.onError?.(err)
      })
      .finally(() => {
        if (!aliveRef.current || controller.signal.aborted) return
        setLoading(false)
      })

    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, skip])

  const refetch = useCallback(() => setNonce((n) => n + 1), [])
  const setValue = useCallback((updater) => {
    setData((prev) => (typeof updater === 'function' ? updater(prev) : updater))
  }, [])

  return { data, error, loading, refetch, setData: setValue }
}

export function useApiMutation(mutationFn) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const mutateAsync = useCallback(
    async (...args) => {
      setLoading(true)
      setError(null)
      try {
        return await mutationFn(...args)
      } catch (err) {
        if (mountedRef.current) setError(err)
        throw err
      } finally {
        if (mountedRef.current) setLoading(false)
      }
    },
    [mutationFn],
  )

  const mutate = useCallback(
    (...args) => mutateAsync(...args).catch(() => undefined),
    [mutateAsync],
  )

  const reset = useCallback(() => {
    setError(null)
    setLoading(false)
  }, [])

  return { mutate, mutateAsync, loading, error, reset }
}
