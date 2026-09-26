export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is required. Configure it before building the frontend.");
}

try {
  const apiUrl = new URL(API_BASE_URL);
  const localHttp = ["localhost", "127.0.0.1", "[::1]"].includes(apiUrl.hostname);
  if (!['https:', ...(localHttp ? ["http:"] : [])].includes(apiUrl.protocol)) throw new Error("must use HTTPS outside local development");
} catch (error) {
  throw new Error(`Invalid VITE_API_BASE_URL: ${error.message}`);
}
