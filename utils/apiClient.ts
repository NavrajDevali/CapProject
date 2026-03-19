import { APIRequestContext } from '@playwright/test';

export class ApiClient {
  constructor(
    protected request: APIRequestContext,
    protected base:  string = '',
    protected token: string = ''
  ) {}

  // Build auth header only if token exists
  private headers() {
    return this.token
      ? { Authorization: `Bearer ${this.token}` }
      : {};
  }

  get(path: string, opts?: any) {
    return this.request.get(this.base + path, {
      ...opts,
      headers: { ...this.headers(), ...opts?.headers },
    });
  }

  post(path: string, data?: any) {
    return this.request.post(this.base + path, {
      data,
      headers: this.headers(),
    });
  }

  put(path: string, data?: any) {
    return this.request.put(this.base + path, {
      data,
      headers: this.headers(),
    });
  }

  patch(path: string, data?: any) {
    return this.request.patch(this.base + path, {
      data,
      headers: this.headers(),
    });
  }

  delete(path: string) {
    return this.request.delete(this.base + path, {
      headers: this.headers(),
    });
  }
}

// Users API
export class UsersApi extends ApiClient {
  getAll()                             { return super.get('/users'); }
  getById(id: number)                  { return super.get(`/users/${id}`); }
  create(user: any)                    { return this.post('/users/add', user); }
  update(id: number, user: any)        { return this.put(`/users/${id}`, user); }
  partialUpdate(id: number, data: any) { return super.patch(`/users/${id}`, data); }
  remove(id: number)                   { return this.delete(`/users/${id}`); }
  search(q: string)                    { return super.get(`/users/search?q=${q}`); }
}

// Products API
export class ProductsApi extends ApiClient {
  getAll(params?: any)                 { return super.get('/products', { params }); }
  getById(id: number)                  { return super.get(`/products/${id}`); }
  create(product: any)                 { return this.post('/products/add', product); }
  update(id: number, product: any)     { return this.put(`/products/${id}`, product); }
  partialUpdate(id: number, data: any) { return super.patch(`/products/${id}`, data); }
  remove(id: number)                   { return this.delete(`/products/${id}`); }
  search(q: string)                    { return super.get(`/products/search?q=${q}`); }
  getByCategory(category: string)      { return super.get(`/products/category/${category}`); }
}
