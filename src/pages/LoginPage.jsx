/*
 * LoginPage
 *
 * Brand colours from src/styles/preset.css are available as Tailwind
 * utilities: bg-brand-bg, text-brand-black, bg-brand-blue, bg-brand-pink,
 * bg-brand-green, bg-brand-yellow (also border-*, hover:bg-*, etc.)
 */
function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-brand-black py-6 px-4 text-brand-bg">
      {/* Temporary — replace with the real card. Confirms the centring works. */}
      <div className="w-full max-w-xl bg-brand-bg text-brand-black rounded-2xl pt-10 pb-2 px-22">        <p>Email address</p>
        <div className="w-full text-[#B0B0B0] bg-[#CFD3D5] rounded-xl p-2 mb-5">
          <p>Enter your email address</p>
        </div>

        <p>Password</p>
        <div className="w-full text-[#B0B0B0] bg-[#CFD3D5] rounded-xl p-2">
          <p>Enter your password</p>
        </div>

        <p className="text-right text-[#81A1B3] underline mb-5">
          Forgot password?
        </p>
        
        <div className="bg-brand-yellow text-center font-bold rounded-xl p-2 mx-20 mb-5">Log In</div>

        <div className="flex justify-center gap-1">
          <p>Don't have an account? </p>
          <p className="text-[#81A1B3] underline mb-5">
            Create account
          </p>
        </div>
      </div>
    </main>
  )
}

export default LoginPage
