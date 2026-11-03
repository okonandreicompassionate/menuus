const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') || '';

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${apiBaseUrl}${normalizedPath}`;
}

export async function readApiResponse<T>(response: Response): Promise<T> {
  const responseText = await response.text();
  let payload: { error?: string } | T | null = null;

  if (responseText) {
    try {
      payload = JSON.parse(responseText) as T;
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const errorMessage = payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
      ? payload.error
      : `The server returned an unexpected response (${response.status}).`;
    throw new Error(errorMessage || 'The server could not complete the request.');
  }

  if (response.status === 204) return undefined as T;
  if (payload === null) {
    throw new Error('The server returned an empty or invalid response. Check that the API server is running.');
  }
  return payload as T;
}
