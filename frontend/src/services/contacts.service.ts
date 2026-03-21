import { api } from './api';

export interface Contact {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  source: 'web' | 'api' | 'import';
  status: 'new' | 'contacted' | 'archived';
  ipAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactFormData {
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
}

export interface ContactListParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface ContactListResponse {
  status: string;
  total: number;
  data: Contact[];
}

export const ContactsService = {
  submit: (data: ContactFormData) => api.post('/contacts', data),
  list: (params: ContactListParams) => api.get<ContactListResponse>('/contacts', { params }),
  updateStatus: (id: string, status: string) => api.patch(`/contacts/${id}/status`, { status }),
  exportUrl: (params: ContactListParams): string => {
    const token = localStorage.getItem('access_token');
    const query = new URLSearchParams({
      ...Object.fromEntries(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      ),
      ...(token ? { token } : {}),
    }).toString();
    return `${import.meta.env.VITE_API_URL}/contacts/export?${query}`;
  },
};
