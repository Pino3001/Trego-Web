import { Navigate, Outlet, useLocation } from "react-router";
import Header from "../../components/body/Header.js";
import Sidebar from "../../components/body/Sidebar.js";

export default function RestauranteLayout() {
  const location = useLocation();
  
  // 1. Verificamos si hay sesión iniciada
  const token = localStorage.getItem("jwtToken");
  
  // 2. Verificamos si está habilitado
  const isHabilitado = localStorage.getItem("restauranteHabilitado") === "true";

  // --- REGLAS DE SEGURIDAD ---

  // Regla A: Si no hay token, lo mandamos al login.
  if (!token) {
    return <Navigate to="/login/Restaurante" replace />;
  }

  // Regla B: Si NO está habilitado, SOLO puede estar en /solicitarAlta.
  // Si intenta ir a /ListarPedidosSinConfirmar o /altaProducto, lo devolvemos.
  if (!isHabilitado && location.pathname !== "/restaurantes/solicitarAlta") {
    return <Navigate to="/restaurantes/solicitarAlta" replace />;
  }

  // Regla C: Si SÍ está habilitado y por error va a /solicitarAlta, lo mandamos a sus pedidos.
  if (isHabilitado && location.pathname === "/restaurantes/solicitarAlta") {
    return <Navigate to="/ListarPedidosSinConfirmar" replace />;
  }

  // Si pasa todas las reglas, renderizamos la pantalla normal
  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50 overflow-hidden">
      <Header abrirPerfil tipoUser="Restaurante" />
      <div className="flex flex-1 overflow-hidden">
        
        {/* Le pasamos el estado real al Sidebar para que se bloquee visualmente */}
        <Sidebar habilitado={isHabilitado} /> 
        
        <main className="flex-1 flex flex-col overflow-y-auto relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}