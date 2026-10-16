import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AnalyticsPage from './AnalyticsPage'
import { fetchApplications } from '../../lib/applications'

// ---------------------------------------------------------------------------
// Mocks (only the boundaries: auth, layout + the applications API)
// ---------------------------------------------------------------------------

const mocks = vi.hoisted(() => ({
  auth: { user: { id: 'user-1' } },
}))

vi.mock('../../context/useAuth', () => ({
  default: () => mocks.auth,
}))

vi.mock('../../lib/applications', () => ({
  fetchApplications: vi.fn(),
}))

vi.mock('../../components/layout/PageShell', () => ({
  default: ({ children }) => <div>{children}</div>,
  BEAVER_POSITION: 'beaver-position',
  PRIMARY_PILL_CLASSES: 'pill-classes',
}))

// ---------------------------------------------------------------------------
// Fixtures & helpers
// ---------------------------------------------------------------------------

const LOADING_MESSAGE = 'Loading your analytics…'
const ERROR_MESSAGE = "Couldn't load analytics. Try refreshing."

const apps = (status, count) =>
  Array.from({ length: count }, (_, index) => ({
    id: `${status}-${index}`,
    status,
  }))

// 9 tracked, 7 sent, 4 reached interview, 1 reached offer.
const MIXED = [
  ...apps('to_apply', 2),
  ...apps('applied', 2),
  ...apps('rejected', 1),
  ...apps('interview', 3),
  ...apps('offer', 1),
]

function deferred() {
  let resolve
  const promise = new Promise((res) => {
    resolve = res
  })
  return { promise, resolve }
}

const page = () => (
  <MemoryRouter>
    <AnalyticsPage />
  </MemoryRouter>
)

async function renderWithApplications(applications) {
  fetchApplications.mockResolvedValue(applications)
  const result = render(page())
  // The first stat card only appears once the dashboard has rendered.
  await screen.findByText('Applications tracked')
  return result
}

// StatCard renders label, value and caption as siblings in one card.
function statCard(label) {
  const card = screen.getByText(label).parentElement
  const [, value, caption] = card.querySelectorAll('p')
  return { value: value.textContent, caption: caption?.textContent }
}

// ChartBar renders the label and value spans inside one <li>.
function chartBar(panel, label) {
  const item = within(panel).getByText(label).closest('li')
  const [, value] = item.querySelectorAll('span')
  const note = item.querySelector('p')
  return { value: value.textContent, note: note?.textContent ?? null }
}

const stagePanel = () =>
  screen.getByRole('region', { name: 'Applications by stage' })
const funnelPanel = () =>
  screen.getByRole('region', { name: 'Application funnel' })

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AnalyticsPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mocks.auth = { user: { id: 'user-1' } }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('loading and empty states', () => {
    it('shows a loading status until applications resolve', async () => {
      const pending = deferred()
      fetchApplications.mockReturnValue(pending.promise)

      render(page())

      expect(screen.getByText(LOADING_MESSAGE)).toBeInTheDocument()
      expect(screen.queryByText('No analytics yet')).not.toBeInTheDocument()
      expect(screen.queryByText('Applications tracked')).not.toBeInTheDocument()

      pending.resolve([])

      expect(await screen.findByText('No analytics yet')).toBeInTheDocument()
      expect(screen.queryByText(LOADING_MESSAGE)).not.toBeInTheDocument()
    })

    it('shows an error and no dashboard when the fetch fails', async () => {
      fetchApplications.mockRejectedValue(new Error('Network down'))
      // The hook logs the error; silence it so the test output stays clean.
      vi.spyOn(console, 'error').mockImplementation(() => {})

      render(page())

      expect(await screen.findByRole('alert')).toHaveTextContent(ERROR_MESSAGE)
      expect(screen.queryByText(LOADING_MESSAGE)).not.toBeInTheDocument()
      expect(screen.queryByText('No analytics yet')).not.toBeInTheDocument()
      expect(screen.queryByText('Applications tracked')).not.toBeInTheDocument()
    })

    it('shows the empty state with a link to the dashboard', async () => {
      fetchApplications.mockResolvedValue([])

      render(page())

      expect(await screen.findByText('No analytics yet')).toBeInTheDocument()
      expect(
        screen.getByRole('link', { name: 'Go to dashboard' })
      ).toHaveAttribute('href', '/dashboard')
      expect(screen.queryByText('Applications tracked')).not.toBeInTheDocument()
    })
  })

  describe('stat cards', () => {
    it('shows totals and conversion rates with "x of y" captions', async () => {
      await renderWithApplications(MIXED)

      expect(statCard('Applications tracked')).toEqual({
        value: '9',
        caption: 'Every card on your board',
      })
      expect(statCard('Applications sent')).toEqual({
        value: '7',
        caption: 'Moved past To apply',
      })
      expect(statCard('Applied → Interview')).toEqual({
        value: '57%',
        caption: '4 of 7',
      })
      expect(statCard('Interview → Offer')).toEqual({
        value: '25%',
        caption: '1 of 4',
      })
    })

    it('shows dashes, hints and the funnel prompt when nothing has been sent', async () => {
      await renderWithApplications(apps('to_apply', 3))

      expect(statCard('Applications tracked').value).toBe('3')
      expect(statCard('Applications sent').value).toBe('0')
      expect(statCard('Applied → Interview')).toEqual({
        value: '—',
        caption: 'Send an application to see this',
      })
      expect(statCard('Interview → Offer')).toEqual({
        value: '—',
        caption: 'Reach an interview to see this',
      })

      const funnel = funnelPanel()
      expect(
        within(funnel).getByText(
          'Move an application to Applied / Waiting to start your funnel.'
        )
      ).toBeInTheDocument()
      expect(within(funnel).queryByRole('listitem')).not.toBeInTheDocument()
    })
  })

  describe('charts', () => {
    it('lists every board column with "count · share"', async () => {
      await renderWithApplications(MIXED)

      const panel = stagePanel()
      expect(within(panel).getAllByRole('listitem')).toHaveLength(4)
      expect(chartBar(panel, 'To apply').value).toBe('2 · 22%')
      expect(chartBar(panel, 'Applied / Waiting').value).toBe('2 · 22%')
      expect(chartBar(panel, 'Interview').value).toBe('3 · 33%')
      expect(chartBar(panel, 'Offer').value).toBe('1 · 11%')
    })

    it('shows a funnel bar per stage with a "% of previous stage" note', async () => {
      await renderWithApplications(MIXED)

      const panel = funnelPanel()
      const labels = within(panel)
        .getAllByRole('listitem')
        .map((item) => item.querySelector('span').textContent)
      expect(labels).toEqual(['Sent', 'Interview', 'Offer'])

      expect(chartBar(panel, 'Sent')).toEqual({ value: '7', note: null })
      expect(chartBar(panel, 'Interview')).toEqual({
        value: '4',
        note: '57% of Sent reached this stage',
      })
      expect(chartBar(panel, 'Offer')).toEqual({
        value: '1',
        note: '25% of Interview reached this stage',
      })
    })
  })

  describe('switching user', () => {
    it('refetches and never shows the previous user’s figures', async () => {
      const { rerender } = await renderWithApplications(MIXED)
      expect(statCard('Applications tracked').value).toBe('9')

      const pending = deferred()
      fetchApplications.mockReturnValue(pending.promise)
      mocks.auth = { user: { id: 'user-2' } }
      rerender(page())

      // While user-2 loads, user-1's dashboard must be gone.
      expect(screen.getByText(LOADING_MESSAGE)).toBeInTheDocument()
      expect(screen.queryByText('Applications tracked')).not.toBeInTheDocument()

      pending.resolve(apps('offer', 1))

      await screen.findByText('Applications tracked')
      expect(fetchApplications).toHaveBeenCalledTimes(2)
      expect(statCard('Applications tracked').value).toBe('1')
      expect(statCard('Interview → Offer').value).toBe('100%')
    })
  })
})
