import { useRef } from "react";

export default function OTPInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = value.padEnd(6, "").split("").slice(0, 6);

  function handleChange(i: number, char: string) {
    const only = char.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = only;
    onChange(next.join(""));
    if (only && i < 5) inputs.current[i + 1]?.focus();
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      onChange(pasted);
      inputs.current[5]?.focus();
    }
    e.preventDefault();
  }

  return (
    <div className="flex gap-3 justify-center" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className={`
            w-11 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none
            transition-all duration-200 bg-white
            ${d
              ? "border-orange-500 text-orange-600 shadow-sm shadow-orange-200"
              : "border-gray-200 text-gray-800 focus:border-orange-400"
            }
          `}
        />
      ))}
    </div>
  );
}