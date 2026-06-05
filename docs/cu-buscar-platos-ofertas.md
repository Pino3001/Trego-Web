# CU-CLI: Buscar Platos y Ofertas — Especificación para Frontend

## Contexto

El backend **no tiene búsqueda global de platos** ni endpoint "solo ofertas". El flujo soportado es:

1. **Buscar / listar restaurantes** (por nombre o por dirección de entrega).
2. **Entrar al menú de un restaurante** y ahí ver platos, filtrar por categoría, ordenar por precio y detectar ofertas en cada producto.

Implementar el CU con ese modelo de **dos pasos** (restaurantes → menú). No diseñar una pantalla tipo "buscar pizza en toda la app" sin backend adicional.

---

## Alcance funcional

### Incluye

- Listado de restaurantes habilitados.
- Búsqueda de restaurantes por nombre (filtro parcial en backend).
- Filtrado de restaurantes por zona de entrega (dirección del cliente).
- Visualización del menú de un restaurante.
- Filtro de productos por **categoría** (query param al backend).
- Orden de productos por **precio** (query param al backend).
- Destacar productos con **oferta activa** (`producto.oferta != null`).
- Búsqueda por **nombre de plato** solo **en el front**, sobre el menú ya cargado.

### No incluye (sin endpoints)

- Búsqueda de platos entre varios restaurantes a la vez.
- Endpoint dedicado "listar ofertas".
- Filtro por nombre de plato en backend.
- Paginación server-side.

---

## Flujo de pantallas sugerido

```
Home / Explorar
    ├── Lista de restaurantes
    │       └── Detalle restaurante + menú
    ├── Buscador por nombre de restaurante → Lista de restaurantes
    └── Dirección de entrega → Lista de restaurantes (filtrada por zona)
```

| Pantalla | Ruta sugerida | Acción |
|----------|---------------|--------|
| Explorar restaurantes | `/cliente/restaurantes` | Carga inicial |
| Menú del restaurante | `/cliente/restaurantes/:id/menu` | Ver platos y ofertas |

---

## Endpoints a usar

### 1. Listar / buscar restaurantes

**`GET /api/restaurantes/listar`**

**Auth:** requiere JWT (`Authorization: Bearer …`)

| Query | Tipo | Descripción |
|-------|------|-------------|
| `nombre` | string, opcional | Si viene vacío → todos los habilitados. Si tiene valor → coincidencia parcial por nombre |

**Respuesta:** `DTORestaurante[]` (sin menú, sin password)

Campos útiles para cards:

- `idRestaurante`, `nombre`, `categoria`, `calificacionProm`
- `fotoPortada`, `fotoPerfil`, `descripcion`
- `abierto`, `horaApertura`, `horaCierre`
- `direccion`, `radioEntrega`

---

### 2. Restaurantes con cobertura en una dirección

**`POST /api/restaurantes/listarXdirreccion`**

**Auth:** requiere JWT

**Body:** `DTODireccion`

```json
{
  "latitud": -34.9011,
  "longitud": -56.1645,
  "calle": "Av. 18 de Julio",
  "numero": 1234
}
```

Mínimo usable: `latitud` + `longitud`.

**Respuesta:** `DTORestaurante[]` filtrados por radio de entrega.

**Errores:**

- `404` si no hay restaurantes habilitados o ninguno cubre la zona.

---

### 3. Datos del restaurante (sin menú)

**`GET /api/restaurantes/obtenerRestaurante/{id}`**

**Auth:** requiere JWT

Para header del menú (nombre, fotos, horarios, calificación).

---

### 4. Menú con platos y ofertas

**`GET /api/pedido/restaurante/{restauranteId}/verMenu`**

**Auth:** **público** (no requiere token)

| Query | Valores | Descripción |
|-------|---------|-------------|
| `categoria` | enum producto (ver abajo) | Filtro server-side |
| `orden` | `precio_asc` \| `precio_desc` | Orden server-side |

**Valores de `categoria`:**

`Bebida`, `Ensalada`, `Principal`, `Entrada`, `Guarnicion`, `Postre`, `Otros`

(enviar el **nombre del enum**, case insensitive)

**Respuesta exitosa:** `DTORestaurante` **con** `productos: DTOProducto[]`

**Respuesta sin productos (200):**

```json
{ "mensaje": "Restaurante sin Productos" }
```

El front debe manejar **ambas formas** de respuesta 200:

- Objeto restaurante con `productos`
- Objeto `{ mensaje }` sin productos

**Errores:**

- `404` restaurante inexistente

---

## Modelo de datos relevante

### `DTOProducto` (cada ítem del menú)

| Campo | Uso en UI |
|-------|-----------|
| `idProducto` | ID para carrito |
| `nombre`, `descripcion`, `precio`, `urlImagen` | Card del plato |
| `categoria` | Chips / tabs de filtro |
| `disponible` | Deshabilitar "Agregar" si `false` |
| `tipo` | `Plato` \| `Combo` \| `Articulo` |
| `oferta` | Ver abajo; `null` = sin oferta |
| `plato.tiempoPreparacionMinutos` | Solo si `tipo === Plato` |
| `subCategoria` | Agrupación opcional en UI |

### `DTOOferta` (cuando `producto.oferta != null`)

| Campo | Uso |
|-------|-----|
| `descuento` | Porcentaje (ej. `20.0` = 20% off) |
| `descripcion` | Texto promo |
| `fechaInicio`, `fechaFin` | Validar vigencia en front si querés |
| `urlImagen` | Badge / banner promo |

**Precio con oferta (calcular en front):**

```typescript
const precioFinal = producto.oferta
  ? producto.precio * (1 - producto.oferta.descuento / 100)
  : producto.precio;
```

Mostrar tachado `precio` original + precio final si hay oferta.

**Filtro "Solo ofertas":** local, sobre `productos.filter(p => p.oferta != null)`.

**Buscador por nombre de plato:** local, sobre el array `productos` ya cargado.

### Enums de referencia

**Categoría de restaurante (`EnumCategoriaRestaurante`):**

`Parrillada`, `Vegano`, `Pizza`, `ComidaRapida`, `Postres`, `Rotiseria`, `Heladeria`, `Chiveteria`, `Panaderia`, `Otros`

**Categoría de producto (`EnumCategoriaProducto`):**

`Bebida`, `Ensalada`, `Principal`, `Entrada`, `Guarnicion`, `Postre`, `Otros`

---

## Lógica de filtros: qué va al backend vs front

| Filtro | Dónde |
|--------|-------|
| Nombre de restaurante | Backend → `GET /listar?nombre=` |
| Restaurantes en mi zona | Backend → `POST /listarXdirreccion` |
| Categoría de producto | Backend → `verMenu?categoria=` |
| Orden por precio | Backend → `verMenu?orden=precio_asc\|precio_desc` |
| Nombre de plato | **Front** (sobre menú cargado) |
| Solo ofertas | **Front** (`oferta != null`) |
| Categoría de restaurante (Pizza, Vegano…) | **Front** (sobre lista de restaurantes) |

Al cambiar categoría u orden del menú, **volver a llamar** `verMenu` con los query params (no re-filtrar solo en memoria si ya usás params del backend).

---

## Constantes sugeridas (`endpoints.js`)

```javascript
RESTAURANTES_LISTAR: '/api/restaurantes/listar',
RESTAURANTES_POR_DIRECCION: '/api/restaurantes/listarXdirreccion',
RESTAURANTE_OBTENER: '/api/restaurantes/obtenerRestaurante', // + /{id}
MENU_RESTAURANTE: '/api/pedido/restaurante', // + /{id}/verMenu
```

---

## Funciones API sugeridas

```typescript
// Con auth (fetchConAuth)
listarRestaurantes(nombre?: string): Promise<DTORestaurante[]>
listarRestaurantesPorDireccion(direccion: DTODireccion): Promise<DTORestaurante[]>
obtenerRestaurante(id: number): Promise<DTORestaurante>

// Sin auth (fetch normal)
verMenu(
  restauranteId: number,
  opts?: { categoria?: string; orden?: 'precio_asc' | 'precio_desc' }
): Promise<DTORestaurante | { mensaje: string }>
```

---

## UX mínima aceptable

1. **Barra de búsqueda** → filtra restaurantes por nombre (debounce + `GET listar?nombre=`).
2. **Selector de dirección** → `POST listarXdirreccion` con lat/lng del cliente.
3. **Grid de restaurantes** → card con foto, nombre, categoría, estrellas, badge abierto/cerrado.
4. **Click en restaurante** → pantalla menú.
5. **Menú:**
   - Tabs o select de categorías de producto (valores del enum).
   - Select orden: "Menor precio" / "Mayor precio".
   - Toggle "Solo ofertas" (filtro local).
   - Input "Buscar plato…" (filtro local por `nombre`).
   - Cards con badge "-X%" si `oferta`.
6. **Estados vacíos:**
   - Sin restaurantes en zona.
   - Menú con `{ mensaje: "Restaurante sin Productos" }`.
   - Filtro local sin resultados.

---

## Criterios de aceptación

- [ ] Cliente autenticado ve restaurantes habilitados.
- [ ] Puede buscar restaurante por nombre.
- [ ] Puede filtrar restaurantes por dirección de entrega.
- [ ] Al elegir restaurante, ve menú con platos.
- [ ] Puede filtrar menú por categoría (vía API).
- [ ] Puede ordenar menú por precio (vía API).
- [ ] Productos con `oferta` muestran descuento y precio final calculado.
- [ ] Puede filtrar "solo ofertas" y buscar plato por nombre en el front.
- [ ] Maneja respuesta 200 con `{ mensaje }` cuando no hay productos.
- [ ] No depende de endpoints inexistentes de búsqueda global.

---

## Fuera de alcance / pedido futuro al backend

Si el diseño UX exige **buscador global de platos**, hay que pedir al backend algo como:

- `GET /api/productos/buscar?nombre=&lat=&lng=`

Hoy **no existe**. No bloquear este CU por eso; implementar el flujo restaurante → menú.

---

## Referencia técnica

- Swagger: `http://localhost:8080/swagger-ui.html`
- Menú público: `SecurityConfig` permite `/api/pedido/restaurante/*/verMenu` sin token.
- Restaurantes: requieren JWT.

---

## Prompt sugerido para Agent (Cursor)

```
Implementá el caso de uso "Buscar Platos y Ofertas (Cliente)" según @docs/cu-buscar-platos-ofertas.md.

Restricciones:
- No inventar endpoints; solo los documentados en la spec.
- verMenu es público (sin token); listar restaurantes requiere fetchConAuth.
- Filtro "solo ofertas" y búsqueda por nombre de plato: en el front.
- Manejar respuesta 200 con { mensaje: "Restaurante sin Productos" }.

Entregables:
- Funciones en clienteApi (o equivalente) + entradas en endpoints.js
- Pantalla listado restaurantes + pantalla menú con filtros
- Tipos TS alineados a DTOProducto / DTORestaurante / DTOOferta
```
