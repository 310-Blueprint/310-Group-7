import Sidebar from './Sidebar'

// Shared by Dashboard and Documents — same silhouette, same spot, on both
// pages, so it lives here rather than being copy-pasted per page.
export const BEAVER_POSITION =
  'pointer-events-none absolute left-[35%] top-14 hidden w-31 xl:block'

// The "+ Add ___" pill in each page's header. Both call sites append their
// own width/interaction modifiers (a real <button> wants hover/focus states
// a <label> triggering a hidden input doesn't).
export const PRIMARY_PILL_CLASSES =
  'rounded-full bg-brand-black px-7 py-3.5 text-base text-white sm:px-9 sm:py-4'

// The page frame every authenticated route shares: full-height background,
// sidebar, and a content section. Header, decorations and body content are
// each page's own — only the wrapper is identical, so only the wrapper is shared.
function PageShell({ children }) {
  return (
    <main className="min-h-screen bg-brand-bg p-3 text-brand-black sm:p-4">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[100rem] flex-col gap-4 sm:min-h-[calc(100vh-2rem)] md:flex-row md:gap-5">
        <Sidebar />
        <section className="relative isolate flex min-w-0 flex-1 flex-col md:pl-2">
          {children}
        </section>
      </div>
    </main>
  )
}

export default PageShell
