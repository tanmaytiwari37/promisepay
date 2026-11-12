const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function apiClient(endpoint, options = {}) {
  const token = sessionStorage.getItem('token');
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...authHeaders,
    ...options.headers,
  };

  // Only set Content-Type for non-FormData requests (let browser set boundary for FormData)
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    let errorMessage;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || JSON.stringify(errorData);
    } catch {
      errorMessage = await response.text();
    }
    throw new Error(errorMessage || `Request failed with status ${response.status}`);
  }

  // Handle empty responses
  const contentType = response.headers.get('content-type') || '';
  if (response.status === 204 || !contentType.includes('application/json')) {
    return null;
  }

  return response.json();
}

export default apiClient;
