export const sendSuccess = (res, data, message, status = 200) =>
  res.status(status).json({ success: true, data, message });

export const sendError = (res, message, status = 500) =>
  res.status(status).json({ success: false, data: null, message });
