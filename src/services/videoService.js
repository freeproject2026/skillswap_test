/**
 * videoService — Connects to the real SkillSwap backend API.
 * All video data comes from the server; no mock/localStorage fallback.
 */
import apiClient from './api';

export const videoService = {
  /**
   * List videos, optionally filtered by category, search term, and/or topic/hashtag.
   */
  getVideos: async ({ category = 'All', search = '', topic = '', hashtag = '' } = {}) => {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.set('category', category);
    if (search && search.trim()) params.set('search', search.trim());
    if (topic && topic.trim()) params.set('topic', topic.trim());
    if (hashtag && hashtag.trim()) params.set('hashtag', hashtag.trim());

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await apiClient.get(`/videos${query}`);
    return res?.videos || [];
  },

  /**
   * Fetch a single video by ID (visibility enforced by the backend).
   */
  getVideoById: async (id) => {
    const res = await apiClient.get(`/videos/${id}`);
    if (!res?.video) throw new Error('Video not found.');
    return res.video;
  },

  /**
   * Returns the first featured video, or null if none exist.
   */
  getFeaturedVideo: async () => {
    const res = await apiClient.get('/videos?isFeatured=true');
    const videos = res?.videos || [];
    const featured = videos.find(v => v.isFeatured);
    return featured || (videos.length > 0 ? videos[0] : null);
  },

  /**
   * Videos related to the current one (same category, exclude self).
   */
  getRelatedVideos: async (currentVideoId, category, limit = 4) => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await apiClient.get(`/videos${query}`);
    const all = res?.videos || [];
    return all.filter(v => v.id !== currentVideoId && v._id !== currentVideoId).slice(0, limit);
  },

  /**
   * Videos from creators the current user follows.
   * Filters client-side from the public feed based on creator IDs.
   */
  getFollowingVideos: async (followedCreatorIds = []) => {
    if (!followedCreatorIds || followedCreatorIds.length === 0) return [];
    const res = await apiClient.get('/videos');
    const all = res?.videos || [];
    return all.filter(v => followedCreatorIds.includes(v.creator?.id));
  },

  /**
   * Toggle like on a video (auth required on backend).
   */
  toggleLike: async (videoId) => {
    const res = await apiClient.post(`/videos/${videoId}/like`, {});
    if (!res?.success) throw new Error('Failed to toggle like.');
    return res;
  },

  /**
   * Toggle save on a video (auth required on backend).
   */
  toggleSave: async (videoId) => {
    const res = await apiClient.post(`/videos/${videoId}/save`, {});
    if (!res?.success) throw new Error('Failed to toggle save.');
    return res;
  },

  /**
   * Add a comment to a video.
   */
  addComment: async (videoId, { text }) => {
    const res = await apiClient.post(`/videos/${videoId}/comments`, { text });
    if (!res?.comment) throw new Error(res?.error || 'Failed to post comment.');
    return res.comment;
  },

  /**
   * Upload a new video (sends JSON metadata; file upload via multipart is a future step).
   * Auth required on backend.
   */
  uploadVideo: async (videoPayload) => {
    const res = await apiClient.post('/videos', {
      title: videoPayload.title,
      description: videoPayload.description || '',
      category: videoPayload.category || 'Education',
      duration: videoPayload.duration || '00:00',
      videoUrl: videoPayload.videoUrl || '',
      thumbnailUrl: videoPayload.thumbnailPreview || '',
      skillsTaught: videoPayload.skills || [],
      level: videoPayload.level || 'Beginner',
      language: videoPayload.language || 'English',
      visibility: videoPayload.visibility || 'public',
      status: 'published'
    });

    if (!res?.video) throw new Error('Upload failed. Server did not return a video record.');
    return res.video;
  },

  /**
   * Delete a video (auth required; only owner can delete).
   */
  deleteVideo: async (videoId) => {
    const res = await apiClient.delete(`/videos/${videoId}`);
    if (!res?.success) throw new Error('Failed to delete video.');
    return res;
  },

  /**
   * Record playback progress for a video and update user's watch time.
   */
  recordWatchProgress: async (videoId, { currentTime, duration }) => {
    const res = await apiClient.post(`/videos/${videoId}/watch-progress`, {
      currentTime,
      duration
    });
    return res;
  },

  /**
   * Get verified watch progress and rating eligibility for a video.
   */
  getWatchProgress: async (videoId) => {
    const res = await apiClient.get(`/videos/${videoId}/watch-progress`);
    return res;
  },

  /**
   * Rate a video (only eligible after watching > 60%).
   */
  rateVideo: async (videoId, rating) => {
    const res = await apiClient.post(`/videos/${videoId}/rate`, { rating });
    if (!res?.success) throw new Error(res?.error || 'Failed to submit rating.');
    return res;
  }
};

export default videoService;
