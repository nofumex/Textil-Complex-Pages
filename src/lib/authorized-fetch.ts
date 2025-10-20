/**
 * Authorized fetch utility that handles authentication and token refresh
 */

export async function authorizedFetch(
  input: RequestInfo | URL, 
  init?: RequestInit
): Promise<Response> {
  // Try the request with credentials included
  const res = await fetch(input, { 
    ...init, 
    credentials: 'include' 
  });
  
  // If we get a 401, try to refresh the token and retry
  if (res.status === 401) {
    const refreshed = await refreshAuth();
    if (!refreshed) {
      throw new Error('AUTH_REQUIRED');
    }
    // Retry the original request
    return fetch(input, { 
      ...init, 
      credentials: 'include' 
    });
  }
  
  return res;
}

/**
 * Attempts to refresh the authentication token
 */
async function refreshAuth(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/refresh', { 
      method: 'POST', 
      credentials: 'include' 
    });
    const json = await res.json();
    return Boolean(json?.success);
  } catch {
    return false;
  }
}
