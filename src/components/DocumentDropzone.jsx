import { useState, useCallback } from 'react'
import addDocument from '../assets/addDocument.png'

function DocumentDropzone({ onFilesDropped }) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      setIsDragging(false)
      onFilesDropped(Array.from(e.dataTransfer.files))
    },
    [onFilesDropped],
  )

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`mt-4 flex flex-1 flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed transition ${
        isDragging ? 'border-brand-black/50 bg-input-bg/40' : 'border-brand-black/20'
      }`}
    >
      <img src={addDocument} alt="" className="size-32" />
      <p className="mt-4 text-3xl font-bold text-brand-black/25">
        Drop your documents here
      </p>
    </div>
  )
}

export default DocumentDropzone