import { useState, useCallback } from 'react'
import addDocument from '../assets/addDocument.png'

function DocumentDropzone({ onFilesDropped }) {
  const [isDragging, setIsDragging] = useState(false)

  const handleFilesSelected = useCallback(
    (e) => {
      onFilesDropped(Array.from(e.target.files))
      e.target.value = ''
    },
    [onFilesDropped],
  )

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer.files.length > 0) {
        onFilesDropped(Array.from(e.dataTransfer.files))
      }
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
      <input
        id="document-upload-input"
        type="file"
        multiple
        onChange={handleFilesSelected}
        className="sr-only"
      />
      <label
        htmlFor="document-upload-input"
        className="flex cursor-pointer flex-col items-center"
      >
        <img src={addDocument} alt="Choose documents to upload" className="size-32" />
        <span className="mt-4 text-center text-3xl font-bold text-brand-black/25">
          Drop your documents here
        </span>
        <span className="mt-2 text-base text-brand-black/50">or browse your laptop</span>
      </label>
    </div>
  )
}

export default DocumentDropzone