import beaver from '../../assets/beaver.png'
import beaverArms from '../../assets/beaverArms.png'
import AnalyticsDashboard from '../../components/analytics/AnalyticsDashboard'
import AnalyticsEmptyState from '../../components/analytics/AnalyticsEmptyState'
import PageShell, { BEAVER_POSITION } from '../../components/layout/PageShell'
import useAuth from '../../context/useAuth'
import useApplicationAnalytics from '../../hooks/useApplicationAnalytics'

// Keep analytics state separate for each authenticated account.
function AnalyticsPage() {
  const { user } = useAuth()
  return <AnalyticsContent key={user?.id} />
}

// Read-only: derived entirely from the applications table.
function AnalyticsContent() {
  const { summary, isLoading, loadError } = useApplicationAnalytics()
  const isReady = !isLoading && !loadError

  return (
    <PageShell>
      <header className="mb-6 flex flex-col gap-4 px-1 pt-2 sm:px-2 md:pt-7 lg:pt-9">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Hello, Stranger<span aria-hidden="true">✦</span>
          </h1>
          <p className="mt-1 text-base">Welcome to your job analytics</p>

          {isLoading && (
            <output className="mt-1 block text-xs text-brand-black/60">
              Loading your analytics…
            </output>
          )}
          {loadError && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              Couldn't load analytics. Try refreshing.
            </p>
          )}
        </div>
      </header>

      <img
        src={beaver}
        alt=""
        aria-hidden="true"
        className={`${BEAVER_POSITION} z-0`}
      />

      {isReady && summary.total === 0 && <AnalyticsEmptyState />}
      {isReady && summary.total > 0 && <AnalyticsDashboard summary={summary} />}

      <img
        src={beaverArms}
        alt=""
        aria-hidden="true"
        className={`${BEAVER_POSITION} z-20`}
      />
    </PageShell>
  )
}

export default AnalyticsPage
