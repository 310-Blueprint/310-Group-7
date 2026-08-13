import { Link } from 'react-router-dom'
import AuthCard from '../components/AuthCard'
import Button from '../components/AuthButton'
import Field from '../components/Field'

function ForgotPasswordPage() {
  function handleSubmit(event) {
    // TODO: put supabase.auth.resetPasswordForEmail() here.
    event.preventDefault()
  }

  return (
    <AuthCard title="RESET">
      <p className="mb-5">
        Enter the email address on your account and we&apos;ll send you a link
        to set a new password.
      </p>

      <form onSubmit={handleSubmit}>
        <Field
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="Enter your email address"
          className="mb-5"
        />

        <Button className="mx-20 mb-5">Send reset link</Button>
      </form>

      <div className="flex justify-center gap-1">
        <p>Remembered it?</p>
        <Link className="text-link underline mb-5" to="/">
          Back to log in
        </Link>
      </div>
    </AuthCard>
  )
}

export default ForgotPasswordPage
