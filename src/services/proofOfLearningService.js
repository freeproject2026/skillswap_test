import { simulateDelay } from './api';
import { PROOF_OF_LEARNING_TASKS } from '../data/mockSkillsData';

const STORAGE_KEY_POL_TASKS = 'skillswap_proof_of_learning_tasks';

const getInitialTasks = () => {
  const stored = localStorage.getItem(STORAGE_KEY_POL_TASKS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  return PROOF_OF_LEARNING_TASKS;
};

let tasks = getInitialTasks();

const saveState = () => {
  localStorage.setItem(STORAGE_KEY_POL_TASKS, JSON.stringify(tasks));
};

export const proofOfLearningService = {
  getTasks: async ({ filterStatus = 'All', category = 'All' } = {}) => {
    await simulateDelay(80);
    let results = [...tasks];

    if (filterStatus && filterStatus !== 'All') {
      results = results.filter(t => t.status.toLowerCase() === filterStatus.toLowerCase());
    }

    if (category && category !== 'All') {
      results = results.filter(t => t.category === category);
    }

    return results;
  },

  submitProof: async (taskId, { submittedUrl, notes }) => {
    await simulateDelay(180);
    const idx = tasks.findIndex(t => t.id === taskId);
    if (idx !== -1) {
      tasks[idx].status = 'Submitted';
      tasks[idx].submittedUrl = submittedUrl;
      tasks[idx].studentNotes = notes;
      tasks[idx].submissionDate = 'Just now';
      tasks[idx].mentorFeedback = 'Submission queued for peer mentor review. Check back within 24 hours.';
      saveState();
      return tasks[idx];
    }
    throw new Error('Task not found');
  },

  resubmitProof: async (taskId, { submittedUrl, revisionNotes }) => {
    await simulateDelay(180);
    const idx = tasks.findIndex(t => t.id === taskId);
    if (idx !== -1) {
      tasks[idx].status = 'Under Review';
      tasks[idx].submittedUrl = submittedUrl;
      tasks[idx].studentNotes = revisionNotes;
      tasks[idx].submissionDate = 'Resubmitted just now';
      tasks[idx].mentorFeedback = 'Revised submission received. Mentor re-evaluating rubric criteria.';
      saveState();
      return tasks[idx];
    }
    throw new Error('Task not found');
  }
};

export default proofOfLearningService;
