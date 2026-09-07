const API_BASE = import.meta.env.VITE_API_URL || '';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('medicare_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  /** Safely parse JSON — throws a friendly error if the server returns HTML */
  private async safeJson(res: Response): Promise<any> {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      // Server returned an HTML page (e.g. 502 Bad Gateway, Vite error page)
      if (!res.ok) {
        throw new Error(`Server error (${res.status}): unable to reach the API. Please try again later.`);
      }
      throw new Error('Unexpected server response — expected JSON.');
    }
  }

  async get<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: this.getHeaders(),
    });
    const data = await this.safeJson(res);
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  }

  async post<T>(path: string, body?: any): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await this.safeJson(res);
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  }

  async patch<T>(path: string, body: any): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    const data = await this.safeJson(res);
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  }

  async put<T>(path: string, body: any): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    const data = await this.safeJson(res);
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  }

  async delete(path: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const data = await this.safeJson(res).catch(() => ({}));
      throw new Error(data.message || 'Delete failed');
    }
  }
}

export const api = new ApiClient(API_BASE);
