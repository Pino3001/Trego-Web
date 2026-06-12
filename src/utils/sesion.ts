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

export function guardarSesion(token: string, rol: string) {
  localStorage.setItem("jwtToken", token);
  if (rol) {
    localStorage.setItem("jwtRol", rol.trim());
  }
  console.log(
    "Sesión guardada -> Token:",
    localStorage.getItem("jwtToken"),
    "Rol:",
    localStorage.getItem("jwtRol"),
  );
}

export function limpiarSesion() {
  const tokenAntes = localStorage.getItem("jwtToken");
  const rolAntes = localStorage.getItem("jwtRol");
  console.log(
    "Limpiando sesión. Antes -> Token:",
    tokenAntes,
    "Rol:",
    rolAntes,
  );

  localStorage.removeItem("jwtToken");
  localStorage.removeItem("jwtRol");

  console.log(
    "Después de limpiar -> Token:",
    localStorage.getItem("jwtToken"),
    "Rol:",
    localStorage.getItem("jwtRol"),
  );
}

export function redirigirAlLogin(userType: string | null) {
  // Limpiamos espacios por seguridad
  const rolLimpio = userType?.trim();
  console.log("El usuario es:", rolLimpio);

  let loginPath = "/login/cliente";

  if (rolLimpio === "Administrador") {
    loginPath = "/login/Administrador";
  } else if (rolLimpio === "Restaurante") {
    loginPath = "/login/Restaurante";
  }

  console.log("El path es:", loginPath);
  window.location.href = loginPath;
}

export function esSesionCliente() {
  return getRolSesion() === "Cliente";
}
