import { useEffect, useState } from 'react'
import beaver from '../assets/beaver.png'
import DocumentCard from '../components/DocumentCard'
import Dropzone from '../components/DocumentDropzone'
import Sidebar from '../components/Sidebar'
import { INITIAL_DOCUMENTS } from './documentsData'
import { supabase } from '../lib/supabaseClient'

const BEAVER_POSITION = 'pointer-events-none absolute left-[35%] top-14 hidden w-31 xl:block'

function DocumentsPage() {
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS)

  useEffect(() => {
    async function loadDocuments() {
      const { data, error } = await supabase.storage
        .from('documents')
        .list('', { sortBy: { column: 'name', order: 'asc' } })

      if (error) {
        console.error('Could not load documents:', error.message)
        return
      }

      const storedDocuments = data
        .filter((file) => file.name !== '.emptyFolderPlaceholder')
        .map((file) => {
          const { data: publicUrl } = supabase.storage
            .from('documents')
            .getPublicUrl(file.name)

          return {
            id: file.name,
            name: file.name.replace(/^\d+(?:-\d+)?-/, ''),
            url: publicUrl.publicUrl,
          }
        })

      setDocuments(storedDocuments)
    }

    loadDocuments()
  }, [])

  async function handleFilesDropped(files) {
    const uploadedDocs = []

    for (const [index, file] of files.entries()) {
      const filePath = `${Date.now()}-${index}-${file.name}`

      const { error } = await supabase.storage
        .from('documents')
        .upload(filePath, file)

      if (error) {
        console.error('Upload failed:', error.message)
        continue
      }

      const { data } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath)

      uploadedDocs.push({
        id: filePath,
        name: file.name,
        url: data.publicUrl,
      })
    }

    setDocuments((previous) => [...previous, ...uploadedDocs])
  }

  async function handleDeleteDocument(id) {
    const { error } = await supabase.storage.from('documents').remove([id])

    if (error) {
      console.error('Delete failed:', error.message)
      return
    }

    setDocuments((previous) => previous.filter((doc) => doc.id !== id))
  }

  return (
    <main className="min-h-screen bg-brand-bg p-3 text-brand-black sm:p-4">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[100rem] flex-col gap-4 sm:min-h-[calc(100vh-2rem)] md:flex-row md:gap-5">
        <Sidebar />

        <section className="relative isolate flex min-w-0 flex-1 flex-col md:pl-2">
          <header className="mb-6 flex flex-col gap-4 px-1 pt-2 sm:flex-row sm:items-start sm:justify-between sm:px-2 md:pt-7 lg:pt-9">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Hello, Stranger<span aria-hidden="true">✦</span>
              </h1>
              <p className="mt-1 text-base">Welcome to your documents archive</p>
            </div>
            <label
              htmlFor="document-upload-input"
              className="cursor-pointer rounded-full bg-brand-black px-7 py-3.5 text-base text-white sm:w-auto sm:px-9 sm:py-4"
            >
              + Add document
            </label>
          </header>

          <img src={beaver} alt="" aria-hidden="true" className={BEAVER_POSITION} />

          <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-4">
            <div className="rounded-[1.75rem] bg-brand-blue p-4 sm:rounded-[2.5rem] sm:p-6">
              <h2 className="mb-4 text-lg font-semibold">Documents</h2>
              <div className="flex flex-col gap-3">
                {documents.map((doc) => (
                  <DocumentCard key={doc.id} {...doc} onDelete={handleDeleteDocument} />
                ))}
              </div>
            </div>

            <Dropzone onFilesDropped={handleFilesDropped} />
          </div>
        </section>
      </div>
    </main>
  )
}

export default DocumentsPage