export const sendSuccess = (res, data, message, status = 200) =>
  res.status(status).json({ success: true, data, message });

export const sendError = (res, message, status = 500, errorCode = null) =>
  res.status(status).json({
    success: false,
    data: null,
    message,
    statusCode: status,
    ...(errorCode && { errorCode }),
  });

export const sendNoContent = (res) => res.status(204).end();
