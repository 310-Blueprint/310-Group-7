import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import DocumentsPage from './DocumentsPage'

const USER_ID = 'user-123'
const STORED_UUID = '123e4567-e89b-12d3-a456-426614174000'

const auth = vi.hoisted(() => ({
  user: { id: 'user-123' },
}))

const storage = vi.hoisted(() => ({
  from: vi.fn(),
  list: vi.fn(),
  createSignedUrls: vi.fn(),
  upload: vi.fn(),
  createSignedUrl: vi.fn(),
  remove: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock('../context/useAuth', () => ({
  default: () => ({ user: auth.user }),
}))

vi.mock('../components/PageShell', () => ({
  default: ({ children }) => <main>{children}</main>,
  BEAVER_POSITION: '',
  PRIMARY_PILL_CLASSES: '',
}))

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: { signOut: storage.signOut },
    storage: { from: storage.from },
  },
}))

function renderDocuments() {
  return render(
    <MemoryRouter initialEntries={['/documents']}>
      <DocumentsPage />
    </MemoryRouter>
  )
}

function storedFile(name) {
  return { name: `${STORED_UUID}-${name}` }
}

function silenceExpectedErrorLog() {
  vi.spyOn(console, 'error').mockImplementation(() => {})
}

describe('DocumentsPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    Object.values(storage).forEach((mock) => mock.mockReset())

    storage.from.mockReturnValue({
      list: storage.list,
      createSignedUrls: storage.createSignedUrls,
      upload: storage.upload,
      createSignedUrl: storage.createSignedUrl,
      remove: storage.remove,
    })
    storage.list.mockResolvedValue({ data: [], error: null })
    storage.upload.mockResolvedValue({ error: null })
    storage.createSignedUrl.mockResolvedValue({
      data: { signedUrl: 'https://files.example/download' },
      error: null,
    })
    storage.remove.mockResolvedValue({ error: null })

    vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue(STORED_UUID)
  })

  it('shows a loading state and then the empty state', async () => {
    let finishLoading
    storage.list.mockReturnValue(
      new Promise((resolve) => {
        finishLoading = resolve
      })
    )
    renderDocuments()

    expect(screen.getByText(/loading your documents/i)).toBeInTheDocument()

    finishLoading({ data: [], error: null })

    expect(await screen.findByText(/no documents yet/i)).toBeInTheDocument()
    expect(storage.from).toHaveBeenCalledWith('documents')
    expect(storage.list).toHaveBeenCalledWith(USER_ID, {
      sortBy: { column: 'name', order: 'asc' },
    })
  })

  it('loads only real files, strips stored UUIDs, and matches signed URLs by path', async () => {
    const cv = storedFile('cv.pdf')
    const transcript = storedFile('2024-transcript.pdf')
    storage.list.mockResolvedValue({
      data: [{ name: '.emptyFolderPlaceholder' }, cv, transcript],
      error: null,
    })
    storage.createSignedUrls.mockResolvedValue({
      data: [
        {
          path: `${USER_ID}/${transcript.name}`,
          signedUrl: 'https://files.example/transcript',
        },
        {
          path: `${USER_ID}/${cv.name}`,
          signedUrl: 'https://files.example/cv',
        },
      ],
      error: null,
    })
    renderDocuments()

    const cvLink = await screen.findByRole('link', { name: 'Download cv.pdf' })
    const transcriptLink = screen.getByRole('link', {
      name: 'Download 2024-transcript.pdf',
    })

    expect(cvLink).toHaveAttribute('href', 'https://files.example/cv')
    expect(cvLink).toHaveAttribute('download')
    expect(transcriptLink).toHaveAttribute(
      'href',
      'https://files.example/transcript'
    )
    expect(storage.createSignedUrls).toHaveBeenCalledWith(
      [`${USER_ID}/${cv.name}`, `${USER_ID}/${transcript.name}`],
      3600,
      { download: true }
    )
    expect(
      screen.queryByText('.emptyFolderPlaceholder')
    ).not.toBeInTheDocument()
  })

  it('shows an error when the document list cannot be loaded', async () => {
    silenceExpectedErrorLog()
    storage.list.mockResolvedValue({
      data: null,
      error: { message: 'Storage unavailable' },
    })
    renderDocuments()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not load your documents. Try refreshing.'
    )
    expect(storage.createSignedUrls).not.toHaveBeenCalled()
  })

  it('shows an error when download links cannot be created', async () => {
    silenceExpectedErrorLog()
    storage.list.mockResolvedValue({
      data: [storedFile('cv.pdf')],
      error: null,
    })
    storage.createSignedUrls.mockResolvedValue({
      data: null,
      error: { message: 'Signing failed' },
    })
    renderDocuments()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not load your documents. Try refreshing.'
    )
  })

  it('uploads a selected file into the signed-in user folder', async () => {
    const user = userEvent.setup()
    const file = new File(['resume'], 'resume.pdf', {
      type: 'application/pdf',
    })
    renderDocuments()
    await screen.findByText(/no documents yet/i)

    const input = document.querySelector('#document-upload-input')
    await user.upload(input, file)

    const expectedPath = `${USER_ID}/${STORED_UUID}-resume.pdf`
    expect(storage.upload).toHaveBeenCalledWith(expectedPath, file)
    expect(storage.createSignedUrl).toHaveBeenCalledWith(expectedPath, 3600, {
      download: true,
    })
    expect(
      await screen.findByRole('link', { name: 'Download resume.pdf' })
    ).toHaveAttribute('href', 'https://files.example/download')
    expect(input).toHaveValue('')
  })

  it('uploads a document dropped onto the dropzone', async () => {
    const file = new File(['cover letter'], 'cover-letter.pdf', {
      type: 'application/pdf',
    })
    renderDocuments()
    await screen.findByText(/no documents yet/i)

    const dropzone = screen
      .getByText(/drop your documents here/i)
      .closest('div')
    fireEvent.drop(dropzone, { dataTransfer: { files: [file] } })

    const expectedPath = `${USER_ID}/${STORED_UUID}-cover-letter.pdf`
    await waitFor(() => {
      expect(storage.upload).toHaveBeenCalledWith(expectedPath, file)
    })
    expect(
      await screen.findByRole('link', { name: 'Download cover-letter.pdf' })
    ).toBeInTheDocument()
  })

  it('rejects a file refused by storage while keeping successful uploads visible', async () => {
    silenceExpectedErrorLog()
    storage.upload
      .mockResolvedValueOnce({ error: { message: 'File type not allowed' } })
      .mockResolvedValueOnce({ error: null })
    const user = userEvent.setup()
    const failedFile = new File(['bad'], 'bad.pdf', {
      type: 'application/pdf',
    })
    const successfulFile = new File(['good'], 'good.pdf', {
      type: 'application/pdf',
    })
    renderDocuments()
    await screen.findByText(/no documents yet/i)

    await user.upload(document.querySelector('#document-upload-input'), [
      failedFile,
      successfulFile,
    ])

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not upload bad.pdf.'
    )
    expect(
      screen.getByRole('link', { name: 'Download good.pdf' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Download bad.pdf' })
    ).not.toBeInTheDocument()
  })

  it('reports a file as failed when its download link cannot be created', async () => {
    silenceExpectedErrorLog()
    storage.createSignedUrl.mockResolvedValue({
      data: null,
      error: { message: 'Signing failed' },
    })
    const user = userEvent.setup()
    const file = new File(['resume'], 'resume.pdf', {
      type: 'application/pdf',
    })
    renderDocuments()
    await screen.findByText(/no documents yet/i)

    await user.upload(document.querySelector('#document-upload-input'), file)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not upload resume.pdf.'
    )
    expect(
      screen.queryByRole('link', { name: 'Download resume.pdf' })
    ).not.toBeInTheDocument()
  })

  it('deletes a stored document only after storage confirms success', async () => {
    const file = storedFile('cv.pdf')
    const path = `${USER_ID}/${file.name}`
    storage.list.mockResolvedValue({ data: [file], error: null })
    storage.createSignedUrls.mockResolvedValue({
      data: [{ path, signedUrl: 'https://files.example/cv' }],
      error: null,
    })
    const user = userEvent.setup()
    renderDocuments()

    await user.click(
      await screen.findByRole('button', { name: 'Delete cv.pdf' })
    )

    expect(storage.remove).toHaveBeenCalledWith([path])
    await waitFor(() => {
      expect(screen.queryByText('cv.pdf')).not.toBeInTheDocument()
    })
  })

  it('keeps a document visible and shows an error when deletion fails', async () => {
    silenceExpectedErrorLog()
    const file = storedFile('cv.pdf')
    const path = `${USER_ID}/${file.name}`
    storage.list.mockResolvedValue({ data: [file], error: null })
    storage.createSignedUrls.mockResolvedValue({
      data: [{ path, signedUrl: 'https://files.example/cv' }],
      error: null,
    })
    storage.remove.mockResolvedValue({
      error: { message: 'Delete failed' },
    })
    const user = userEvent.setup()
    renderDocuments()

    await user.click(
      await screen.findByRole('button', { name: 'Delete cv.pdf' })
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not delete that document.'
    )
    expect(screen.getByText('cv.pdf')).toBeInTheDocument()
  })
})
