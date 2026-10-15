import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import DashboardPage from './DashboardPage'
import { fetchApplications, insertApplication } from '../../lib/applications'

// ---------------------------------------------------------------------------
// Mocks (only the boundaries + the heavy children)
// ---------------------------------------------------------------------------

// Lets each test decide what the FilterModal stub submits.
const filterMock = vi.hoisted(() => ({ submission: {} }))

const setFilterSubmission = (overrides = {}) => {
  filterMock.submission = {
    company: '',
    location: '',
    role: '',
    sortOrder: 'asc',
    ...overrides,
  }
}

vi.mock('../../context/useAuth', () => ({
  default: () => ({ user: { id: 'user-1' } }),
}))

vi.mock('../../lib/applications', () => ({
  fetchApplications: vi.fn(),
  insertApplication: vi.fn(),
  deleteApplication: vi.fn(),
  updateApplicationPositions: vi.fn(),
}))

vi.mock('../../components/layout/PageShell', () => ({
  default: ({ children }) => <div>{children}</div>,
  BEAVER_POSITION: 'beaver-position',
  PRIMARY_PILL_CLASSES: 'pill-classes',
}))

vi.mock('../../components/dashboard/NotificationPanel', () => ({
  default: ({ reminders = [], userId }) => (
    <section>
      <h2>Upcoming deadlines</h2>
      <div>
        {reminders.length} reminders for {userId}
      </div>
    </section>
  ),
}))

vi.mock('../../components/dashboard/StatusColumn', () => ({
  default: ({ title, applications }) => (
    <section aria-label={title}>
      <h2>{title}</h2>
      <span>{applications.length}</span>
      {applications.map((application) => (
        <div key={application.id}>{application.company}</div>
      ))}
    </section>
  ),
}))

vi.mock('../../components/dashboard/ApplicationModal', () => ({
  default: ({ isOpen, onClose, onSubmit }) =>
    isOpen ? (
      <div>
        <button
          type="button"
          onClick={() =>
            onSubmit({
              company: 'Valve Corporation',
              location: 'Washington, USA',
              role: 'Play Tester',
            })
          }
        >
          Save application
        </button>
        <button type="button" onClick={onClose}>
          Close modal
        </button>
      </div>
    ) : null,
}))

vi.mock('../../components/dashboard/FilterModal', () => ({
  default: ({ isOpen, onClose, onSubmit }) =>
    isOpen ? (
      <div>
        <button type="button" onClick={() => onSubmit(filterMock.submission)}>
          Apply filters
        </button>
        <button type="button" onClick={onClose}>
          Close filters
        </button>
      </div>
    ) : null,
}))

// ---------------------------------------------------------------------------
// Fixtures & helpers
// ---------------------------------------------------------------------------

const HOBBYCON = {
  id: 'job-1',
  company: 'Hobbycon',
  location: 'Auckland',
  role: 'Frontend Developer',
  dueDate: '2026-01-01',
  status: 'to_apply',
  position: 0,
}

const ARCANE = {
  id: 'job-2',
  company: 'Arcane Development',
  location: 'Auckland',
  role: 'Software Engineer',
  dueDate: '2026-01-02',
  status: 'applied',
  position: 0,
}

// Doubles as the row returned by insertApplication in the "add" tests.
const VALVE = {
  id: 'job-3',
  company: 'Valve Corporation',
  location: 'Washington, USA',
  role: 'Play Tester',
  dueDate: '2026-01-03',
  status: 'to_apply',
  position: 1,
}

const LOADING = /Loading your applications/i

function deferred() {
  let resolve
  let reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

const column = (name) => screen.getByRole('region', { name })

async function renderLoadedDashboard() {
  const user = userEvent.setup()
  render(<DashboardPage />)
  // The welcome heading is always rendered, so wait on the loading indicator instead.
  await waitFor(() =>
    expect(screen.queryByText(LOADING)).not.toBeInTheDocument()
  )
  return user
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Pin "today" so deadline logic can't drift as real time passes.
    // Only Date is faked, so promises, timeouts and userEvent keep working.
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2025-12-15T09:00:00Z'))

    setFilterSubmission({ company: 'Hobbycon' })

    fetchApplications.mockResolvedValue([HOBBYCON, ARCANE])
    insertApplication.mockResolvedValue(VALVE)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks() // undoes console spies; leaves vi.fn() mocks alone
  })

  describe('loading', () => {
    it('shows a loading state until the applications have been fetched', async () => {
      const pending = deferred()
      fetchApplications.mockReturnValueOnce(pending.promise)

      render(<DashboardPage />)

      expect(screen.getByText(LOADING)).toBeInTheDocument()

      pending.resolve([HOBBYCON, ARCANE])

      expect(await screen.findByText('Hobbycon')).toBeInTheDocument()
      expect(screen.queryByText(LOADING)).not.toBeInTheDocument()
    })

    it('fetches applications exactly once on mount', async () => {
      await renderLoadedDashboard()

      expect(fetchApplications).toHaveBeenCalledTimes(1)
    })

    it('stops loading and shows an error when fetching fails', async () => {
      fetchApplications.mockRejectedValueOnce(new Error('Network down'))
      // The page logs the error; silence it so the test output stays clean.
      vi.spyOn(console, 'error').mockImplementation(() => {})

      render(<DashboardPage />)

      expect(
        await screen.findByText(/couldn't load applications/i)
      ).toBeInTheDocument()
      expect(screen.queryByText(LOADING)).not.toBeInTheDocument()
    })
  })

  describe('columns', () => {
    it('places each application in the column matching its status', async () => {
      await renderLoadedDashboard()

      const toApply = within(column('To apply'))
      const applied = within(column('Applied / Waiting'))

      expect(toApply.getByText('Hobbycon')).toBeInTheDocument()
      expect(toApply.queryByText('Arcane Development')).not.toBeInTheDocument()

      expect(applied.getByText('Arcane Development')).toBeInTheDocument()
      expect(applied.queryByText('Hobbycon')).not.toBeInTheDocument()
    })

    it('renders empty columns when there are no applications', async () => {
      fetchApplications.mockResolvedValueOnce([])

      await renderLoadedDashboard()

      expect(within(column('To apply')).getByText('0')).toBeInTheDocument()
      expect(
        within(column('Applied / Waiting')).getByText('0')
      ).toBeInTheDocument()
    })
  })

  describe('filtering', () => {
    it.each([
      [
        'company',
        { company: 'Hobbycon' },
        'Hobbycon',
        ['Arcane Development', 'Valve Corporation'],
      ],
      [
        'location',
        { location: 'Washington, USA' },
        'Valve Corporation',
        ['Hobbycon', 'Arcane Development'],
      ],
      [
        'role',
        { role: 'Software Engineer' },
        'Arcane Development',
        ['Hobbycon', 'Valve Corporation'],
      ],
    ])(
      'filters by %s, keeping matches and hiding the rest',
      async (_field, filter, visible, hidden) => {
        fetchApplications.mockResolvedValue([HOBBYCON, ARCANE, VALVE])
        setFilterSubmission(filter)
        const user = await renderLoadedDashboard()

        await user.click(screen.getByLabelText(/open filters/i))
        await user.click(screen.getByRole('button', { name: 'Apply filters' }))

        await waitFor(() =>
          expect(screen.queryByText(hidden[0])).not.toBeInTheDocument()
        )
        expect(screen.getByText(visible)).toBeInTheDocument()
        hidden.forEach((name) =>
          expect(screen.queryByText(name)).not.toBeInTheDocument()
        )
      }
    )

    it('filters on the client without refetching', async () => {
      const user = await renderLoadedDashboard()

      await user.click(screen.getByLabelText(/open filters/i))
      await user.click(screen.getByRole('button', { name: 'Apply filters' }))

      await waitFor(() =>
        expect(screen.queryByText('Arcane Development')).not.toBeInTheDocument()
      )
      expect(fetchApplications).toHaveBeenCalledTimes(1)
    })

    it('closes the filter modal after applying a filter', async () => {
      const user = await renderLoadedDashboard()

      await user.click(screen.getByLabelText(/open filters/i))
      await user.click(screen.getByRole('button', { name: 'Apply filters' }))

      await waitFor(() =>
        expect(
          screen.queryByRole('button', { name: 'Apply filters' })
        ).not.toBeInTheDocument()
      )
    })

    it('leaves every application visible when the filter modal is dismissed', async () => {
      const user = await renderLoadedDashboard()

      await user.click(screen.getByLabelText(/open filters/i))
      await user.click(screen.getByRole('button', { name: 'Close filters' }))

      expect(
        screen.queryByRole('button', { name: 'Apply filters' })
      ).not.toBeInTheDocument()
      expect(screen.getByText('Hobbycon')).toBeInTheDocument()
      expect(screen.getByText('Arcane Development')).toBeInTheDocument()
    })
  })

  describe('adding an application', () => {
    it('inserts at the end of the "To apply" column and shows it there', async () => {
      const user = await renderLoadedDashboard()

      await user.click(screen.getByRole('button', { name: /add application/i }))
      await user.click(screen.getByRole('button', { name: 'Save application' }))

      await waitFor(() =>
        expect(
          within(column('To apply')).getByText('Valve Corporation')
        ).toBeInTheDocument()
      )

      expect(insertApplication).toHaveBeenCalledTimes(1)
      expect(insertApplication).toHaveBeenCalledWith({
        company: 'Valve Corporation',
        location: 'Washington, USA',
        role: 'Play Tester',
        status: 'to_apply',
        position: 1, // Hobbycon already occupies position 0
        userId: 'user-1',
      })
      expect(within(column('To apply')).getByText('2')).toBeInTheDocument()
    })

    it('uses position 0 when the "To apply" column is empty', async () => {
      fetchApplications.mockResolvedValueOnce([ARCANE])
      const user = await renderLoadedDashboard()

      await user.click(screen.getByRole('button', { name: /add application/i }))
      await user.click(screen.getByRole('button', { name: 'Save application' }))

      await waitFor(() => expect(insertApplication).toHaveBeenCalledTimes(1))
      expect(insertApplication).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'to_apply', position: 0 })
      )
    })

    it('closes the modal after a successful save', async () => {
      const user = await renderLoadedDashboard()

      await user.click(screen.getByRole('button', { name: /add application/i }))
      await user.click(screen.getByRole('button', { name: 'Save application' }))

      await waitFor(() =>
        expect(
          screen.queryByRole('button', { name: 'Save application' })
        ).not.toBeInTheDocument()
      )
    })

    it('does not insert anything when the modal is closed without saving', async () => {
      const user = await renderLoadedDashboard()

      await user.click(screen.getByRole('button', { name: /add application/i }))
      await user.click(screen.getByRole('button', { name: 'Close modal' }))

      expect(insertApplication).not.toHaveBeenCalled()
      expect(
        screen.queryByRole('button', { name: 'Save application' })
      ).not.toBeInTheDocument()
    })

    // NOTE: if the page doesn't catch the rejection, Vitest will report an
    // unhandled error here, which is a useful signal that it needs a try/catch.
    it('does not show the application when the insert fails', async () => {
      insertApplication.mockRejectedValueOnce(new Error('Insert failed'))
      const user = await renderLoadedDashboard()

      await user.click(screen.getByRole('button', { name: /add application/i }))
      await user.click(screen.getByRole('button', { name: 'Save application' }))

      await waitFor(() => expect(insertApplication).toHaveBeenCalledTimes(1))
      expect(screen.queryByText('Valve Corporation')).not.toBeInTheDocument()
      expect(within(column('To apply')).getByText('1')).toBeInTheDocument()
    })
  })

  describe('notifications', () => {
    it('passes the signed-in user id to the notification panel', async () => {
      await renderLoadedDashboard()

      expect(screen.getByText(/reminders for user-1/i)).toBeInTheDocument()
    })
  })

  // Not covered yet: the StatusColumn stub doesn't expose delete/drag handlers.
  // Extend the stub to render buttons wired to the page's callback props, then
  // fill these in.
  it.todo('deletes an application and removes it from its column')
  it.todo('shows an error and keeps the card when deleteApplication fails')
  it.todo(
    'persists new positions via updateApplicationPositions after a reorder'
  )
  it.todo('moves a card to another column and persists the new status')
})
