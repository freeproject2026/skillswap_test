import { simulateDelay } from './api';
import { CAREER_ROADMAPS } from '../data/mockSkillsData';

const STORAGE_KEY_ROADMAPS = 'skillswap_career_roadmaps';

const getInitialRoadmaps = () => {
  const stored = localStorage.getItem(STORAGE_KEY_ROADMAPS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  return CAREER_ROADMAPS;
};

let roadmaps = getInitialRoadmaps();

const saveState = () => {
  localStorage.setItem(STORAGE_KEY_ROADMAPS, JSON.stringify(roadmaps));
};

export const learningRoadmapService = {
  getRoadmaps: async () => {
    await simulateDelay(60);
    return [...roadmaps];
  },

  getRoadmapById: async (roadmapId) => {
    await simulateDelay(60);
    const r = roadmaps.find(item => item.id === roadmapId);
    if (!r) return roadmaps[0];
    return { ...r };
  },

  toggleMilestoneStatus: async (roadmapId, milestoneId) => {
    await simulateDelay(120);
    const rIdx = roadmaps.findIndex(r => r.id === roadmapId);
    if (rIdx !== -1) {
      const mIdx = roadmaps[rIdx].milestones.findIndex(m => m.id === milestoneId);
      if (mIdx !== -1) {
        const current = roadmaps[rIdx].milestones[mIdx].status;
        const nextStatus = current === 'Completed' ? 'In Progress' : 'Completed';
        roadmaps[rIdx].milestones[mIdx].status = nextStatus;

        const completedCount = roadmaps[rIdx].milestones.filter(m => m.status === 'Completed').length;
        roadmaps[rIdx].completedMilestones = completedCount;
        saveState();
        return roadmaps[rIdx];
      }
    }
    throw new Error('Milestone not found');
  }
};

export default learningRoadmapService;
