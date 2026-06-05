/* import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";
import Header from "../../components/body/Header.js";
import AdminSidebar from "../../components/body/AdminSidebar.js";
import { administradorApi } from "../../api/administradorApi.js";

export default function AdminLayout() {
  const token = localStorage.getItem("jwtToken");
  const [pendientesCount, setPendientesCount] = useState(0);

  useEffect(() => {
    if (!token) return;

    administradorApi
      .obtenerRestaurantesPendientes()
      .then((lista) => setPendientesCount(lista.length))
      .catch(() => setPendientesCount(0));
  }, [token]);

  if (!token) {
    return <Navigate to="/login/Administrador" replace />;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50 overflow-hidden">
      <Header tipoUser="Administrador" />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar pendientesCount={pendientesCount} />
        <main className="flex-1 flex flex-col overflow-y-auto relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
 */