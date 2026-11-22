import { useCallback, useEffect, useRef, useState } from 'react'
import { loadTitles } from '../data/analytics'

export function useNetflixData() {
  const [state, setState] = useState({ titles: [], loading: true, error: null })
  const controllerRef = useRef(null)

  const fetchData = useCallback(() => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller

    loadTitles(controller.signal)
      .then((titles) => {
        if (!controller.signal.aborted) setState({ titles, loading: false, error: null })
      })
      .catch((error) => {
        if (!controller.signal.aborted && error.name !== 'AbortError') {
          setState({ titles: [], loading: false, error: error.message })
        }
      })
  }, [])

  const reload = useCallback(() => {
    setState({ titles: [], loading: true, error: null })
    fetchData()
  }, [fetchData])

  useEffect(() => {
    fetchData()
    return () => controllerRef.current?.abort()
  }, [fetchData])

  return { ...state, reload }
}
