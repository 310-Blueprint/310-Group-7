/*
 * LoginPage
 *
 * Brand colours from src/styles/preset.css are available as Tailwind
 * utilities: bg-brand-bg, text-brand-black, bg-brand-blue, bg-brand-pink,
 * bg-brand-green, bg-brand-yellow (also border-*, hover:bg-*, etc.)
 */
import Field from '../components/Field'
import grassSingle from '../assets/grassSingle.svg'
import grassDouble from '../assets/grassDouble.svg'
import beaver from '../assets/beaver.png'
import beaverArms from '../assets/beaverArms.png'

function LoginPage() {
  function handleSubmit(event) {
    // Stops the browser doing a full page reload on submit.
    // Supabase sign-in goes here later.
    event.preventDefault()
  }

  return (
    <main className="relative grid min-h-screen place-items-center bg-brand-black py-6 px-4 text-brand-bg">
      {/*Logo placeholder*/}
      <div className="absolute top-6 left-6">
        <p>Pipeline</p>
      </div>

      {/*login card*/}
      <div className="relative w-full max-w-xl">
          <h1 className="relative text-center text-8xl font-extrabold -top-8">LOGIN</h1>

          <div className="relative z-10 -mt-12 w-full max-w-xl bg-brand-bg text-brand-black rounded-2xl pt-10 pb-2 px-22">        
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
                  <a className="text-link underline mb-5" href="#">
                    Forgot password?
                  </a>
                </div>
                
                <div className="mx-20 mb-5">
                  <button
                    type="submit"
                    className="w-full bg-brand-yellow font-bold rounded-xl p-2 cursor-pointer transition hover:brightness-105"
                  >
                    Log In
                  </button>
                </div>
            </form>

              <div className="flex justify-center gap-1">
                <p>Don't have an account? </p>
                <a className="text-link underline mb-5" href="#">
                  Create account
                </a>
              </div>

              {/* Decorative assets. Absolute against the card, which is `relative`.
                  pointer-events-none so it can never swallow a click on the form. */}
              <img
                src={grassSingle}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-2 -left-4 z-20 w-20"
              />

              <img
                src={grassDouble}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-2 -right-4 z-20 w-30"
              />
            </div>

          {/* Beaver sits OUTSIDE the card so the card can paint over its body.
              Both layers share identical positioning — only the z-index differs:
              body behind the card (z-0), arms draped over the front (z-20). */}
          <img
            src={beaver}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -top-6 right-4 z-0 w-30"
          />

          <img
            src={beaverArms}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -top-6 right-4 z-20 w-30"
          />
      </div>
    </main>
  )
}

export default LoginPage
