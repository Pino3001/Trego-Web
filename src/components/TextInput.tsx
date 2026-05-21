import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface InputProps {
  placeholder: string;
  type?: "text" | "password" | "email";
  className?: string;
  value: string;
  onChange: (value: string) => void;
  colorStyle?: string // color que tenfra los outlained y el texto del label flotante
}

export const TextInput = ({
  placeholder,
  type = "text",
  className,
  value, 
  onChange,
  colorStyle = "trego-orange" 
}: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isFloating = isFocused || value.length > 0;

  // Determinamos el tipo real del input
  const inputType = type === "password" && showPassword ? "text" : type;

  return (
    <div className="relative w-full">
      <input
        type={inputType}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`peer w-full h-13 border border-gray-400 rounded-full px-5 outline-none
         focus:border-${colorStyle} focus:ring-1 focus:ring-${colorStyle} transition-all 
         duration-200 placeholder-transparent ${className}`}
        placeholder={placeholder}
      />

      <label
        className={`absolute left-5 transition-all duration-200 pointer-events-none 
          ${
            isFloating
              ? `-top-2 text-xs text-${colorStyle}  bg-white px-1`
              : "top-3.5 text-base text-gray-500"
        } ${className}`}
      >
        {placeholder}
      </label>

      {/* Solo mostramos el botón si el tipo es 'password' */}
      {type === "password" && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          // 3. Estilo del botón del icono
          className={`absolute right-5 top-4 flex items-center justify-center text-gray-500
           hover:text-trego-orange transition-colors ${className}`}
        >
          {/* 4. Renderizar el icono basado en el estado, con tamaño controlado */}
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
    </div>
  );
};
