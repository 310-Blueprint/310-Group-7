import { useState} from "react";

export default function ApplicationModal ({isOpen, onClose, onSubmit}){
    const [company, setCompany] = useState ("");
    const [role, setRole] = useState(""); 
    const [dueDate, setDueDate] = useState("");

    if (!isOpen){
        return null;
    }

    function handleSubmit(e){
        e.preventDefault(); 
        onSubmit?.({company, role, dueDate});
        setCompany("");
        setRole("");
        setDueDate("");
    }

    function handleOverlayClick(e){
        if (e.target===e.currentTarget){
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
            className="text-center text-5xl font-bold tracking-tight text-[#353434]"
          >
            ADD APPLICATION
          </h2>
        </div>

        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="relative z-10 -mt-2 rounded-[28px] bg-[#353434] p-8 pt-16 pb-9 font-sans shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <label className="flex flex-col gap-2">
              <span className="font-medium text-brand-bg">Company</span>
              <input
                type="text"
                placeholder="Company name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
                className="rounded-full bg-input-bg px-5 py-3.5 text-brand-black outline-none placeholder:text-input-placeholder focus-visible:ring-2 focus-visible:ring-brand-yellow"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="font-medium text-brand-bg">Role</span>
              <input
                type="text"
                placeholder="Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="rounded-full bg-input-bg px-5 py-3.5 text-brand-black outline-none placeholder:text-input-placeholder focus-visible:ring-2 focus-visible:ring-brand-yellow"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="font-medium text-brand-bg">Due date</span>
              <input
                type="text"
                placeholder="DD/MM/YYYY"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="rounded-full bg-input-bg px-5 py-3.5 text-brand-black outline-none placeholder:text-input-placeholder focus-visible:ring-2 focus-visible:ring-brand-yellow"
              />
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