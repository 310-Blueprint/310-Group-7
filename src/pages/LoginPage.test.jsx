import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import LoginPage from './LoginPage'

const { signInWithPassword } = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
}))

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: { signInWithPassword },
  },
}))

function renderLogin(state) {
  const router = createMemoryRouter(
    [
      { path: '/', element: <LoginPage /> },
      { path: '/dashboard', element: <h1>Dashboard</h1> },
      { path: '/documents', element: <h1>Documents</h1> },
    ],
    { initialEntries: [{ pathname: '/', state }] }
  )

  return { router, ...render(<RouterProvider router={router} />) }
}

async function enterCredentials(user) {
  await user.type(
    screen.getByLabelText(/email address/i),
    'student@example.com'
  )
  await user.type(screen.getByLabelText(/password/i), 'correct-password')
}

describe('LoginPage', () => {
  beforeEach(() => {
    signInWithPassword.mockReset()
  })

  it('renders the login fields and supporting links', () => {
    renderLogin()

    expect(screen.getByRole('heading', { name: 'LOGIN' })).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toHaveAttribute(
      'autocomplete',
      'email'
    )
    expect(screen.getByLabelText(/password/i)).toHaveAttribute(
      'autocomplete',
      'current-password'
    )
    expect(
      screen.getByRole('link', { name: /forgot password/i })
    ).toHaveAttribute('href', '/forgot-password')
    expect(
      screen.getByRole('link', { name: /create account/i })
    ).toHaveAttribute('href', '/signup')
  })

  it('signs in with the entered credentials and opens the dashboard', async () => {
    signInWithPassword.mockResolvedValue({ error: null })
    const user = userEvent.setup()
    const { router } = renderLogin()

    await enterCredentials(user)
    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: 'student@example.com',
      password: 'correct-password',
    })
    expect(
      await screen.findByRole('heading', { name: 'Dashboard' })
    ).toBeInTheDocument()
    expect(router.state.historyAction).toBe('REPLACE')
  })

  it('returns the user to the protected page they originally requested', async () => {
    signInWithPassword.mockResolvedValue({ error: null })
    const user = userEvent.setup()
    renderLogin({ from: { pathname: '/documents' } })

    await enterCredentials(user)
    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(
      await screen.findByRole('heading', { name: 'Documents' })
    ).toBeInTheDocument()
  })

  it('shows the Supabase error and stays on the form when login fails', async () => {
    signInWithPassword.mockResolvedValue({
      error: { message: 'Invalid login credentials' },
    })
    const user = userEvent.setup()
    renderLogin()

    await enterCredentials(user)
    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Invalid login credentials'
    )
    expect(screen.getByRole('button', { name: /log in/i })).toBeEnabled()
  })

  it('disables the button while the login request is pending', async () => {
    let finishLogin
    signInWithPassword.mockReturnValue(
      new Promise((resolve) => {
        finishLogin = resolve
      })
    )
    const user = userEvent.setup()
    renderLogin()

    await enterCredentials(user)
    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: /logging in/i }))
    expect(signInWithPassword).toHaveBeenCalledTimes(1)

    finishLogin({ error: null })
    expect(
      await screen.findByRole('heading', { name: 'Dashboard' })
    ).toBeInTheDocument()
  })

  it('confirms a successful password reset until a login error replaces it', async () => {
    signInWithPassword.mockResolvedValue({
      error: { message: 'Invalid login credentials' },
    })
    const user = userEvent.setup()
    renderLogin({ passwordUpdated: true })

    expect(screen.getByRole('status')).toHaveTextContent(
      'Password updated. Log in with your new password.'
    )

    await enterCredentials(user)
    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Invalid login credentials'
    )
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('clears an old error and allows the user to retry', async () => {
    let finishRetry
    signInWithPassword
      .mockResolvedValueOnce({
        error: { message: 'Invalid login credentials' },
      })
      .mockReturnValueOnce(
        new Promise((resolve) => {
          finishRetry = resolve
        })
      )
    const user = userEvent.setup()
    renderLogin()

    await enterCredentials(user)
    await user.click(screen.getByRole('button', { name: /log in/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Invalid login credentials'
    )

    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(signInWithPassword).toHaveBeenCalledTimes(2)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled()

    finishRetry({ error: null })
    expect(
      await screen.findByRole('heading', { name: 'Dashboard' })
    ).toBeInTheDocument()
  })

  it('does not contact Supabase while required fields are empty', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(signInWithPassword).not.toHaveBeenCalled()
  })
})
