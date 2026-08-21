import { useEffect, useState } from 'react'
import beaver from '../assets/beaver.png'
import DocumentCard from '../components/DocumentCard'
import Dropzone from '../components/DocumentDropzone'
import Sidebar from '../components/Sidebar'
import { INITIAL_DOCUMENTS } from './documentsData'
import { supabase } from '../lib/supabaseClient'

const BEAVER_POSITION = 'pointer-events-none absolute left-[35%] top-14 w-31'

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
            id: file.id ?? file.name,
            name: file.name.replace(/^\d+-/, ''),
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
      const filePath = `${Date.now()}-${file.name}`
  
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

  return (
    <main className="h-screen min-w-[75rem] overflow-hidden bg-brand-bg p-4 text-brand-black">
      <div className="mx-auto flex h-full max-w-[100rem] gap-5">
        <Sidebar />

        <section className="relative isolate flex min-w-0 flex-1 flex-col pl-2">
          <header className="mb-7 flex items-start justify-between px-2 pt-9">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">
                Hello, Stranger<span aria-hidden="true">✦</span>
              </h1>
              <p className="mt-1 text-base">Welcome to your documents archive</p>
            </div>
            <label
              htmlFor="document-upload-input"
              className="cursor-pointer rounded-full bg-brand-black px-9 py-4 text-base text-white"
            >
              + Add document
            </label>
          </header>

          <img src={beaver} alt="" aria-hidden="true" className={BEAVER_POSITION} />

          <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-4">
            <div className="rounded-[2.5rem] bg-brand-blue p-6">
              <h2 className="mb-4 text-lg font-semibold">Documents</h2>
              <div className="flex flex-col gap-3">
                {documents.map((doc) => (
                  <DocumentCard key={doc.id} {...doc} />
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