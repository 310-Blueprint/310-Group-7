import documentIcon from '../assets/fileAttachment.png'
import downloadIcon from '../assets/downloadDocument.png'

function DocumentCard({ name, url }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white px-5 py-4">
      <div className="flex items-center gap-3">
        <img src={documentIcon} alt="" className="size-8" />
        <span className="text-base font-semibold text-brand-black">{name}</span>
      </div>

      <a
        href={url}
        download
        className="text-brand-black/60 hover:text-brand-black"
        aria-label={`Download ${name}`}
      >
        <img src={downloadIcon} alt="" className="size-8" />
      </a>
    </div>
  );
}

export default DocumentCard