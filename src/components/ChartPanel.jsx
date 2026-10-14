import { useId } from 'react'

function ChartPanel({ title, description, children }) {
  const headingId = useId()

  return (
    <section aria-labelledby={headingId} className="rounded-[1.35rem] bg-white p-4 sm:p-6">
      <h2 id={headingId} className="text-lg font-bold">
        {title}
      </h2>
      {description && <p className="mt-1 text-sm text-brand-black/70">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  )
}

export default ChartPanel
