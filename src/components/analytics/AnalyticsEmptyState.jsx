import { Link } from 'react-router-dom'
import { PRIMARY_PILL_CLASSES } from '../layout/PageShell'

function AnalyticsEmptyState() {
  return (
    <section className="relative z-10 flex flex-1 flex-col items-center justify-center rounded-[1.35rem] bg-brand-blue px-6 py-12 text-center">
      <h2 className="text-xl font-bold sm:text-2xl">No analytics yet</h2>
      <p className="mt-2 max-w-md text-sm sm:text-base">
        Add some applications to see your analytics.
      </p>
      <Link
        to="/dashboard"
        className={`mt-6 transition hover:brightness-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-black ${PRIMARY_PILL_CLASSES}`}
      >
        Go to dashboard
      </Link>
    </section>
  )
}

export default AnalyticsEmptyState
