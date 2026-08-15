import api from "../services/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

/**
 * Public contact-form submission. Matches the backend's actual Message
 * schema/validator (fullname, email, message, optional honeypot
 * `website` field) — see backend/src/validators/messageValidators.js
 * and backend/src/models/Message.js. The backend does not persist a
 * phone number or a "service interested in" field, so the form UI
 * collects them for UX but the caller is responsible for folding them
 * into `message` before calling `send`.
 */
export const contactApi = {
  send: (payload) => api.post(API_ENDPOINTS.messages, payload).then((res) => res.data),
};
