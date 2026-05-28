export const fetchSinAuth = async (
  endpoint: string,
  options: RequestInit = {},
) => {
  const headers = new Headers(options.headers || {});

  // Solo ponemos Content-Type si hay body, sin tocar Authorization
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const url = endpoint;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
};
