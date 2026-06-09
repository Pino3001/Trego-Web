
export interface FormInputProps {
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;        // por defecto "text"
  required?: boolean;
}

export default function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
} : FormInputProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">
        {label}
        {required && <span className="text-indigo-400 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900
                   placeholder-slate-300 bg-white
                   focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300
                   transition-shadow"
      />
    </div>
  );
}
