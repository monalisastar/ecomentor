// src/lib/api.ts
/**
 * Universal API request helper for the LMS.
 * Supports both JSON and multipart form data (when isMultipart = true).
 * Works in both client and server components.
 */

export async function apiRequest<T = any>(
  endpoint: string,
  method: string = "GET",
  data?: any,
  isMultipart: boolean = false
): Promise<T> {
  try {
    const url = endpoint.startsWith("/api/") ? endpoint : `/api/${endpoint}`;

    const headers: HeadersInit = {};
    if (!isMultipart) headers["Content-Type"] = "application/json";

    const options: RequestInit = {
      method,
      headers,
      credentials: "include", // ✅ ensures session cookies
      body: isMultipart ? data : data ? JSON.stringify(data) : undefined,
    };

    const res = await fetch(url, options);
    const result = await res.json().catch(() => null);

    if (!res.ok) {
      const message =
        (result && (result.error || result.message)) ||
        `API Error: ${res.status}`;
      throw new Error(message);
    }

    return result;
  } catch (error: any) {
    console.error("API request failed:", error);
    throw new Error(error.message || "Network or server error");
  }
}

/**
 * Convenience CRUD methods for standard JSON requests.
 */
export const api = {
  get: (endpoint: string) => apiRequest(endpoint, "GET"),
  post: (endpoint: string, data?: any) => apiRequest(endpoint, "POST", data),
  put: (endpoint: string, data?: any) => apiRequest(endpoint, "PUT", data),
  del: (endpoint: string, data?: any) => apiRequest(endpoint, "DELETE", data),
};
