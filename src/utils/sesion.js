/** Rol y token de sesión (admin / restaurante / cliente). */

export function getRolSesion() {
  const stored = localStorage.getItem("jwtRol");
  if (stored) return stored;

  const token = localStorage.getItem("jwtToken");
  if (!token) return null;

  try {
    const base64 = token.split(".")[1]?.replace(/-/g, "+").replace(/_/g, "/");
    if (!base64) return null;
    const payload = JSON.parse(atob(base64));
    return payload.rol ?? payload.role ?? null;
  } catch {
    return null;
  }
}

export function guardarSesion(token, rol) {
  localStorage.setItem("jwtToken", token);
  if (rol) localStorage.setItem("jwtRol", rol);
}

export function limpiarSesion() {
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("jwtRol");
}

export function esSesionCliente() {
  return getRolSesion() === "Cliente";
}
