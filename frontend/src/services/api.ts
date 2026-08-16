const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export interface Category {
  id: number;
  name: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  archived: boolean;
  categories: Category[];
}

export interface AuthResponse {
  token: string;
  username: string;
}

// ─── Auth helpers ──────────────────────────────────────────────────────────────
export const getToken    = () => localStorage.getItem('token');
export const getUsername = () => localStorage.getItem('username');
export const isLoggedIn  = () => !!getToken();

export const storeAuth = (token: string, username: string) => {
  localStorage.setItem('token', token);
  localStorage.setItem('username', username);
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
};

// Callback that App.tsx can set so api can trigger logout on 401/403
let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedCallback = (cb: () => void) => { onUnauthorized = cb; };

const authHeaders = (): Record<string, string> => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, options);
  if (res.status === 401 || res.status === 403) {
    clearAuth();
    onUnauthorized?.();
    throw new Error('Session expired. Please log in again.');
  }
  if (!res.ok) {
    let msg = `Request failed: ${res.status}`;
    try { const body = await res.json(); msg = body.error || body.message || msg; } catch { /* ignore */ }
    throw new Error(msg);
  }
  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── API ──────────────────────────────────────────────────────────────────────
export const api = {
  // Auth
  login: (username: string, password: string) =>
    request<AuthResponse>(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }),

  register: (username: string, password: string) =>
    request<AuthResponse>(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }),

  // Categories
  getCategories: () =>
    request<Category[]>(`${API_BASE_URL}/categories`, { headers: authHeaders() }),

  createCategory: (name: string) =>
    request<Category>(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ name }),
    }),

  deleteCategory: (id: number) =>
    request<void>(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }),

  // Notes
  getActiveNotes: (categoryId?: number) =>
    request<Note[]>(
      categoryId
        ? `${API_BASE_URL}/notes/active?categoryId=${categoryId}`
        : `${API_BASE_URL}/notes/active`,
      { headers: authHeaders() }
    ),

  getArchivedNotes: (categoryId?: number) =>
    request<Note[]>(
      categoryId
        ? `${API_BASE_URL}/notes/archived?categoryId=${categoryId}`
        : `${API_BASE_URL}/notes/archived`,
      { headers: authHeaders() }
    ),

  createNote: (title: string, content: string, categoryIds: number[]) =>
    request<Note>(`${API_BASE_URL}/notes`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ title, content, categoryIds }),
    }),

  updateNote: (id: number, title: string, content: string, categoryIds: number[]) =>
    request<Note>(`${API_BASE_URL}/notes/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ title, content, categoryIds }),
    }),

  deleteNote: (id: number) =>
    request<void>(`${API_BASE_URL}/notes/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }),

  archiveNote: (id: number) =>
    request<Note>(`${API_BASE_URL}/notes/${id}/archive`, {
      method: 'POST',
      headers: authHeaders(),
    }),

  unarchiveNote: (id: number) =>
    request<Note>(`${API_BASE_URL}/notes/${id}/unarchive`, {
      method: 'POST',
      headers: authHeaders(),
    }),
};
