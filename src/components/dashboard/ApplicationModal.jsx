import { useState } from 'react'
import ModalDialog from '../ui/ModalDialog'
import ModalField from '../ui/ModalField'

const FIELDS = [
  { id: 'company', label: 'Company', placeholder: 'Company Name' },
  { id: 'location', label: 'Location', placeholder: 'City, Country Code' },
  { id: 'role', label: 'Role', placeholder: 'Role' },
  { id: 'dueDate', label: 'Due Date', type: 'date' },
]

function capitaliseWords(text) {
  return text
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((word) => {
      const bare = word.replace(/[^a-zA-Z]/g, '')

      if (bare.length === 2) {
        return word.toUpperCase()
      }

      const lower = word.toLowerCase()
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    })
    .join(' ')
}

export default function ApplicationModal({ isOpen, onClose, onSubmit }) {
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [location, setLocation] = useState('')
  const [errors, setErrors] = useState({})

  function validate() {
    const newErrors = {}
    if (!company.trim()) newErrors.company = 'Company is required'
    if (!role.trim()) newErrors.role = 'Role is required'
    if (!dueDate) newErrors.dueDate = 'Due Date is required'
    if (!location) newErrors.location = 'Location is required'
    return newErrors
  }

  const values = { company, location, role, dueDate }
  const setters = {
    company: setCompany,
    location: setLocation,
    role: setRole,
    dueDate: setDueDate,
  }

  function handleSubmit(e) {
    e.preventDefault()
    const newErrors = validate()
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    onSubmit?.({
      company: company.trim(),
      location: capitaliseWords(location),
      role: role.trim(),
      dueDate,
    })
    setCompany('')
    setLocation('')
    setRole('')
    setDueDate('')

    setErrors({})
  }

  return (
    <ModalDialog isOpen={isOpen} onClose={onClose} title="ADD APPLICATION">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-4 sm:gap-5"
      >
        {FIELDS.map((field) => (
          <ModalField
            key={field.id}
            {...field}
            required
            value={values[field.id]}
            onChange={(e) => setters[field.id](e.target.value)}
            error={errors[field.id]}
          />
        ))}

        <button
          type="submit"
          className="mt-2 w-full self-center rounded-full bg-brand-yellow px-6 py-3.5 text-lg font-bold text-brand-black transition-colors hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow active:scale-[0.98] sm:w-auto sm:min-w-[60%]"
        >
          Submit
        </button>
      </form>
    </ModalDialog>
  )
}
