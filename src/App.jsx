import { BrowserRouter, Route, Routes } from "react-router";
import SeleccionarRol from "./pages/SeleccionarRol.js";
import LoginCliente from "./pages/logins/LoginCliente.js";
import LoginRestaurante from "./pages/restaurantes/screens/LoginRestaurante.js";
import LoginAdmin from "./pages/logins/LoginAdmin.js";
import RegistrarRestaurante from "./pages/restaurantes/screens/RegistrarRestaurante.js";
import PagoExito from "./pages/pago/PagoExito.jsx";
import PagoError from "./pages/pago/PagoError.jsx";
import PagoPendiente from "./pages/pago/PagoPendiente.jsx";
import RestauranteLayout from "./pages/restaurantes/RestauranteLayout.js";
import SolicitarAltaRestaurante from "./pages/restaurantes/screens/SolicitarAltaRestaurante.js";
import AltaProducto from "./pages/restaurantes/screens/AltaProducto.js";
import ListarSinConfirmar from "./pages/restaurantes/screens/ListarSinConfirmar.js";
import ListarEnPreparacion from "./pages/restaurantes/screens/ListarEnPreparacion.js";
import ListarEnCamino from "./pages/restaurantes/screens/ListarEnCamino.js";
import ListarEntregados from "./pages/restaurantes/screens/ListarEntregados.js";
import ListarCancelados from "./pages/restaurantes/screens/ListarCancelados.js";
import GestionRestaurantesPage from "./pages/admin/screens/GestionRestaurantesPage.js";
import ListarRestaurantesPage from "./pages/admin/screens/ListarRestaurantesPage.js";
import ListarClientesPage from "./pages/admin/screens/ListarClientesPage.js";
import AdministradorLayaut from "./pages/admin/AdministradorLayaut.js";
import RestauranteMenuPage from "./pages/cliente/screens/RestauranteMenuPage.jsx";
import HomePage from "./pages/cliente/screens/HomePage.jsx";
import HistorialPage from "./pages/cliente/screens/HistorialPage.jsx";
import ClienteLayaut from "./pages/cliente/ClienteLayaut.js";
import { CarritoProvider } from "./context/CarritoContext.jsx";
import { FiltrosUIProvider } from "./context/FiltrosContext.js";
import { BusquedaProvider } from "./context/BusquedaContext.js";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- RUTAS PÚBLICAS O SIN LAYOUT --- */}
        <Route path="/" element={<SeleccionarRol />} />
        <Route path="/login/cliente" element={<LoginCliente />} />
        <Route path="/login/Restaurante" element={<LoginRestaurante />} />
        <Route path="/login/Administrador" element={<LoginAdmin />} />
        <Route
          path="/restaurantes/registrarRestaurante"
          element={<RegistrarRestaurante />}
        />

        {/* --- RUTAS DE RETORNO MERCADO PAGO --- */}
        <Route path="/success" element={<PagoExito />} />
        <Route path="/failure" element={<PagoError />} />
        <Route path="/pending" element={<PagoPendiente />} />

        {/* --- RUTAS PRIVADAS (ENVUELTAS EN EL LAYOUT) --- */}
        {/* Este Route padre inyecta el Header y Sidebar. Los hijos se renderizan en el <Outlet /> todo lo que lleve la barra lateral de restaurante debe ir dentro de este Route*/}
        <Route element={<RestauranteLayout />}>
          <Route
            path="/restaurantes/solicitarAlta"
            element={<SolicitarAltaRestaurante />}
          />
          <Route path="/restaurantes/altaProducto" element={<AltaProducto />} />
          <Route
            path="/restaurantes/ListarPedidosSinConfirmar"
            element={<ListarSinConfirmar />}
          />
          <Route
            path="/restaurantes/Listar-en-preparacion"
            element={<ListarEnPreparacion />}
          />
          <Route
            path="/restaurantes/Listar-en-camino"
            element={<ListarEnCamino />}
          />
          <Route
            path="/restaurantes/pedidos-entregados"
            element={<ListarEntregados />}
          />
          <Route
            path="/restaurantes/pedidos-cancelados"
            element={<ListarCancelados />}
          />
          <Route
            path="/restaurantes/solicitarAlta"
            element={<SolicitarAltaRestaurante />}
          />
        </Route>

        {/* --- RUTAS ADMIN (LAYOUT CON SIDEBAR) --- */}
        <Route element={<AdministradorLayaut />}>
          <Route
            path="/admin/restaurantes"
            element={<GestionRestaurantesPage />}
          />
          <Route
            path="/admin/restaurantes/todos"
            element={<ListarRestaurantesPage />}
          />
          <Route path="/admin/clientes" element={<ListarClientesPage />} />
        </Route>

        {/*--- Rutas Cliente--- */}
        <Route
          element={
            <CarritoProvider>
              <FiltrosUIProvider>
                <BusquedaProvider>
                  <ClienteLayaut />
                </BusquedaProvider>
              </FiltrosUIProvider>
            </CarritoProvider>
          }
        >
          <Route path="/restaurante/:id" element={<RestauranteMenuPage />} />
          <Route path="/restaurantes" element={<HomePage />} />
          <Route path="/Historial" element={<HistorialPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
