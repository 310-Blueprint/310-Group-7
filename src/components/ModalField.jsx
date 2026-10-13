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
  children,
}) {
  return (
    <label htmlFor={id} className="flex flex-col gap-2">
      <span className="font-medium text-brand-bg">
        {label}{required && ' *'}
      </span>
      {as === 'select' ? (
        <select
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          className={FIELD_CLASSES}
        >
          {children}
        </select>
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={FIELD_CLASSES}
        />
      )}
      {error && <span className="px-2 text-sm text-red-300">{error}</span>}
    </label>
  )
}

export default ModalField
