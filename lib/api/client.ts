/**
 * API Client
 *
 * Typed fetch wrapper for making API calls.
 * Replaces axios with native fetch for smaller bundle.
 */

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message?: string
  ) {
    super(message || `API Error: ${status} ${statusText}`);
    this.name = "ApiError";
  }
}

type FetchOptions = Omit<RequestInit, "body" | "method">;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = await response.text();
    let message: string | undefined;
    try {
      const json = JSON.parse(errorBody);
      message = json.error || json.message;
    } catch {
      message = errorBody;
    }
    throw new ApiError(response.status, response.statusText, message);
  }

  // Handle empty responses
  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  return JSON.parse(text);
}

/**
 * Make a GET request
 */
export async function get<T>(url: string, options?: FetchOptions): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });
  return handleResponse<T>(response);
}

/**
 * Make a POST request
 */
export async function post<T>(url: string, data?: unknown, options?: FetchOptions): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
  return handleResponse<T>(response);
}

/**
 * Make a PUT request
 */
export async function put<T>(url: string, data?: unknown, options?: FetchOptions): Promise<T> {
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
  return handleResponse<T>(response);
}

/**
 * Make a DELETE request
 */
export async function del<T>(url: string, options?: FetchOptions): Promise<T> {
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });
  return handleResponse<T>(response);
}

/**
 * API client object for convenience
 */
export const api = {
  get,
  post,
  put,
  delete: del,
};
