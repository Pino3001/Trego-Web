/* import ImageUploadField from "../../../components/ImagenUploadField.js";


export default function AltaPlato() {


  return (
    <div className="bg-white rounded-3xl p-8 flex flex-col gap-3">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex flex-col gap-5 m-auto">
          <ImageUploadField
            label="Imagen Del Producto"
            imageField={foto}
            onImageChange={handleImageChange}
            hasError={!!error.foto}
            className="w-55 h-40"
          />

          <div className="w-55   m-auto">
            <TextInputNumber
              value={precio}
              onChange={onChangePrecio}
              label="Precio"
              suffix="$"
              error={error.precio}
              min={0}
            />
          </div>
        </div>

        <div className="w-100 m-auto mt-5 flex flex-col gap-3">
          <TextInput
            placeholder="Nombre del plato"
            value={nombre}
            onChange={onChangeNombre}
            colorStyle="trego-restaurante"
            type="text"
            error={error.nombre ?? ""}
          />

          <TextSelector
            items={CATEGORIAS_PRODUCTO}
            placeholder="Categoria "
            colorStyle="trego-restaurante"
            mapToItem={(t) => ({ id: t.id, label: t.label })}
            selected={
              categoria ? { id: categoria, label: categoria } : undefined
            }
            onSelect={(item) =>
              onChangeCategoria(item?.id as EnumCategoriaProducto)
            }
          />

          <TextSelector
            items={subcategorias ?? []}
            placeholder="Sub-Categoria Producto"
            colorStyle="trego-restaurante"
            mapToItem={(t) => ({
              id: t.idSubCategoria ?? "",
              label: t.nombre ?? "",
            })}
            selected={subcategoria}
            onSelect={onChangeSubCategoria}
          />

          <TextInputNumber
            value={tiempoPreparacion}
            onChange={onChangeTiempoPrep}
            label="Tiempo Preparacion"
            suffix="Min"
            error={error.precio}
            min={0}
          />
        </div>
      </div>

      <div className="flex1 px-10">
        <h1 className="text-sm font-semibold px-5">Descripción</h1>
        <textarea
          value={descripcion}
          onChange={(e) => onChangeDescripcion(e.target.value)}
          placeholder="Describe el producto..."
          rows={2}
          className="w-full border border-gray-400 rounded-3xl p-5 outline-none
                       focus:border-trego-restaurante focus:ring-1 focus:ring-trego-restaurante"
        />
        {error.descripcion && (
          <p className="text-xs text-red-500 mt-1 px-5">{error.descripcion}</p>
        )}
      </div>

      <div className="flex flex-col px-10 gap-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto w-full">
          <label className="text-sm font-semibold text-gray-700">
            Ingredientes del producto
          </label>
          <span className="text-xs font-medium text-trego-restaurante bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
            {listaIngredientes.length}{" "}
            {listaIngredientes.length === 1 ? "agregado" : "agregados"}
          </span>
        </div>

        <div className="w-full max-w-2xl mx-auto flex gap-3">
          <div className="flex-1">
            <TextBuscador
              id="Ingredientes listado"
              items={ingredientesDisponibles}
              selected={ingredienteSeleccionado}
              onSelect={(item) => {
                agregarIngrediente(item);
              }}
              mapToItem={(t) => ({
                id: t.idIngrediente ?? t.nombre,
                label: t.nombre,
              })}
              placeholder="Buscar ingrediente existente"
              label
            />
          </div>
          <button
            type="button"
            onClick={() => setMostrarFormIngrediente(true)}
            title="Crear ingrediente nuevo"
            className="w-12 h-12 rounded-2xl bg-trego-restaurante hover:bg-green-700 text-white flex items-center justify-center transition-colors shadow-sm shrink-0"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </button>
        </div>

        {mostrarFormIngrediente && (
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center max-w-2xl mx-auto w-full p-4 rounded-2xl border border-green-100 bg-green-50/50">
            <input
              type="text"
              value={nuevoIngrediente}
              onChange={(e) => setNuevoIngrediente(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && crearIngredienteLocal()}
              placeholder="Nombre del ingrediente nuevo"
              className="flex-1 border border-gray-300 rounded-3xl px-5 py-2.5 outline-none text-sm bg-white
                          focus:border-trego-restaurante focus:ring-1 focus:ring-trego-restaurante transition-all"
              autoFocus
            />
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={crearIngredienteLocal}
                disabled={!nuevoIngrediente.trim()}
                className="px-4 py-2.5 rounded-3xl bg-trego-restaurante text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                Crear y agregar
              </button>
              <button
                type="button"
                onClick={() => {
                  setMostrarFormIngrediente(false);
                  setNuevoIngrediente("");
                }}
                className="px-4 py-2.5 rounded-3xl bg-white border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="max-w-2xl mx-auto w-full rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">
              Lista de ingredientes
            </p>
            {listaIngredientes.length > 0 && (
              <button
                type="button"
                onClick={limpiarIngredientes}
                className="text-xs text-red-500 hover:text-red-700 font-medium"
              >
                Quitar todos
              </button>
            )}
          </div>

          {listaIngredientes.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-gray-500">
                Todavía no agregaste ingredientes
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Buscá uno existente o creá uno nuevo con el botón +
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {listaIngredientes.map((ing, index) => (
                <li
                  key={ing.idIngrediente ?? `${ing.nombre}-${index}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 bg-white hover:bg-green-50/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 shrink-0 rounded-full bg-trego-restaurante/10 text-trego-restaurante text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-800 truncate">
                      {ing.nombre}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => quitarIngrediente(ing)}
                    className="shrink-0 p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Quitar ingrediente"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
 */