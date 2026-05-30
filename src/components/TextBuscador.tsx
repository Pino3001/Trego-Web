import { useEffect, useRef, useState } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

export interface SearchItem {
  id: string | number;
  label: string;
}

interface TextSearchProps<T> {
  items: T[];
  placeholder?: string;
  colorStyle?: string;
  onSelect: (item: T | undefined) => void;
  selected?: T | undefined;
  mapToItem: (item: T) => SearchItem;
}

// ── Component ────────────────────────────────────────────────────────────────

export const TextBuscador = <T,>({
  items,
  placeholder = "Buscar...",
  colorStyle = "trego-restaurante",
  onSelect,
  selected = undefined,
  mapToItem,
}: TextSearchProps<T>) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropdownDir, setDropdownDir] = useState<"down" | "up">("down");
  const selectedMapped = selected ? mapToItem(selected) : undefined;

  const filtered = items.filter((item) =>
    mapToItem(item).label.toLowerCase().includes(query.toLowerCase()),
  );

  // Cierra el dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: T) => {
    onSelect(item);
    setQuery("");
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelect(undefined);
    setQuery("");
  };

  const isFloating = isFocused || query.length > 0 || selected !== null;

  const openDropdown = () => {
    if (!selected && inputRef) {
      const rect = inputRef.current?.getBoundingClientRect();
      if (rect) {
        const spaceBelow = window.innerHeight - rect.bottom;
        const dropdownHeight = 220;
        setDropdownDir(spaceBelow < dropdownHeight ? "up" : "down");
      }
    }
    setIsOpen(true);
  };
  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={selected ? selectedMapped?.label : query}
          readOnly={!!selected}
          onChange={(e) => {
            const newQuery = e.target.value;
            setQuery(newQuery);
            // Si había un ítem seleccionado y el usuario escribe, lo limpiamos
            if (selected) {
              onSelect(undefined);
            }
            openDropdown();
          }}
          onFocus={() => {
            setIsFocused(true);
            if (selected) {
              setQuery(selectedMapped?.label ?? "");
              onSelect(undefined); // limpiar selección para que el dropdown se muestre
            }
            openDropdown();
          }}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`
            peer w-full h-13 border border-gray-400 rounded-full px-5 pr-10
            outline-none placeholder-transparent
            focus:border-${colorStyle} focus:ring-1 focus:ring-${colorStyle}
            transition-all duration-200
            ${selected ? "cursor-default text-gray-700" : ""}
          `}
        />

        {/* Floating label */}
        <label
          className={`
            absolute left-5 pointer-events-none transition-all duration-200
            ${
              isFloating
                ? `-top-2 text-xs text-${colorStyle} bg-white px-1`
                : "top-3.5 text-base text-gray-500"
            }
          `}
        >
          {placeholder}
        </label>

        {/* Icono derecho: limpiar o lupa */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
          {selected ? (
            <button
              type="button"
              onClick={handleClear}
              className={`text-gray-400 hover:text-${colorStyle} transition-colors`}
              aria-label="Limpiar selección"
            >
              {/* X icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          ) : (
            <span className="text-gray-400 pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </span>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && !selected && (
        <div
          className={`
                      absolute left-0 right-0 z-50 bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden
                      ${dropdownDir === "up" ? "bottom-[calc(100%+6px)]" : "top-[calc(100%+6px)]"}
                    `}
        >
          {filtered.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-400 text-center">
              Sin resultados
            </p>
          ) : (
            <ul className="max-h-52 overflow-y-auto py-1">
              {items.map((item) => {
                const mapped = mapToItem(item);
                return (
                  <li
                    key={mapped.id}
                    onMouseDown={() => handleSelect(item)}
                    className={`
                                px-4 py-2.5 text-sm cursor-pointer transition-colors
                                ${
                                  selectedMapped?.id === mapped.id
                                    ? `text-${colorStyle} bg-gray-50 font-medium`
                                    : "text-gray-700 hover:bg-gray-50"
                                }
                            `}
                  >
                    {mapped.label}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
