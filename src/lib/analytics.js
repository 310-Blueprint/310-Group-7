const STAGE_RANK = {
  to_apply: 0,
  applied: 1,
  rejected: 1,
  interview: 2,
  offer: 3,
}

// Funnel on page, counts applications that have *reached* each stage,
// NOT the number of applications currently in that stage.
export const FUNNEL_STAGES = [
  { id: 'applied', title: 'Sent' },
  { id: 'interview', title: 'Interview' },
  { id: 'offer', title: 'Offer' },
]

function rankOf(status) {
  return STAGE_RANK[status] ?? 0
}

export function countReached(applications, status) {
  const target = rankOf(status)
  return applications.filter(
    (application) => rankOf(application.status) >= target
  ).length
}

// NULL required to avoid displaying 0% for stages without any applications.
export function toRate(numerator, denominator) {
  return denominator > 0 ? numerator / denominator : null
}

export function formatPercentage(rate) {
  return rate === null ? '—' : `${Math.round(rate * 100)}%`
}

export function countByStage(applications, columns) {
  return columns.map((column) => {
    const count = applications.filter(
      (application) => application.status === column.id
    ).length

    return {
      id: column.id,
      title: column.title,
      tone: column.tone,
      count,
      share: toRate(count, applications.length),
    }
  })
}

export function buildFunnel(applications) {
  return FUNNEL_STAGES.map((stage) => ({
    ...stage,
    count: countReached(applications, stage.id),
  }))
}

export function buildAnalyticsSummary(applications, columns) {
  const funnel = buildFunnel(applications)
  const [sent, interviewed, offered] = funnel.map((stage) => stage.count)

  return {
    total: applications.length,
    sent,
    stages: countByStage(applications, columns),
    funnel,
    conversions: {
      appliedToInterview: toRate(interviewed, sent),
      interviewToOffer: toRate(offered, interviewed),
    },
  }
}
