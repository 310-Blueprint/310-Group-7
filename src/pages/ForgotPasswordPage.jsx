import AuthButton from '../components/AuthButton'
import AuthCard from '../components/AuthCard'
import AuthFooter from '../components/AuthFooter'
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

        <AuthButton>Send reset link</AuthButton>
      </form>

      <AuthFooter prompt="Remembered it?" linkText="Back to log in" to="/" />
    </AuthCard>
  )
}

export default ForgotPasswordPage
