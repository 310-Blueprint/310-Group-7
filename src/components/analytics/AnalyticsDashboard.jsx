import ConversionFunnel from './ConversionFunnel'
import StageBreakdownChart from './StageBreakdownChart'
import StatCard from './StatCard'
import { formatPercentage } from '../../lib/analytics'

// "3 of 8" when there is something to convert from, otherwise a hint.
function describeConversion(reached, from, emptyHint) {
  return from > 0 ? `${reached} of ${from}` : emptyHint
}

function AnalyticsDashboard({ summary }) {
  const { total, sent, stages, funnel, conversions } = summary
  const [, interviewed, offered] = funnel.map((stage) => stage.count)

  return (
    <div className="relative z-10 flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Applications tracked"
          value={total}
          caption="Every card on your board"
          tone="bg-brand-blue"
        />
        <StatCard
          label="Applications sent"
          value={sent}
          caption="Moved past To apply"
          tone="bg-brand-pink"
        />
        <StatCard
          label="Applied → Interview"
          value={formatPercentage(conversions.appliedToInterview)}
          caption={describeConversion(
            interviewed,
            sent,
            'Send an application to see this'
          )}
          tone="bg-brand-green"
        />
        <StatCard
          label="Interview → Offer"
          value={formatPercentage(conversions.interviewToOffer)}
          caption={describeConversion(
            offered,
            interviewed,
            'Reach an interview to see this'
          )}
          tone="bg-brand-yellow"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <StageBreakdownChart stages={stages} />
        <ConversionFunnel funnel={funnel} />
      </div>
    </div>
  )
}

export default AnalyticsDashboard
