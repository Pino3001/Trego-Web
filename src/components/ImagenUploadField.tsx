import { useRef } from "react";
import type { ImageField } from "./typos/ImageField.js";

export default function ImageUploadField({
  label,
  imageField,
  onImageChange,
  hasError,
}: {
  label: string;
  imageField: ImageField;
  onImageChange: (file: File) => void;
  hasError: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) onImageChange(file);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold">{label}</span>
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`
          relative w-44 h-36 rounded-2xl cursor-pointer
          flex flex-col items-center justify-center gap-2
          border-2 border-dashed transition-all duration-200
          ${hasError ? "border-red-400 bg-red-50" : "border-gray-300 bg-gray-50 hover:border-trego-restaurante hover:bg-green-50"}
          ${imageField.uploadState === "uploading" ? "opacity-60 pointer-events-none" : ""}
        `}
      >
        {imageField.previewUrl ? (
          <>
            <img
              src={imageField.previewUrl}
              alt="preview"
              className="w-full h-full object-cover rounded-2xl"
            />
            {imageField.uploadState === "uploading" && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-2xl">
                <div className="w-8 h-8 rounded-full border-4 border-green-200 border-t-trego-restaurante animate-spin" />
              </div>
            )}
            {imageField.uploadState === "done" && (
              <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow">
                ✓
              </div>
            )}
          </>
        ) : (
          <>
            <svg
              className={`w-10 h-10 ${hasError ? "text-red-300" : "text-gray-300"}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span
              className={`text-xs ${hasError ? "text-red-400" : "text-gray-400"}`}
            >
              Subir imagen
            </span>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onImageChange(file);
          }}
        />
      </div>
      {hasError && (
        <span className="text-xs text-red-500">La imagen es requerida</span>
      )}
    </div>
  );
}