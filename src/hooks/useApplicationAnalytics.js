import { useEffect, useMemo, useState } from 'react'
import { fetchApplications } from '../lib/applications'
import { buildAnalyticsSummary } from '../lib/analytics'
import { COLUMNS } from '../pages/dashboard/dashboardData'

// Fetched once on mount, so the page reflects the latest board on each visit.
export default function useApplicationAnalytics(columns = COLUMNS) {
  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    let cancelled = false

    fetchApplications()
      .then((rows) => {
        if (!cancelled) setApplications(rows)
      })
      .catch((error) => {
        console.error('Failed to load applications for analytics', error)
        if (!cancelled) setLoadError(error)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const summary = useMemo(
    () => buildAnalyticsSummary(applications, columns),
    [applications, columns]
  )

  return { summary, isLoading, loadError }
}
