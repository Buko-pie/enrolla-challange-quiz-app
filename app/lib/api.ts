// utils for consistent fetch url
const API_BASE = '/api'

export const apiClient = {
  get: (endpoint: string) => fetch(`${API_BASE}${endpoint}`),
  post: (endpoint: string, data: any) => fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  delete: (endpoint: string) => fetch(`${API_BASE}${endpoint}`, {
    method: 'DELETE'
  })
}
