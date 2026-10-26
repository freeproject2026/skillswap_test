import { apiClient } from './api';

export const campusCommunityService = {
  getCommunityData: async () => {
    const res = await apiClient.get('/communities');
    return {
      communities: res?.communities || [],
      challenges: res?.challenges || [],
      workshops: res?.workshops || [],
      teams: [],
      leaderboard: res?.leaderboard || []
    };
  },

  toggleJoinCommunity: async (communityId) => {
    const res = await apiClient.post(`/communities/${communityId}/join`, {});
    return res?.community;
  },

  toggleRegisterWorkshop: async (workshopId) => {
    const res = await apiClient.post(`/communities/workshops/${workshopId}/register`, {});
    return res?.workshop;
  },

  submitChallengeSolution: async (challengeId) => {
    // Currently challenges don't have separate backends, can be added when challenge model expanded
    return [];
  }
};

export default campusCommunityService;
