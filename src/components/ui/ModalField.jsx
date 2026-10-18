// The fields of the modal boxes. Used by both the Add Application and Filter ModalDialog.

const FIELD_CLASSES =
  'min-w-0 rounded-full bg-input-bg px-5 py-3 text-brand-black outline-none placeholder:text-input-placeholder focus-visible:ring-2 focus-visible:ring-brand-yellow sm:py-3.5'

function ModalField({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  as = 'input',
  rows = 3,
  children,
}) {
  let field

  if (as === 'select') {
    field = (
      <select
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        className={FIELD_CLASSES}
      >
        {children}
      </select>
    )
  } else if (as === 'textarea') {
    field = (
      <textarea
        id={id}
        name={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        aria-invalid={Boolean(error)}
        className="min-w-0 resize-y rounded-2xl bg-input-bg px-5 py-3 text-brand-black outline-none placeholder:text-input-placeholder focus-visible:ring-2 focus-visible:ring-brand-yellow"
      />
    )
  } else {
    field = (
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        className={FIELD_CLASSES}
      />
    )
  }

  return (
    <label htmlFor={id} className="flex flex-col gap-2">
      <span className="font-medium text-brand-bg">
        {label}
        {required && ' *'}
      </span>
      {field}
      {error && <span className="px-2 text-sm text-red-300">{error}</span>}
    </label>
  )
}

export default ModalField
