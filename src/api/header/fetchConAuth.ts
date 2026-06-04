import { limpiarSesion } from "../../utils/sesion.js";

export const fetchConAuth = async (
  endpoint: string,
  options: RequestInit & { redirectOnUnauthorized?: boolean } = {},
) => {
  const { redirectOnUnauthorized = true, ...fetchOptions } = options;
  const token = localStorage.getItem("jwtToken");

  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const url = endpoint;

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (response.status === 401 && redirectOnUnauthorized) {
    console.error("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
    limpiarSesion();
    const path = window.location.pathname;
    if (path.startsWith("/admin")) {
      window.location.href = "/login/Administrador";
    } else if (path.startsWith("/restaurantes")) {
      window.location.href = "/login/Restaurante";
    } else {
      window.location.href = "/login/cliente";
    }
  }

  return response;
};
