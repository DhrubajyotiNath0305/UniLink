export class ApiError extends Error {
  constructor(status, message, code, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function request(path, { method = "GET", body } = {}) {
  const options = { method, headers: {} };

  if (body !== undefined) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  const res = await fetch(path, options);

  let json;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok || !json?.success) {
    throw new ApiError(
      res.status,
      json?.error?.message || "Something went wrong",
      json?.error?.code || "ERROR",
      json?.error?.details
    );
  }

  return json.data;
}