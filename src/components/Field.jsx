/*
 * Field — a labelled text input.
 *
 * `id` wires the label to the input, so clicking the label focuses the field
 * and screen readers announce them as a pair. It must be unique on the page.
 *
 * `className` is for spacing on the wrapper (e.g. "mb-5"); the input's own
 * styling is fixed here so every field in the app matches.
 *
 * Anything else you pass — type, placeholder, autoComplete, required, and
 * later value/onChange — lands on the <input> via ...inputProps.
 */
function Field({ id, label, className = '', ...inputProps }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block mb-1">
        {label}
      </label>
      <input
        id={id}
        {...inputProps}
        className="w-full bg-input-bg placeholder:text-input-placeholder rounded-xl pl-3 p-2 focus:outline-none focus:ring-2 focus:ring-brand-blue"
      />
    </div>
  )
}

export default Field
