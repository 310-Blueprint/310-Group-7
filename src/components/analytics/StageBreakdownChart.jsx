import ChartBar from './ChartBar'
import ChartPanel from './ChartPanel'
import { formatPercentage } from '../../lib/analytics'

function StageBreakdownChart({ stages }) {
  return (
    <ChartPanel
      title="Applications by stage"
      description="Where each tracked application sits on your board right now."
    >
      <ul className="space-y-4">
        {stages.map((stage) => (
          <ChartBar
            key={stage.id}
            label={stage.title}
            value={`${stage.count} · ${formatPercentage(stage.share)}`}
            fraction={stage.share}
            tone={stage.tone}
          />
        ))}
      </ul>
    </ChartPanel>
  )
}

export default StageBreakdownChart
