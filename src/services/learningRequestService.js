import { apiClient } from './api';

export const learningRequestService = {
  getRequests: async ({ category = 'All Categories', format = 'All', search = '' } = {}) => {
    const params = new URLSearchParams();
    if (category && category !== 'All Categories') params.set('category', category);
    if (format && format !== 'All') params.set('format', format);
    if (search && search.trim()) params.set('search', search.trim());

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await apiClient.get(`/learning-requests${query}`);
    return res?.requests || [];
  },

  createRequest: async (newRequestPayload) => {
    const res = await apiClient.post('/learning-requests', newRequestPayload);
    if (!res?.request) throw new Error(res?.error || 'Failed to create learning request');
    return res.request;
  },

  respondToRequest: async (requestId, { message }) => {
    const res = await apiClient.post(`/learning-requests/${requestId}/respond`, { message });
    if (!res?.request) throw new Error(res?.error || 'Failed to respond to request');
    return res.request;
  }
};

export default learningRequestService;
