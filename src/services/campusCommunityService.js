import { simulateDelay } from './api';
import {
  CAMPUS_COMMUNITIES,
  WEEKLY_CHALLENGES,
  PEER_WORKSHOPS,
  TEAM_MATCHMAKING,
  CONTRIBUTION_LEADERBOARD
} from '../data/mockCampusCommunities';

const STORAGE_KEY_COMMUNITIES = 'skillswap_communities_data';

const getInitialData = () => {
  const stored = localStorage.getItem(STORAGE_KEY_COMMUNITIES);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  return {
    communities: CAMPUS_COMMUNITIES,
    challenges: WEEKLY_CHALLENGES,
    workshops: PEER_WORKSHOPS,
    teams: TEAM_MATCHMAKING,
    leaderboard: CONTRIBUTION_LEADERBOARD
  };
};

let data = getInitialData();

const saveState = () => {
  localStorage.setItem(STORAGE_KEY_COMMUNITIES, JSON.stringify(data));
};

export const campusCommunityService = {
  getCommunityData: async () => {
    await simulateDelay(80);
    return { ...data };
  },

  toggleJoinCommunity: async (communityId) => {
    await simulateDelay(120);
    data.communities = data.communities.map(c => {
      if (c.id === communityId) {
        const isJoined = !c.isJoined;
        return {
          ...c,
          isJoined,
          memberCount: isJoined ? c.memberCount + 1 : c.memberCount - 1
        };
      }
      return c;
    });
    saveState();
    return data.communities;
  },

  toggleRegisterWorkshop: async (workshopId) => {
    await simulateDelay(120);
    data.workshops = data.workshops.map(w => {
      if (w.id === workshopId) {
        const isRegistered = !w.isRegistered;
        return {
          ...w,
          isRegistered,
          attendeesCount: isRegistered ? w.attendeesCount + 1 : w.attendeesCount - 1
        };
      }
      return w;
    });
    saveState();
    return data.workshops;
  },

  submitChallengeSolution: async (challengeId) => {
    await simulateDelay(150);
    data.challenges = data.challenges.map(c =>
      c.id === challengeId ? { ...c, status: 'Submitted', participantsCount: c.participantsCount + 1 } : c
    );
    saveState();
    return data.challenges;
  }
};

export default campusCommunityService;
