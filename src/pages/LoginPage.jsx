import { Link } from 'react-router-dom'
import AuthButton from '../components/AuthButton'
import AuthCard from '../components/AuthCard'
import AuthFooter from '../components/AuthFooter'
import Field from '../components/Field'

function LoginPage() {
  function handleSubmit(event) {
    // Stops the browser doing a full page reload on submit.
    // Supabase sign-in goes here later.
    event.preventDefault()
  }

  return (
    <AuthCard title="LOGIN">
      <form onSubmit={handleSubmit}>
        <Field
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="Enter your email address"
          className="mb-5"
        />

        <Field
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          className="mb-2"
        />

        <div className="flex justify-end w-full">
          <Link className="text-link underline mb-5" to="/forgot-password">
            Forgot password?
          </Link>
        </div>

        <AuthButton>Log In</AuthButton>
      </form>

      <AuthFooter
        prompt="Don't have an account?"
        linkText="Create account"
        to="/signup"
      />
    </AuthCard>
  )
}

export default LoginPage
