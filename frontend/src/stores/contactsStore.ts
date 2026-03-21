import { create } from 'zustand';
import { ContactsService, Contact, ContactListParams } from '../services/contacts.service';

interface ContactsState {
  contacts: Contact[];
  total: number;
  loading: boolean;
  params: ContactListParams;
  fetch: (overrides?: ContactListParams) => Promise<void>;
  updateStatus: (id: string, status: string) => Promise<void>;
  setParams: (params: ContactListParams) => void;
}

export const useContactsStore = create<ContactsState>((set, get) => ({
  contacts: [],
  total: 0,
  loading: false,
  params: { page: 1, limit: 20 },

  fetch: async (overrides = {}) => {
    set({ loading: true });
    try {
      const merged = { ...get().params, ...overrides };
      set({ params: merged });
      const { data } = await ContactsService.list(merged);
      set({ contacts: data.data, total: data.total });
    } finally {
      set({ loading: false });
    }
  },

  updateStatus: async (id: string, status: string) => {
    await ContactsService.updateStatus(id, status);
    set((state) => ({
      contacts: state.contacts.map((c) =>
        c.id === id ? { ...c, status: status as Contact['status'] } : c
      ),
    }));
  },

  setParams: (params) => set({ params }),
}));
