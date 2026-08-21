import documentIcon from '../assets/fileAttachment.png'
import downloadIcon from '../assets/downloadDocument.png'

function DocumentCard({ name, url }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 sm:px-5 sm:py-4">
      <div className="flex min-w-0 items-center gap-3">
        <img src={documentIcon} alt="" className="size-7 shrink-0 sm:size-8" />
        <span className="truncate text-sm font-semibold text-brand-black sm:text-base">{name}</span>
      </div>

      <a
        href={url}
        download
        className="shrink-0 text-brand-black/60 hover:text-brand-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-black"
        aria-label={`Download ${name}`}
      >
        <img src={downloadIcon} alt="" className="size-7 sm:size-8" />
      </a>
    </div>
  )
}

export default DocumentCard
