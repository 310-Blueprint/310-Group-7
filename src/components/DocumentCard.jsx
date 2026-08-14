function DocumentCard({ name, url }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white px-5 py-4">
      <div className="flex items-center gap-3">
        <span className="grid size-8 place-items-center rounded-lg bg-input-bg text-brand-black/60">
          📄
        </span>
        <span className="text-base font-semibold text-brand-black">{name}</span>
      </div>

      <a
        href={url}
        download
        className="text-brand-black/60 hover:text-brand-black"
        aria-label={`Download ${name}`}
      >
        ⬇
      </a>
    </div>
  );
}

export default DocumentCard