import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import DocumentsPage from './DocumentsPage'

// ---------------------------------------------------------------------------
// Mocks (only the boundaries: auth + Supabase storage)
// ---------------------------------------------------------------------------

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  list: vi.fn(),
  createSignedUrls: vi.fn(),
  createSignedUrl: vi.fn(),
  upload: vi.fn(),
  remove: vi.fn(),
  // Stable reference: returning a fresh { id } object on every render can make
  // effects that depend on `user` re-run and refetch.
  auth: { user: { id: 'user-123' } },
}))

vi.mock('../../context/useAuth', () => ({
  default: () => mocks.auth,
}))

vi.mock('../../components/layout/PageShell', () => ({
  default: ({ children }) => <div>{children}</div>,
  BEAVER_POSITION: 'beaver-position',
  PRIMARY_PILL_CLASSES: 'pill-classes',
}))

vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    storage: {
      from: mocks.from,
    },
  },
}))

// ---------------------------------------------------------------------------
// Fixtures & helpers
// ---------------------------------------------------------------------------

const USER_ID = 'user-123'
const UPLOAD_UUID = '123e4567-e89b-12d3-a456-426614174000' // crypto.randomUUID()
const UUID_A = '123e4567-e89b-12d3-a456-426614174000'
const UUID_B = '123e4567-e89b-12d3-a456-426614174001'

const EMPTY_MESSAGE = 'No documents yet — drop a file below to get started.'
const LOADING_MESSAGE = 'Loading your documents…'

const storedName = (uuid, name) => `${uuid}-${name}`
const storagePath = (uuid, name) => `${USER_ID}/${storedName(uuid, name)}`

// A tiny in-memory bucket. Every storage mock reads/writes it, so the page sees
// consistent data no matter how many times it lists, uploads or removes.
let bucket = []

function seedDocuments(docs) {
  bucket = docs.map(({ uuid, name }) => storedName(uuid, name))
}

function deferred() {
  let resolve
  const promise = new Promise((res) => {
    resolve = res
  })
  return { promise, resolve }
}

// The input is labelled only by a sibling <label for=...>, so query by id.
const getUploadInput = () => document.querySelector('#document-upload-input')

async function renderPage() {
  const user = userEvent.setup()
  render(<DocumentsPage />)
  await waitFor(() =>
    expect(screen.queryByText(LOADING_MESSAGE)).not.toBeInTheDocument()
  )
  return user
}

const deleteButton = (name) =>
  screen.findByRole('button', {
    name: new RegExp(`delete ${name.replace('.', '\\.')}`, 'i'),
  })

const makePdf = (name) =>
  new File(['content'], name, { type: 'application/pdf' })

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DocumentsPage', () => {
  beforeEach(() => {
    vi.resetAllMocks() // also clears any leftover mockXOnce queues
    vi.stubGlobal('crypto', { randomUUID: () => UPLOAD_UUID })
    bucket = []

    mocks.from.mockReturnValue({
      list: mocks.list,
      createSignedUrls: mocks.createSignedUrls,
      createSignedUrl: mocks.createSignedUrl,
      upload: mocks.upload,
      remove: mocks.remove,
    })

    mocks.list.mockImplementation(async () => ({
      data: bucket.map((name) => ({ name })),
      error: null,
    }))
    mocks.createSignedUrls.mockImplementation(async (paths) => ({
      data: paths.map((path) => ({
        path,
        signedUrl: `https://signed.example/${path.split('/').pop()}`,
      })),
      error: null,
    }))
    mocks.createSignedUrl.mockResolvedValue({
      data: { signedUrl: 'https://signed.example/uploaded.pdf' },
      error: null,
    })
    mocks.upload.mockImplementation(async (path) => {
      bucket.push(path.split('/').pop())
      return { error: null }
    })
    mocks.remove.mockImplementation(async (paths) => {
      bucket = bucket.filter((name) => !paths.includes(`${USER_ID}/${name}`))
      return { error: null }
    })
  })

  afterEach(() => {
    // Without this, the crypto stub leaks into other test files in the same worker.
    vi.unstubAllGlobals()
    vi.restoreAllMocks() // undoes console spies; leaves vi.fn() mocks alone
  })

  describe('loading documents', () => {
    it('shows a loading status until the document list resolves', async () => {
      const pending = deferred()
      mocks.list.mockReturnValue(pending.promise)

      render(<DocumentsPage />)

      expect(screen.getByText(LOADING_MESSAGE)).toBeInTheDocument()

      pending.resolve({ data: [], error: null })

      expect(await screen.findByText(EMPTY_MESSAGE)).toBeInTheDocument()
      expect(screen.queryByText(LOADING_MESSAGE)).not.toBeInTheDocument()
    })

    it('lists the current user’s documents with the UUID prefix stripped', async () => {
      seedDocuments([
        { uuid: UUID_A, name: 'cover-letter.pdf' },
        { uuid: UUID_B, name: 'resume.pdf' },
      ])

      render(<DocumentsPage />)

      expect(await screen.findByText('cover-letter.pdf')).toBeInTheDocument()
      expect(screen.getByText('resume.pdf')).toBeInTheDocument()

      // The raw storage names must not leak into the UI.
      expect(screen.queryByText(new RegExp(UUID_A))).not.toBeInTheDocument()
      expect(screen.queryByText(new RegExp(UUID_B))).not.toBeInTheDocument()

      expect(mocks.list).toHaveBeenCalledWith(USER_ID, {
        sortBy: { column: 'name', order: 'asc' },
      })
      expect(mocks.createSignedUrls).toHaveBeenCalledWith(
        [
          storagePath(UUID_A, 'cover-letter.pdf'),
          storagePath(UUID_B, 'resume.pdf'),
        ],
        3600,
        { download: true }
      )
    })

    it('shows the empty state and ignores the folder placeholder file', async () => {
      bucket = ['.emptyFolderPlaceholder']

      render(<DocumentsPage />)

      expect(await screen.findByText(EMPTY_MESSAGE)).toBeInTheDocument()
      expect(
        screen.queryByText('.emptyFolderPlaceholder')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /delete /i })
      ).not.toBeInTheDocument()
    })

    it('stops loading and shows an error when the list request fails', async () => {
      mocks.list.mockResolvedValue({
        data: null,
        error: { message: 'Storage unavailable' },
      })
      // The page logs the error; silence it so the test output stays clean.
      vi.spyOn(console, 'error').mockImplementation(() => {})

      render(<DocumentsPage />)

      // The page currently only logs the error. Once it renders an error
      // message, assert on that here; for now, loading must at least end.
      await waitFor(() =>
        expect(screen.queryByText(LOADING_MESSAGE)).not.toBeInTheDocument()
      )
    })
  })

  describe('uploading', () => {
    it('uploads under the user’s folder with a UUID prefix and lists the file', async () => {
      const user = await renderPage()
      expect(await screen.findByText(EMPTY_MESSAGE)).toBeInTheDocument()

      const file = makePdf('resume.pdf')
      await user.upload(getUploadInput(), file)

      expect(await screen.findByText('resume.pdf')).toBeInTheDocument()

      const expectedPath = storagePath(UPLOAD_UUID, 'resume.pdf')
      expect(mocks.upload).toHaveBeenCalledTimes(1)
      expect(mocks.upload).toHaveBeenCalledWith(expectedPath, file)
      expect(mocks.createSignedUrl.mock.calls[0][0]).toBe(expectedPath)
      expect(screen.queryByText(EMPTY_MESSAGE)).not.toBeInTheDocument()
    })

    it('keeps existing documents in the list after an upload', async () => {
      seedDocuments([{ uuid: UUID_B, name: 'cv.pdf' }])
      const user = await renderPage()
      await screen.findByText('cv.pdf')

      await user.upload(getUploadInput(), makePdf('resume.pdf'))

      expect(await screen.findByText('resume.pdf')).toBeInTheDocument()
      expect(screen.getByText('cv.pdf')).toBeInTheDocument()
    })

    it('does not list the file or request a download link when the upload fails', async () => {
      mocks.upload.mockResolvedValueOnce({
        error: { message: 'Upload failed' },
      })
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const user = await renderPage()
      await screen.findByText(EMPTY_MESSAGE)

      await user.upload(getUploadInput(), makePdf('resume.pdf'))

      await waitFor(() => expect(mocks.upload).toHaveBeenCalledTimes(1))
      expect(screen.queryByText('resume.pdf')).not.toBeInTheDocument()
      expect(mocks.createSignedUrl).not.toHaveBeenCalled()
      expect(screen.getByText(EMPTY_MESSAGE)).toBeInTheDocument()
    })
  })

  describe('deleting', () => {
    it('removes only the chosen document from storage and from the list', async () => {
      seedDocuments([
        { uuid: UUID_A, name: 'cv.pdf' },
        { uuid: UUID_B, name: 'resume.pdf' },
      ])
      const user = await renderPage()

      await user.click(await deleteButton('cv.pdf'))

      await waitFor(() =>
        expect(screen.queryByText('cv.pdf')).not.toBeInTheDocument()
      )
      expect(mocks.remove).toHaveBeenCalledTimes(1)
      expect(mocks.remove).toHaveBeenCalledWith([storagePath(UUID_A, 'cv.pdf')])
      expect(screen.getByText('resume.pdf')).toBeInTheDocument()
    })

    it('shows the empty state after the last document is deleted', async () => {
      seedDocuments([{ uuid: UUID_A, name: 'cv.pdf' }])
      const user = await renderPage()

      await user.click(await deleteButton('cv.pdf'))

      expect(await screen.findByText(EMPTY_MESSAGE)).toBeInTheDocument()
    })

    // If the page removes the item optimistically without rolling back,
    // this test will fail, which is the bug it exists to catch.
    it('keeps the document listed when the delete fails', async () => {
      mocks.remove.mockResolvedValueOnce({
        error: { message: 'Delete failed' },
      })
      vi.spyOn(console, 'error').mockImplementation(() => {})
      seedDocuments([{ uuid: UUID_A, name: 'cv.pdf' }])
      const user = await renderPage()

      await user.click(await deleteButton('cv.pdf'))

      await waitFor(() => expect(mocks.remove).toHaveBeenCalledTimes(1))
      expect(screen.getByText('cv.pdf')).toBeInTheDocument()
    })
  })
})
