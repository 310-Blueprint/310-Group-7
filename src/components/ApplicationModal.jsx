import { useState } from "react";

export default function ApplicationModal({ isOpen, onClose, onSubmit }) {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [errors, setErrors] = useState({});

  if (!isOpen) {
    return null;
  }

  function validate() {
    const newErrors = {};

    if (!company.trim()) {
      newErrors.company = "Company is required";
    }

    if (!role.trim()) {
      newErrors.role = "Role is required";
    }

    if (!dueDate) {
      newErrors.dueDate = "Due date is required";
    }

    return newErrors;
  }

  function handleSubmit(e) {
    e.preventDefault();

    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    onSubmit?.({ company: company.trim(), role: role.trim(), dueDate });

    setCompany("");
    setRole("");
    setDueDate("");
    setErrors({});
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-6"
      onClick={handleOverlayClick}
    >
      <div className="relative w-full max-w-[480px]">
        <div className="relative z-20 flex items-center justify-center">
          <h2
            id="modal-title"
            className="text-center text-5xl font-bold tracking-tight text-application-modal-black"
          >
            ADD APPLICATION
          </h2>
        </div>

        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="relative z-10 -mt-2 rounded-[28px] bg-application-modal-black p-8 pt-16 pb-9 font-sans shadow-2xl"
        >
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <label className="flex flex-col gap-2">
              <span className="font-medium text-brand-bg">Company</span>
              <input
                type="text"
                placeholder="Company name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="rounded-full bg-input-bg px-5 py-3.5 text-brand-black outline-none placeholder:text-input-placeholder focus-visible:ring-2 focus-visible:ring-brand-yellow"
              />
              {errors.company && (
                <span className="px-2 text-sm text-red-300">{errors.company}</span>
              )}
            </label>

            <label className="flex flex-col gap-2">
              <span className="font-medium text-brand-bg">Role</span>
              <input
                type="text"
                placeholder="Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="rounded-full bg-input-bg px-5 py-3.5 text-brand-black outline-none placeholder:text-input-placeholder focus-visible:ring-2 focus-visible:ring-brand-yellow"
              />
              {errors.role && (
                <span className="px-2 text-sm text-red-300">{errors.role}</span>
              )}
            </label>

            <label className="flex flex-col gap-2">
              <span className="font-medium text-brand-bg">Due date</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded-full bg-input-bg px-5 py-3.5 text-brand-black outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow"
              />
              {errors.dueDate && (
                <span className="px-2 text-sm text-red-300">{errors.dueDate}</span>
              )}
            </label>

            <button
              type="submit"
              className="mt-2 self-center min-w-[60%] rounded-full bg-brand-yellow px-6 py-3.5 text-lg font-bold text-brand-black transition-colors hover:brightness-95 active:scale-[0.98]"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}