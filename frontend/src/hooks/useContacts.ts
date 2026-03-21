import { useState, useCallback } from 'react';
import { ContactsService, Contact, ContactListParams } from '../services/contacts.service';

export function useContacts(initialParams: ContactListParams = {}) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState<ContactListParams>({ page: 1, limit: 20, ...initialParams });

  const fetch = useCallback(
    async (overrides: ContactListParams = {}) => {
      setLoading(true);
      try {
        const merged = { ...params, ...overrides };
        setParams(merged);
        const { data } = await ContactsService.list(merged);
        setContacts(data.data);
        setTotal(data.total);
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  return { contacts, total, loading, params, fetch, setContacts };
}
