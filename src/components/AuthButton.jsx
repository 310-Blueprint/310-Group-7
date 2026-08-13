/*
 * AuthButton — the yellow primary action.
 *
 * Defaults to type="submit" since that's what every auth form needs; pass
 * type="button" for anything that shouldn't submit a form.
 *
 * `className` is the wrapper's spacing. It defaults to how the button sits in
 * an auth card, since all three pages want the same thing — pass your own to
 * override. The button's own look is fixed here so it can't drift per page.
 */
function AuthButton({ children, className = 'mx-20 mb-5', ...buttonProps }) {
  return (
    <div className={className}>
      <button
        type="submit"
        {...buttonProps}
        className="w-full bg-brand-yellow font-bold rounded-xl p-2 cursor-pointer transition hover:brightness-105"
      >
        {children}
      </button>
    </div>
  )
}

export default AuthButton
