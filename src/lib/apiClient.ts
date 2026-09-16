import { getCurrentIdToken } from './firebase';

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const makeRequest = async (forceRefresh = false) => {
    const token = await getCurrentIdToken(forceRefresh);
    const headers = new Headers(init.headers || {});
    if (token) headers.set('Authorization', `Bearer ${token}`);
    if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    return fetch(input, { ...init, headers });
  };

  const response = await makeRequest(false);
  if (response.status !== 401) return response;

  // Firebase ID tokens expire. Refresh once and retry the exact request so a
  // long-open report form does not fail simply because the token aged out.
  const refreshedResponse = await makeRequest(true);
  return refreshedResponse;
}
