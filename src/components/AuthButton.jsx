/*
 * Button — the yellow primary action.
 *
 * Defaults to type="submit" since that's what every auth form needs; pass
 * type="button" for anything that shouldn't submit a form.
 *
 * `className` is for spacing on the wrapper; the button's own look is fixed
 * here so it stays identical across pages.
 */
function Button({ children, className = '', ...buttonProps }) {
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

export default Button
