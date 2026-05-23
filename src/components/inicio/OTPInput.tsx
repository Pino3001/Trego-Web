import { useRef } from "react";

// Hacerlo reutilizavle para el registrar restaurante y admin
export default function OTPInput({
  value,
  onChange,
  variant = "cliente",
}: {
  value: string;
  onChange: (v: string) => void;
  variant?: "cliente" | "restaurante" | "admin";
}) {
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  // array de 6 posiciones basado puramente en el string 'value'
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || "");

  function handleChange(i: number, char: string) {
    // Nos quedamos solo con números y con el último dígito ingresado
    const onlyDigit = char.replace(/\D/g, "").slice(-1);

    // Clonamos los dígitos actuales
    const nextDigits = [...digits];
    nextDigits[i] = onlyDigit;

    // Unimos todo el array en un string limpio y se lo mandamos al componente padre
    const newValue = nextDigits.join("");
    onChange(newValue);

    // Si escribió un número y no estamos en el último casillero, pasamos el foco al siguiente
    if (onlyDigit && i < 5) {
      setTimeout(() => inputs.current[i + 1]?.focus(), 10);
    }
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    // Si presiona Borrar (Backspace) y el casillero actual está vacío, volvemos al de atrás
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      const nextDigits = [...digits];
      nextDigits[i - 1] = ""; // Vaciamos el anterior
      onChange(nextDigits.join(""));
      inputs.current[i - 1]?.focus();
    }
  }

  // por si pega el codigo
  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      onChange(pasted);
      inputs.current[5]?.focus();
    }
    e.preventDefault();
  }

  const colorStyles = {
    cliente: {
      active:
        "border-trego-orange text-trego-orange shadow-sm shadow-orange-200",
      empty: "border-gray-200 text-gray-800 focus:border-trego-orange",
    },
    restaurante: {
      active:
        "border-trego-restaurante text-trego-restaurante shadow-sm shadow-emerald-200",
      empty: "border-gray-200 text-gray-800 focus:border-trego-restaurante",
    },
    admin: {
      active: "border-trego-admin text-trego-admin shadow-sm shadow-blue-200",
      empty: "border-gray-200 text-gray-800 focus:border-trego-admin",
    },
  };

  return (
    <div className="flex gap-3 justify-center" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            inputs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className={`
            w-11 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none
            transition-all duration-200 bg-white
            ${d ? colorStyles[variant].active : colorStyles[variant].empty}
          `}
        />
      ))}
    </div>
  );
}
