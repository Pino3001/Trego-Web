// TextInputNumber.tsx
import { useState } from "react";

interface TextInputNumberProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  colorStyle?: string;
  label?: string;
  suffix?: string;
  error?: string | undefined;
  min?: number;
  max?: number;
}

export const TextInputNumber = ({
  value,
  onChange,
  placeholder = "0",
  colorStyle = "trego-restaurante",
  label,
  suffix = "$",
  error,
  min,
  max,
}: TextInputNumberProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const isFloating = isFocused || value !== 0;

  return (
    <div className="relative w-full">
      <input
        type="number"
        value={value === 0 ? "" : value}
        min={min}
        max={max}
        onChange={(e) => {
          const parsed = parseFloat(e.target.value);
          onChange(isNaN(parsed) ? 0 : parsed);
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className={`
          peer w-full h-13 border rounded-full px-5 pr-12
          outline-none placeholder-transparent
          transition-all duration-200
          ${error
            ? "border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-300 bg-red-50"
            : `border-gray-400 focus:border-${colorStyle} focus:ring-1 focus:ring-${colorStyle} bg-white`
          }
        `}
      />

      {/* Floating label */}
      {label && (
        <label
          className={`
            absolute left-5 pointer-events-none transition-all duration-200
            ${isFloating
              ? `-top-2 text-xs bg-white px-1 ${error ? "text-red-400" : `text-${colorStyle}`}`
              : "top-3.5 text-base text-gray-500"
            }
          `}
        >
          {label}
        </label>
      )}

      {/* Suffix */}
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none">
        {suffix}
      </span>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 mt-1 px-5">{error}</p>
      )}
    </div>
  );
};