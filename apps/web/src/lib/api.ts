import { UserRole } from '@velora/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface UserSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  role: UserRole;
  status: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    user: UserSession;
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      tokenType: string;
    };
  };
}

export class ApiError extends Error {
  statusCode: number;
  details?: any;

  constructor(message: string, statusCode: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  let token: string | null = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('velora_access_token');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const errorMessage =
      Array.isArray(data?.message)
        ? data.message.join(', ')
        : data?.message || data?.error || `HTTP error ${res.status}`;
    throw new ApiError(errorMessage, res.status, data);
  }

  return data as T;
}

export const authApi = {
  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const res = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (typeof window !== 'undefined' && res?.data?.tokens) {
      localStorage.setItem('velora_access_token', res.data.tokens.accessToken);
      localStorage.setItem('velora_refresh_token', res.data.tokens.refreshToken);
      localStorage.setItem('velora_user', JSON.stringify(res.data.user));
    }

    return res;
  },

  async register(payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    role: UserRole;
  }): Promise<AuthResponse> {
    const res = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (typeof window !== 'undefined' && res?.data?.tokens) {
      localStorage.setItem('velora_access_token', res.data.tokens.accessToken);
      localStorage.setItem('velora_refresh_token', res.data.tokens.refreshToken);
      localStorage.setItem('velora_user', JSON.stringify(res.data.user));
    }

    return res;
  },

  async getMe() {
    return apiRequest<{ success: boolean; data: UserSession }>('/auth/me');
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('velora_access_token');
      localStorage.removeItem('velora_refresh_token');
      localStorage.removeItem('velora_user');
      window.location.href = '/login';
    }
  },

  getCurrentUser(): UserSession | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('velora_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as UserSession;
    } catch {
      return null;
    }
  },
};

export const catalogApi = {
  async getCategories(includeInactive = false) {
    return apiRequest<{ success: boolean; data: any[] }>(
      `/catalog/categories${includeInactive ? '?includeInactive=true' : ''}`
    );
  },

  async getServices(params?: {
    categoryId?: string;
    search?: string;
    deliveryType?: string;
    salonId?: string;
    providerId?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.categoryId) searchParams.set('categoryId', params.categoryId);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.deliveryType) searchParams.set('deliveryType', params.deliveryType);
    if (params?.salonId) searchParams.set('salonId', params.salonId);
    if (params?.providerId) searchParams.set('providerId', params.providerId);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const qs = searchParams.toString();
    return apiRequest<{
      success: boolean;
      data: any[];
      meta: { page: number; limit: number; total: number; totalPages: number };
    }>(`/catalog/services${qs ? `?${qs}` : ''}`);
  },

  async getServiceBySlug(slug: string) {
    return apiRequest<{ success: boolean; data: any }>(`/catalog/services/slug/${slug}`);
  },

  async getPackages() {
    return apiRequest<{ success: boolean; data: any[] }>('/catalog/packages');
  },

  async getSalonServices(salonId: string) {
    return apiRequest<{ success: boolean; data: any[] }>(`/catalog/salons/${salonId}/services`);
  },
};

export const availabilityApi = {
  async getSlots(params: {
    serviceId: string;
    date: string;
    deliveryType: 'SALON' | 'HOME';
    salonId?: string;
    providerId?: string;
  }) {
    const searchParams = new URLSearchParams();
    searchParams.set('serviceId', params.serviceId);
    searchParams.set('date', params.date);
    searchParams.set('deliveryType', params.deliveryType);
    if (params.salonId) searchParams.set('salonId', params.salonId);
    if (params.providerId) searchParams.set('providerId', params.providerId);

    return apiRequest<{
      success: boolean;
      data: {
        date: string;
        dayOfWeek: string;
        service: {
          id: string;
          name: string;
          durationMinutes: number;
          basePrice: number;
        };
        deliveryType: string;
        totalSlots: number;
        slots: Array<{
          startTime: string;
          endTime: string;
          providerId: string;
          providerName: string;
          salonId?: string;
          salonName?: string;
          deliveryType: string;
          availableChairs?: number;
        }>;
      };
    }>(`/availability/slots?${searchParams.toString()}`);
  },

  async getProviderSchedule(providerId: string) {
    return apiRequest<{ success: boolean; data: any }>(`/availability/schedules/${providerId}`);
  },

  async getSalonCapacity(salonId: string, date: string) {
    return apiRequest<{ success: boolean; data: any }>(
      `/availability/salon-capacity/${salonId}?date=${date}`
    );
  },
};

