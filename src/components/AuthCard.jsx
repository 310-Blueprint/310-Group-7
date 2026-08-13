/*
 * AuthCard — the shared shell for login, sign up and password reset.
 *
 * Owns the page background, logo, heading and all the decorative artwork,
 * so the pages themselves only describe their own form.
 *
 * Layering (this is the fiddly part — see the z-index comments below):
 *   heading  z-auto ─ beaver body  z-0 ─ card  z-10 ─ grass + beaver arms  z-20
 */
import grassSingle from '../assets/grassSingle.svg'
import grassDouble from '../assets/grassDouble.svg'
import beaver from '../assets/beaver.png'
import beaverArms from '../assets/beaverArms.png'

// The two beaver layers are the same artwork split in half, so they have to
// sit at exactly the same spot — only their z-index differs. Sharing one
// position means they cannot drift apart.
const BEAVER_POSITION = 'pointer-events-none absolute -top-6 right-4 w-30'

function AuthCard({ title, children }) {
  return (
    <main className="relative grid min-h-screen place-items-center bg-brand-black py-6 px-4 text-brand-bg">
      {/*Logo placeholder
      TODO:Replace with logo asset after merge
      */}
      <div className="absolute top-6 left-6">
        <p>Pipeline</p>
      </div>

      <div className="relative w-full max-w-xl">
        {/*Card title*/}
        <h1 className="relative -top-8 text-center text-8xl font-extrabold">
          {title}
        </h1>

        <div className="relative z-10 -mt-12 w-full bg-brand-bg text-brand-black rounded-2xl pt-10 pb-2 px-22">
          {children}
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

        {/* Beaver sits OUTSIDE the card so the card can paint over its body:
            body behind the card (z-0), arms draped over the front (z-20). */}
        <img
          src={beaver}
          alt=""
          aria-hidden="true"
          className={`${BEAVER_POSITION} z-0`}
        />

        <img
          src={beaverArms}
          alt=""
          aria-hidden="true"
          className={`${BEAVER_POSITION} z-20`}
        />
      </div>
    </main>
  )
}

export default AuthCard
