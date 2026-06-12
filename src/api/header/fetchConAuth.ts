import { limpiarSesion, redirigirAlLogin } from "../../utils/sesion.js";

let isRedirecting = false;

export const fetchConAuth = async (
  endpoint: string,
  options: RequestInit & { redirectOnUnauthorized?: boolean } = {},
) => {
  const { redirectOnUnauthorized = true, ...fetchOptions } = options;
  const token = localStorage.getItem("jwtToken");

  // Si no hay token y la redirección está activa, enviamos al login adecuado
  if (!token && redirectOnUnauthorized) {
    if (!isRedirecting) {
      isRedirecting = true;
      const userType = localStorage.getItem("jwtRol");
      console.warn("No hay sesión activa. Redirigiendo al login.");
      redirigirAlLogin(userType);
    }
    return new Response(null, { status: 401 });
  }

  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(endpoint, {
    ...fetchOptions,
    headers,
  });

  if (response.status === 401 && redirectOnUnauthorized) {
    // Solo la primera petición que falle ejecutará este bloque
    if (!isRedirecting) {
      isRedirecting = true;
      const userType = localStorage.getItem("jwtRol");
      console.error("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
      
      redirigirAlLogin(userType);
      
      limpiarSesion();
    }
    return response;
  }

  return response;
};