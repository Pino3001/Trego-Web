import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "./pages/HomePage";
import RestauranteMenuPage from "./pages/RestauranteMenuPage";
import LoginCliente from "./pages/logins/LoginCliente.js";
import SeleccionarRol from "./pages/SeleccionarRol.js";
import LoginRestaurante from "./pages/restaurantes/LoginRestaurante.js";
import LoginAdmin from "./pages/logins/LoginAdmin.js";
import SolicitarAltaRestaurante from "./pages/restaurantes/SolicitarAltaRestaurante.js";
import RegistrarRestaurante from "./pages/restaurantes/RegistrarRestaurante.js";
import CarritoUIRoot from "./components/carrito/CarritoUIRoot.jsx";
import AltaProducto from "./pages/restaurantes/AltaProducto.js";
import ListarSinConfirmar from "./pages/restaurantes/ListarSinConfirmar.js";
import RestauranteLayout from "./pages/restaurantes/RestauranteLayout.js";

export default function AppRouter() {
import { BrowserRouter, Routes, Route } from 'react-router'
import HomePage from './pages/HomePage'
import RestauranteMenuPage from './pages/RestauranteMenuPage'
import LoginCliente from './pages/logins/LoginCliente.js'
import SeleccionarRol from './pages/SeleccionarRol.js'
import LoginRestaurante from './pages/restaurantes/LoginRestaurante.js'
import LoginAdmin from './pages/logins/LoginAdmin.js'
import SolicitarAltaRestaurante from './pages/restaurantes/SolicitarAltaRestaurante.js'
import RegistrarRestaurante from './pages/restaurantes/RegistrarRestaurante.js'
import GestionRestaurantesPage from './pages/admin/GestionRestaurantesPage.js'
import CarritoUIRoot from './components/carrito/CarritoUIRoot.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- RUTAS PÚBLICAS O SIN LAYOUT --- */}
        <Route path="/" element={<SeleccionarRol />} />
        <Route path="/login/cliente" element={<LoginCliente />} />
        <Route path="/login/Restaurante" element={<LoginRestaurante />} />
        <Route path="/login/Administrador" element={<LoginAdmin />} />
        <Route path="/restaurante/:id" element={<RestauranteMenuPage />} />
        <Route path="/restaurantes" element={<HomePage />} />
        <Route
          path="/restaurantes/registrarRestaurante"
          element={<RegistrarRestaurante />}
        />

        {/* --- RUTAS PRIVADAS (ENVUELTAS EN EL LAYOUT) --- */}
        {/* Este Route padre inyecta el Header y Sidebar. Los hijos se renderizan en el <Outlet /> todo lo que lleve la barra lateral de restaurante debe ir dentro de este Route*/}
        <Route element={<RestauranteLayout />}>
          <Route
            path="/restaurantes/solicitarAlta"
            element={<SolicitarAltaRestaurante />}
          />
          <Route path="/restaurantes/altaProducto" element={<AltaProducto />} />
          <Route
            path="/ListarPedidosSinConfirmar"
            element={<ListarSinConfirmar />}
          />
        </Route>
        <Route path="/restaurantes/solicitarAlta" element={<SolicitarAltaRestaurante />} />
        <Route path="/restaurantes/registrarRestaurante" element={<RegistrarRestaurante />} />
        <Route path="/admin/restaurantes" element={<GestionRestaurantesPage />} />

      </Routes>
      <CarritoUIRoot />
    </BrowserRouter>
  );
}
