import AuthButton from '../components/AuthButton'
import AuthCard from '../components/AuthCard'
import AuthFooter from '../components/AuthFooter'
import Field from '../components/Field'

function SignUpPage() {
  function handleSubmit(event) {
    // TODO: Supabase signUp goes here later. Password confirmation needs checking before we call it
    event.preventDefault()
  }

  return (
    <AuthCard title="SIGN UP">
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
          autoComplete="new-password"
          placeholder="Create a password"
          className="mb-5"
        />

        <Field
          id="confirmPassword"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          className="mb-5"
        />

        <AuthButton>Create Account</AuthButton>
      </form>

      <AuthFooter
        prompt="Already have an account?"
        linkText="Log in"
        to="/"
      />
    </AuthCard>
  )
}

export default SignUpPage
