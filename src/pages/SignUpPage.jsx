import { Link } from 'react-router-dom'
import AuthCard from '../components/AuthCard'
import Button from '../components/AuthButton'
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

        <Button className="mx-20 mb-5">Create Account</Button>
      </form>

      <div className="flex justify-center gap-1">
        <p>Already have an account?</p>
        <Link className="text-link underline mb-5" to="/">
          Log in
        </Link>
      </div>
    </AuthCard>
  )
}

export default SignUpPage
