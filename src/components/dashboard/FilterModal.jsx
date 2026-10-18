import { useState } from 'react'
import ModalDialog from '../ui/ModalDialog'
import ModalField from '../ui/ModalField'

const FIELDS = [
  { id: 'company', label: 'Company', placeholder: 'Company Name' },
  { id: 'location', label: 'Location', placeholder: 'City, Country Code' },
  { id: 'role', label: 'Role', placeholder: 'Role' },
]

const EMPTY_FILTERS = {
  company: '',
  location: '',
  role: '',
  sortOrder: '',
}

export default function FilterModal({ isOpen, onClose, onSubmit }) {
  const [filters, setFilters] = useState({ ...EMPTY_FILTERS })

  function handleChange(event) {
    const { name, value } = event.target
    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit?.({
      ...filters,
      company: filters.company.trim(),
      location: filters.location.trim(),
      role: filters.role.trim(),
    })
  }

  function handleClear() {
    const emptyFilters = { ...EMPTY_FILTERS }
    setFilters(emptyFilters)
    onSubmit?.(emptyFilters)
  }

  return (
    <ModalDialog isOpen={isOpen} onClose={onClose} title="APPLY FILTERS">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-4 sm:gap-5"
      >
        {FIELDS.map((field) => (
          <ModalField
            key={field.id}
            {...field}
            value={filters[field.id]}
            onChange={handleChange}
          />
        ))}

        {/* DROP DOWN BOX FOR SORT BY DUE DATE*/}
        <ModalField
          id="sortOrder"
          label="Sort by due date"
          as="select"
          value={filters.sortOrder}
          onChange={handleChange}
        >
          <option value="">Default order</option>
          <option value="asc">Earliest first</option>
          <option value="desc">Latest first</option>
        </ModalField>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="submit"
            className="mt-2 w-full rounded-full bg-brand-yellow px-12 py-3.5 text-lg font-bold text-brand-black transition-colors hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow active:scale-[0.98] sm:w-auto"
          >
            Submit
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="mt-2 w-full rounded-full border border-white/60 px-6 py-3.5 text-lg font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.98] sm:w-auto"
          >
            Clear filters
          </button>
        </div>
      </form>
    </ModalDialog>
  )
}
