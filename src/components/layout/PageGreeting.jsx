// Shared page heading used by the pages.
function PageGreeting({ description, children }) {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Hello, Busy Beaver <span aria-hidden="true">✦</span>
      </h1>
      <p className="mt-1 text-base">{description}</p>
      {children}
    </div>
  )
}

export default PageGreeting
