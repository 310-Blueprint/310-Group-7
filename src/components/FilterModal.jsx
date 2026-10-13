import { useEffect, useRef, useState } from "react";

const FIELDS = [
  { id: "company", label: "Company", placeholder: "Company Name" },
  { id: "location", label: "Location", placeholder: "City, Country Code" },
  { id: "role", label: "Role", placeholder: "Role" },
  { id: "dueDate", label: "Due Date", type: "date" },
];

const EMPTY_FILTERS = {
  company: "",
  location: "",
  role: "",
  dueDate: "",
};

// Every field in the modal shares this look, so it's factored out rather
// than repeated per field (see Field.jsx for the auth flow's equivalent).
function ModalField({ label, type = "text", placeholder, value, onChange }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-medium text-brand-bg">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="min-w-0 rounded-full bg-input-bg px-5 py-3 text-brand-black outline-none placeholder:text-input-placeholder focus-visible:ring-2 focus-visible:ring-brand-yellow sm:py-3.5"
      />
    </label>
  );
}

export default function FilterModal({ isOpen, onClose, onSubmit }) {
    const dialogRef = useRef(null);
    const [company, setCompany] = useState("");
    const [role, setRole] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [location, setLocation] = useState("");
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (isOpen && !dialog.open) {
        dialog.showModal();
        } else if (!isOpen && dialog.open) {
        dialog.close();
        }
    }, [isOpen]);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        function handleNativeClose() {
        onClose?.();
        }

        dialog.addEventListener("close", handleNativeClose);
        return () => dialog.removeEventListener("close", handleNativeClose);
    }, [onClose]);

    const values = { company, location, role, dueDate };
    const setters = { company: setCompany, location: setLocation, role: setRole, dueDate: setDueDate };

    function handleSubmit(e) {
        e.preventDefault();
        onSubmit?.({
          company: company.trim(),
          location: location.trim(),
          role: role.trim(),
          dueDate,
        });
        dialogRef.current?.close();
    }

    function handleClear() {
        setCompany("");
        setLocation("");
        setRole("");
        setDueDate("");
        onSubmit?.({ ...EMPTY_FILTERS });
        dialogRef.current?.close();
    }

    return (
        <dialog
        ref={dialogRef}
        aria-labelledby="modal-title"
        className="h-full max-h-none w-full max-w-none overflow-y-auto bg-transparent p-0 backdrop:bg-white/55"
        >
        <div className="flex min-h-full w-full items-center justify-center px-3 py-8 sm:p-6">
            <button
            type="button"
            aria-label="Close"
            onClick={() => dialogRef.current?.close()}
            className="absolute inset-0 cursor-default bg-transparent"
        />

        <div className="relative w-full max-w-120">
          <div className="relative z-20 flex items-center justify-center">
            <h2
              id="modal-title"
              className="text-center text-3xl font-bold tracking-tight text-brand-black sm:text-5xl"
            >
              APPLY FILTERS
            </h2>
          </div>

            <div className="relative z-10 -mt-1 rounded-3xl bg-brand-black px-5 pb-6 pt-12 font-sans shadow-2xl sm:-mt-2 sm:rounded-[28px] sm:p-8 sm:pb-9 sm:pt-16">
                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 sm:gap-5">
                {FIELDS.map((field) => (
                  <ModalField
                    key={field.id}
                    {...field}
                    value={values[field.id]}
                    onChange={(e) => setters[field.id](e.target.value)}
                  />
                ))}

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
          </div>
        </div>
      </div>
    </dialog>
  );
}