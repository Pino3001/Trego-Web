import { useEffect, useRef, useState } from "react";

export interface SelectItem {
  id: string | number;
  label: string;
}

// Props genéricas que extienden SelectItem
interface TextSelectProps<T extends SelectItem> {
  items: T[];
  placeholder?: string;
  colorStyle?: string;
  onSelect: (item: T | undefined) => void;
  selected?: T | undefined;
  mapToItem: (item: T) => SelectItem;
}

export const TextSelector = <T extends SelectItem>({
  items,
  placeholder = "Seleccioná...",
  colorStyle = "trego-restaurante",
  onSelect,
  selected = undefined,
  mapToItem,
}: TextSelectProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownDir, setDropdownDir] = useState<"down" | "up">("down");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLButtonElement>(null);
  const selectedMapped = selected ? mapToItem(selected) : undefined;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openDropdown = () => {
    const rect = inputRef.current?.getBoundingClientRect();
    if (rect) {
      const spaceBelow = window.innerHeight - rect.bottom;
      setDropdownDir(spaceBelow < 220 ? "up" : "down");
    }
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (item: T) => {
    onSelect(item);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(undefined);
  };

  const isFloating = isOpen || selected !== undefined;

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Trigger */}
      <button
        ref={inputRef}
        type="button"
        onClick={openDropdown}
        className={`
          peer w-full h-13 border rounded-full px-5 pr-10
          text-left outline-none transition-all duration-200
          ${
            isOpen
              ? `border-${colorStyle} ring-1 ring-${colorStyle}`
              : "border-gray-400"
          }
          ${selected ? "text-gray-700" : "text-transparent"}
          bg-white
        `}
      >
        {selected?.label ?? placeholder}
      </button>

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

      {/* Icono derecho */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
        {selected ? (
          <button
            type="button"
            onClick={handleClear}
            className={`text-gray-400 hover:text-${colorStyle} transition-colors`}
            aria-label="Limpiar selección"
          >
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
          <span
            className={`pointer-events-none transition-transform duration-200 text-gray-400 ${isOpen ? "rotate-180" : ""}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <ul
          className={`
          absolute left-0 right-0 z-50
          bg-white border border-gray-200 rounded-2xl shadow-md
          overflow-y-auto max-h-52 py-1
          ${dropdownDir === "up" ? "bottom-full mb-1.5" : "top-full mt-1.5"}
        `}
        >
          {items.length === 0 ? (
            <li className="px-4 py-3 text-sm text-gray-400 text-center">
              Sin opciones
            </li>
          ) : (
            items.map((item) => {
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
            })
          )}
        </ul>
      )}
    </div>
  );
};
