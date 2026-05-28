export const fetchConAuth = async (
  endpoint: string,
  options: RequestInit = {},
) => {
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
    ...options,
    headers,
  });

  if (response.status === 401) {
    console.error("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
    localStorage.removeItem("jwtToken");
    window.location.href = "/login/cliente";
  }

  return response;
};
