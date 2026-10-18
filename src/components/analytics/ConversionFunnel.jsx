import ChartBar from './ChartBar'
import ChartPanel from './ChartPanel'
import { formatPercentage, toRate } from '../../lib/analytics'

// Bars are scaled against the first stage, so the widths narrow like a funnel.
function ConversionFunnel({ funnel }) {
  const [first] = funnel

  return (
    <ChartPanel
      title="Application funnel"
      description="How many sent applications reached each stage, including any that went further."
    >
      {first.count === 0 ? (
        <p className="text-sm">
          Move an application to Applied / Waiting to start your funnel.
        </p>
      ) : (
        <ol className="space-y-4">
          {funnel.map((stage, index) => {
            const previous = funnel[index - 1]
            const note = previous?.count
              ? `${formatPercentage(toRate(stage.count, previous.count))} of ${previous.title} reached this stage`
              : null

            return (
              <ChartBar
                key={stage.id}
                label={stage.title}
                value={stage.count}
                fraction={toRate(stage.count, first.count)}
                tone="bg-link"
                note={note}
              />
            )
          })}
        </ol>
      )}
    </ChartPanel>
  )
}

export default ConversionFunnel
