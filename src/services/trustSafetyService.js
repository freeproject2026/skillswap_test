import { simulateDelay } from './api';

const STORAGE_KEY_REPORTS = 'skillswap_safety_reports';
const STORAGE_KEY_BLOCKED = 'skillswap_blocked_users';

const getInitialReports = () => {
  const stored = localStorage.getItem(STORAGE_KEY_REPORTS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  return [
    {
      id: 'rep_1',
      reportedUserId: 'usr_4',
      reportedUserName: 'Marcus Chen',
      reason: 'Technical hardware drop & unannounced departure during paid session',
      status: 'Under Review', // 'Under Review' | 'Information Requested' | 'Resolved' | 'Dismissed'
      date: 'Oct 15, 2026',
      outcomeNotes: 'Both student and tutor provided audio logs. Escrow held until mediation completes.'
    }
  ];
};

let reports = getInitialReports();
let blockedUsers = JSON.parse(localStorage.getItem(STORAGE_KEY_BLOCKED) || '[]');

const saveState = () => {
  localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));
  localStorage.setItem(STORAGE_KEY_BLOCKED, JSON.stringify(blockedUsers));
};

export const trustSafetyService = {
  submitReport: async ({ targetUserId, targetUserName, reason, category, evidenceNotes }) => {
    await simulateDelay(200);
    const newReport = {
      id: `rep_${Date.now()}`,
      reportedUserId: targetUserId,
      reportedUserName: targetUserName,
      category: category || 'Session Conduct',
      reason,
      evidenceNotes: evidenceNotes || '',
      status: 'Flagged for Review',
      date: 'Just now',
      outcomeNotes: 'Report securely logged. Campus community moderators review all flags within 24 hours.'
    };

    reports = [newReport, ...reports];
    saveState();
    return newReport;
  },

  getReports: async () => {
    await simulateDelay(60);
    return [...reports];
  },

  toggleBlockUser: async (userId) => {
    await simulateDelay(100);
    if (blockedUsers.includes(userId)) {
      blockedUsers = blockedUsers.filter(id => id !== userId);
    } else {
      blockedUsers.push(userId);
    }
    saveState();
    return blockedUsers.includes(userId);
  },

  getBlockedUsers: () => [...blockedUsers]
};

export default trustSafetyService;
