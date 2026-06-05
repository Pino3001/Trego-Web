import { Image as ImageIcon } from "lucide-react";
import type { DTOProducto } from "../../../data/DTOProducto.js";

// ... (Tu interfaz DTOProducto aquí) ...

export const ProductoCardCompacta = ({ producto }: { producto: DTOProducto }) => {
  // Extraemos los nombres de los ingredientes en un solo string separado por comas
  const ingredientesStr =
    producto.ingredientes?.map((i) => i.nombre).join(", ") || "";

  return (
    <div
      className={`bg-white border-2 rounded-xl overflow-hidden shadow-sm transition-all duration-200 p-2 flex gap-3 h-28 ${
        producto.disponible === false
          ? "border-gray-200 opacity-60 bg-gray-50 grayscale"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {/* IMAGEN: Cuadrado compacto a la izquierda */}
      <div className="w-24 h-24 shrink-0 bg-gray-100 rounded-lg border border-gray-100 flex items-center justify-center overflow-hidden">
        {producto.urlImagen ? (
          <img
            src={producto.urlImagen}
            alt={producto.nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <ImageIcon size={24} className="text-gray-300" />
        )}
      </div>

      {/* CONTENIDO: Apilado a la derecha */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        
        {/* Fila 1: Nombre y Precio */}
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2" title={producto.nombre}>
            {producto.nombre}
          </h3>
          <span className="font-black text-gray-950 text-sm whitespace-nowrap bg-gray-50 px-1.5 rounded border border-gray-100">
            ${producto.precio?.toFixed(2)}
          </span>
        </div>

        {/* Fila 2: Etiquetas (Tipo, Subcategoría/Categoría) */}
        <div className="flex flex-wrap gap-1.5 mt-auto mb-1.5">
          <span className="text-[10px] font-black px-1.5 py-0.5 bg-gray-800 text-white rounded uppercase tracking-wider">
            {producto.tipo}
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded uppercase tracking-wider truncate max-w-[120px] border border-gray-200">
            {producto.subCategoria?.nombre || producto.categoria}
          </span>
        </div>

        {/* Fila 3: Ingredientes */}
        <p 
          className="text-xs text-gray-500 truncate font-medium" 
          title={ingredientesStr}
        >
          {ingredientesStr ? (
             <span className="text-gray-400 font-normal">Inc: </span>
          ) : null}
          {ingredientesStr || "Sin detalles"}
        </p>

      </div>
    </div>
  );
};