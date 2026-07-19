export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL && import.meta.env.DEV) {
  console.warn(
    "[env] VITE_API_BASE_URL is not set — API requests will fail. " +
      "Copy frontend/.env.example to frontend/.env and set it.",
  );
}
