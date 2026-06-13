import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { mapearCarritoDtoAItems } from "../api/mapeadores.js";
import {
  agregarProductoAlCarrito as agregarProductoAlCarritoApi,
  eliminarCarritoCompleto,
  eliminarProductoDelCarrito,
  modificarProductoEnCarrito,
  obtenerCarrito,
} from "../api/carritoApi.js";
import { obtenerDireccionesGuardadas } from "../api/usuariosApi.js";
import { confirmarPedido } from "../api/pedidosApi.js";
import { esSesionCliente } from "../utils/sesion.js";

const CarritoContext = createContext(null);

const LS_KEY = "trego_carrito_v1";

function leerLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function guardarLS(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function tieneSesion() {
  return !!localStorage.getItem("jwtToken");
}

export function CarritoProvider({ children }) {
  const [items, setItems] = useState(() =>
    tieneSesion() ? [] : leerLS(LS_KEY, []),
  );
  const [carritoDto, setCarritoDto] = useState(null);
  const [restaurante, setRestaurante] = useState(null);

  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [productoEnDetalle, setProductoEnDetalle] = useState(null);
  const [restauranteDelDetalle, setRestauranteDelDetalle] = useState(null);

  const [direccionModalAbierto, setDireccionModalAbierto] = useState(false);
  const [direcciones, setDirecciones] = useState([]);
  const [direccionSeleccionada, setDireccionSeleccionada] = useState(null);

  const [pagoModalAbierto, setPagoModalAbierto] = useState(false);
  const [mensajeCarrito, setMensajeCarrito] = useState(null);
  const [cargandoCarrito, setCargandoCarrito] = useState(false);

  const usarApi = tieneSesion() && esSesionCliente();

  const aplicarCarritoDto = useCallback((dto) => {
    setCarritoDto(dto);
    if (dto) {
      setItems(mapearCarritoDtoAItems(dto));
      if (dto.idRestaurante) {
        setRestaurante((prev) => ({
          idUsuario: dto.idRestaurante,
          nombre: prev?.nombre ?? "Restaurante",
          abierto: prev?.abierto ?? true,
        }));
      }
    } else {
      setItems([]);
      setRestaurante(null);
    }
  }, []);

  const cargarCarritoDesdeApi = useCallback(async () => {
    if (!tieneSesion()) return;
    setCargandoCarrito(true);
    try {
      const dto = await obtenerCarrito();
      aplicarCarritoDto(dto);
    } catch (err) {
      console.warn("[Trego] No se pudo cargar el carrito", err);
    } finally {
      setCargandoCarrito(false);
    }
  }, [aplicarCarritoDto]);

  const cargarDireccionesDesdeApi = useCallback(async () => {
    if (!tieneSesion()) return;
    try {
      const lista = await obtenerDireccionesGuardadas();
      setDirecciones(lista);
    } catch (err) {
      console.warn("[Trego] No se pudieron cargar direcciones", err);
    }
  }, []);

  useEffect(() => {
    if (tieneSesion() && esSesionCliente()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      cargarCarritoDesdeApi();
      cargarDireccionesDesdeApi();
    }

    function alIniciarSesion() {
      if (tieneSesion() && esSesionCliente()) {
        cargarCarritoDesdeApi();
        cargarDireccionesDesdeApi();
      }
    }

    window.addEventListener("trego-sesion-iniciada", alIniciarSesion);
    return () =>
      window.removeEventListener("trego-sesion-iniciada", alIniciarSesion);
  }, [cargarCarritoDesdeApi, cargarDireccionesDesdeApi]);

  useEffect(() => {
    if (!usarApi) guardarLS(LS_KEY, items);
  }, [items, usarApi]);

  const total = useMemo(() => {
    if (carritoDto?.total != null) return Number(carritoDto.total);
    return items.reduce(
      (acc, it) => acc + (Number(it.precio) || 0) * (Number(it.cantidad) || 0),
      0,
    );
  }, [items, carritoDto]);

  const cantidadTotal = useMemo(
    () => items.reduce((acc, it) => acc + (Number(it.cantidad) || 0), 0),
    [items],
  );

  const modalSuperior = useMemo(() => {
    if (pagoModalAbierto) return "pago";
    if (direccionModalAbierto) return "direccion";
    if (carritoAbierto) return "carrito";
    if (productoEnDetalle) return "detalle";
    return null;
  }, [
    pagoModalAbierto,
    direccionModalAbierto,
    carritoAbierto,
    productoEnDetalle,
  ]);

  function abrirCarrito() {
    setCarritoAbierto(true);
    setMensajeCarrito(null);
    if (tieneSesion()) cargarCarritoDesdeApi();
  }

  function cerrarCarrito() {
    setCarritoAbierto(false);
    setMensajeCarrito(null);
  }

  function abrirDetalleProducto(producto, restauranteInfo) {
    setProductoEnDetalle(producto);
    setRestauranteDelDetalle(restauranteInfo ?? null);
  }

  function cerrarDetalleProducto() {
    setProductoEnDetalle(null);
    setRestauranteDelDetalle(null);
  }

  function abrirModalDireccion() {
    if (tieneSesion()) cargarDireccionesDesdeApi();
    setDireccionModalAbierto(true);
  }

  function cerrarModalDireccion() {
    setDireccionModalAbierto(false);
  }

  function abrirModalPago() {
    setPagoModalAbierto(true);
  }

  function cerrarModalPago() {
    setPagoModalAbierto(false);
  }

  async function vaciarCarrito() {
    if (tieneSesion()) {
      try {
        await eliminarCarritoCompleto();
      } catch (err) {
        console.warn("[Trego] Error al vaciar carrito en servidor", err);
      }
    }
    setItems([]);
    setCarritoDto(null);
    setRestaurante(null);
    setDireccionSeleccionada(null);
  }

  function asegurarRestaurante(restauranteInfo) {
    if (!restauranteInfo?.idUsuario && !restauranteInfo?.idRestaurante)
      return true;
    const id = restauranteInfo.idUsuario ?? restauranteInfo.idRestaurante;
    if (!restaurante?.idUsuario) {
      setRestaurante({
        idUsuario: id,
        nombre: restauranteInfo.nombre,
        abierto: restauranteInfo.abierto,
      });
      return true;
    }
    if (restaurante.idUsuario === id) return true;

    if (tieneSesion()) {
      eliminarCarritoCompleto().catch(() => {});
    }
    setItems([]);
    setCarritoDto(null);
    setDireccionSeleccionada(null);
    setRestaurante({
      idUsuario: id,
      nombre: restauranteInfo.nombre,
      abierto: restauranteInfo.abierto,
    });
    setMensajeCarrito("Se vació el carrito porque cambiaste de restaurante.");
    return true;
  }

  async function agregarProductoAlCarrito(
    { producto, cantidad, comentarios, ingredientesQuitados },
    restauranteInfo,
  ) {
    if (!producto) return;
    asegurarRestaurante(restauranteInfo);

    const idRestaurante =
      restauranteInfo?.idUsuario ??
      restauranteInfo?.idRestaurante ??
      producto.idRestaurante;

    if (tieneSesion()) {
      try {
        const dto = await agregarProductoAlCarritoApi({
          producto,
          cantidad,
          comentarios,
          ingredientesQuitados,
          idRestaurante,
        });
        aplicarCarritoDto(dto);
        if (restauranteInfo) {
          setRestaurante({
            idUsuario: idRestaurante,
            nombre: restauranteInfo.nombre,
            abierto: restauranteInfo.abierto,
          });
        }
      } catch (err) {
        setMensajeCarrito(err.message ?? "No se pudo agregar al carrito");
        throw err;
      }
    } else {
      const id = producto.idProducto;
      setItems((prev) => {
        const idx = prev.findIndex((p) => p.idProducto === id);
        if (idx >= 0) {
          const copia = [...prev];
          copia[idx] = {
            ...copia[idx],
            cantidad: (copia[idx].cantidad ?? 1) + (cantidad ?? 1),
            comentarios: comentarios ?? copia[idx].comentarios ?? "",
            ingredientesQuitados:
              ingredientesQuitados ?? copia[idx].ingredientesQuitados ?? [],
          };
          return copia;
        }
        return [
          ...prev,
          {
            idProducto: producto.idProducto,
            nombre: producto.nombre,
            precio: producto.precio,
            fotoPlato: producto.fotoPlato,
            ingredientes: producto.ingredientes ?? [],
            cantidad: cantidad ?? 1,
            comentarios: comentarios ?? "",
            ingredientesQuitados: ingredientesQuitados ?? [],
          },
        ];
      });
      setRestaurante({
        idUsuario: idRestaurante,
        nombre: restauranteInfo?.nombre,
        abierto: restauranteInfo?.abierto,
      });
    }

    setMensajeCarrito(null);
  }

  async function eliminarProducto(idProducto) {
    if (tieneSesion()) {
      try {
        const item = items.find((i) => i.idProducto === idProducto);
        const dto = await eliminarProductoDelCarrito(idProducto, item);
        aplicarCarritoDto(dto);
      } catch (err) {
        setMensajeCarrito(err.message ?? "No se pudo eliminar el producto");
      }
      return;
    }
    setItems((prev) => prev.filter((it) => it.idProducto !== idProducto));
  }

  async function cambiarCantidad(idProducto, nuevaCantidad) {
    const cantidad = Math.max(0, Number(nuevaCantidad) || 0);

    if (tieneSesion()) {
      const item = items.find((i) => i.idProducto === idProducto);
      try {
        await modificarProductoEnCarrito({
          producto: item ?? { idProducto, precio: 0 },
          cantidad,
          comentarios: item?.comentarios,
          ingredientesQuitados: item?.ingredientesQuitados,
          idRestaurante: restaurante?.idUsuario ?? carritoDto?.idRestaurante,
        });
        await cargarCarritoDesdeApi();
      } catch (err) {
        setMensajeCarrito(err.message ?? "No se pudo actualizar la cantidad");
      }
      return;
    }

    setItems((prev) =>
      prev
        .map((it) =>
          it.idProducto === idProducto
            ? { ...it, cantidad: Math.max(1, cantidad) }
            : it,
        )
        .filter((it) => cantidad > 0 && (Number(it.cantidad) || 0) > 0),
    );
  }

  async function cambiarComentarios(idProducto, comentarios) {
    if (tieneSesion()) {
      const item = items.find((i) => i.idProducto === idProducto);
      try {
        await modificarProductoEnCarrito({
          producto: item ?? { idProducto, precio: 0 },
          cantidad: item?.cantidad ?? 1,
          comentarios,
          ingredientesQuitados: item?.ingredientesQuitados,
          idRestaurante: restaurante?.idUsuario ?? carritoDto?.idRestaurante,
        });
        await cargarCarritoDesdeApi();
      } catch (err) {
        setMensajeCarrito(err.message ?? "No se pudo guardar el comentario");
      }
      return;
    }
    setItems((prev) =>
      prev.map((it) =>
        it.idProducto === idProducto
          ? { ...it, comentarios: comentarios ?? "" }
          : it,
      ),
    );
  }

  async function cambiarIngredientesQuitados(idProducto, ingredientesQuitados) {
    const lista = ingredientesQuitados ?? []

    if (tieneSesion()) {
      const item = items.find((i) => i.idProducto === idProducto)
      try {
        await modificarProductoEnCarrito({
          producto: item ?? { idProducto, precio: 0 },
          cantidad: item?.cantidad ?? 1,
          comentarios: item?.comentarios ?? '',
          ingredientesQuitados: lista,
          idRestaurante: restaurante?.idUsuario ?? carritoDto?.idRestaurante,
        })
        await cargarCarritoDesdeApi()
      } catch (err) {
        setMensajeCarrito(err.message ?? 'No se pudieron actualizar los ingredientes')
      }
      return
    }

    setItems((prev) =>
      prev.map((it) =>
        it.idProducto === idProducto
          ? { ...it, ingredientesQuitados: lista }
          : it,
      ),
    )
  }

  async function modificarItemCarrito(idProducto, { cantidad, comentarios, ingredientesQuitados }) {
    const item = items.find((i) => i.idProducto === idProducto)
    if (!item) return

    const nuevaCantidad = Math.max(1, Number(cantidad) || item.cantidad || 1)
    const nuevosComentarios = comentarios ?? ''
    const nuevosQuitados = ingredientesQuitados ?? []

    if (tieneSesion()) {
      try {
        await modificarProductoEnCarrito({
          producto: item,
          cantidad: nuevaCantidad,
          comentarios: nuevosComentarios,
          ingredientesQuitados: nuevosQuitados,
          idRestaurante: restaurante?.idUsuario ?? carritoDto?.idRestaurante,
        })
        await cargarCarritoDesdeApi()
      } catch (err) {
        setMensajeCarrito(err.message ?? 'No se pudo guardar los cambios')
        throw err
      }
      return
    }

    setItems((prev) =>
      prev.map((it) =>
        it.idProducto === idProducto
          ? {
              ...it,
              cantidad: nuevaCantidad,
              comentarios: nuevosComentarios,
              ingredientesQuitados: nuevosQuitados,
            }
          : it,
      ),
    )
  }

  function direccionParaBackend() {
    if (!direccionSeleccionada) return null;
    if (direccionSeleccionada.tipo === "guardada") {
      return direccionSeleccionada.datos;
    }
    if (direccionSeleccionada.datos) {
      return direccionSeleccionada.datos;
    }
    const { latitud, longitud } = direccionSeleccionada.coords ?? {};
    return {
      calle: "Ubicación actual",
      numero: 0,
      apartamento: 0,
      esquina: "",
      latitud: latitud ?? 0,
      longitud: longitud ?? 0,
    };
  }

  async function confirmarPedidoYpagar() {
    if (!tieneSesion()) {
      throw new Error("Tenés que iniciar sesión para realizar el pedido.");
    }
    if (!carritoDto || items.length === 0) {
      throw new Error("El carrito está vacío.");
    }
    const direccion = direccionParaBackend();
    if (!direccion) {
      throw new Error("Seleccioná una dirección de envío.");
    }

    const preferencia = await confirmarPedido({
      carrito: carritoDto,
      direccion,
      restauranteId: restaurante?.idUsuario ?? carritoDto.idRestaurante,
    });

    return preferencia;
  }

  const validarRestauranteAbierto = useCallback(
    (estadoAbierto) => {
      if (typeof estadoAbierto === "boolean") {
        setRestaurante((prev) => {
          if (!prev) return prev;
          if (prev.abierto === estadoAbierto) return prev;
          return { ...prev, abierto: estadoAbierto };
        });
        return estadoAbierto;
      }
      return restaurante?.abierto ?? true;
    },
    [restaurante?.abierto],
  );

  const value = {
    items,
    carritoDto,
    total,
    cantidadTotal,
    restaurante,
    carritoAbierto,
    productoEnDetalle,
    restauranteDelDetalle,
    direccionModalAbierto,
    direcciones,
    direccionSeleccionada,
    pagoModalAbierto,
    mensajeCarrito,
    modalSuperior,
    cargandoCarrito,
    usarApi,

    abrirCarrito,
    cerrarCarrito,
    abrirDetalleProducto,
    cerrarDetalleProducto,
    abrirModalDireccion,
    cerrarModalDireccion,
    abrirModalPago,
    cerrarModalPago,
    setDireccionSeleccionada,
    setMensajeCarrito,
    vaciarCarrito,
    agregarProductoAlCarrito,
    eliminarProducto,
    cambiarCantidad,
    cambiarComentarios,
    cambiarIngredientesQuitados,
    modificarItemCarrito,
    validarRestauranteAbierto,
    cargarCarritoDesdeApi,
    cargarDireccionesDesdeApi,
    confirmarPedidoYpagar,
  };

  return (
    <CarritoContext.Provider value={value}>{children}</CarritoContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCarrito() {
  const ctx = useContext(CarritoContext);
  if (!ctx) throw new Error("useCarrito debe usarse dentro de CarritoProvider");
  return ctx;
}
