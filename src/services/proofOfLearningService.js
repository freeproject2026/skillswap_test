import { apiClient } from './api';

export const proofOfLearningService = {
  getTasks: async ({ userId } = {}) => {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    const res = await apiClient.get(`/proof${query}`);
    return res?.tasks || [];
  },

  submitProof: async ({ title, skill, projectUrl, description, verificationType }) => {
    const res = await apiClient.post('/proof', {
      title,
      skill,
      projectUrl,
      description,
      verificationType
    });
    return res?.task;
  }
};

export default proofOfLearningService;
