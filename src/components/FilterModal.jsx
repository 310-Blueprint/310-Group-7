import { useEffect, useRef, useState } from "react";

const FIELDS = [
  { id: "company", label: "Company", placeholder: "Company Name" },
  { id: "location", label: "Location", placeholder: "City, Country Code" },
  { id: "role", label: "Role", placeholder: "Role" },
  { id: "dueDate", label: "Due Date", type: "date" },
];

// Every field in the modal shares this look, so it's factored out rather
// than repeated per field (see Field.jsx for the auth flow's equivalent).
function ModalField({ label, type = "text", placeholder, value, onChange, error }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-medium text-brand-bg">{label} *</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="min-w-0 rounded-full bg-input-bg px-5 py-3 text-brand-black outline-none placeholder:text-input-placeholder focus-visible:ring-2 focus-visible:ring-brand-yellow sm:py-3.5"
      />
      {error && <span className="px-2 text-sm text-red-300">{error}</span>}
    </label>
  );
}

function capitaliseWords(text){
      return text.trim().split(" ").filter(Boolean).map((word) => {
        const bare = word.replace(/[^a-zA-Z]/g, "");

        if (bare.length === 2){
          return word.toUpperCase(); 
        }

        const lower = word.toLowerCase(); 
        return lower.charAt(0).toUpperCase() + lower.slice(1);
      })
      .join(" ");
    }
    
export default function ApplicationModal({ isOpen, onClose, onSubmit }) {
    const dialogRef = useRef(null);
    const [company, setCompany] = useState("");
    const [role, setRole] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [location, setLocation] = useState("");
    const [errors, setErrors] = useState({});

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

    function validate() {
        const newErrors = {};
        if (!company.trim()) newErrors.company = "Company is required";
        if (!role.trim()) newErrors.role = "Role is required";
        if (!dueDate) newErrors.dueDate = "Due Date is required";
        if(!location) newErrors.location = "Location is required";
        return newErrors;
    }

    const values = { company, location, role, dueDate };
    const setters = { company: setCompany, location: setLocation, role: setRole, dueDate: setDueDate };

    function handleSubmit(e) {
        e.preventDefault();
        const newErrors = validate();
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        onSubmit?.({ company: company.trim(), location: capitaliseWords(location), role: role.trim(), dueDate });
        setCompany("");
        setLocation(""); 
        setRole("");
        setDueDate("");
        
        setErrors({});
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
              ADD APPLICATION
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
          </div>
        </div>
      </div>
    </dialog>
  );
}