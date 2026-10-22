import { apiClient, simulateDelay } from './api';
import { MOCK_VIDEOS } from '../data/mockVideos';

const STORAGE_KEY = 'skillswap_videos';

const getInitialVideos = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse videos from localStorage', e);
    }
  }
  return MOCK_VIDEOS;
};

let videosData = getInitialVideos();

const saveVideos = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(videosData));
};

export const videoService = {
  getVideos: async ({ category = 'All', search = '' } = {}) => {
    await simulateDelay(150);
    let results = [...videosData];

    if (category && category !== 'All') {
      results = results.filter(v => v.category.toLowerCase() === category.toLowerCase());
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(v =>
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.creator.name.toLowerCase().includes(q) ||
        (v.skillsTaught && v.skillsTaught.some(s => s.toLowerCase().includes(q)))
      );
    }

    return results;
  },

  getVideoById: async (id) => {
    await simulateDelay(100);
    const video = videosData.find(v => v.id === id);
    if (!video) throw new Error(`Video with id ${id} not found`);
    return { ...video };
  },

  getFeaturedVideo: async () => {
    await simulateDelay(100);
    return videosData.find(v => v.isFeatured) || videosData[0];
  },

  getRelatedVideos: async (currentVideoId, category, limit = 4) => {
    await simulateDelay(100);
    return videosData
      .filter(v => v.id !== currentVideoId)
      .slice(0, limit);
  },

  getFollowingVideos: async (followedCreatorIds = []) => {
    await simulateDelay(150);
    if (!followedCreatorIds || followedCreatorIds.length === 0) {
      return [];
    }
    return videosData.filter(v => followedCreatorIds.includes(v.creator.id));
  },

  toggleLike: async (videoId) => {
    await simulateDelay(80);
    const index = videosData.findIndex(v => v.id === videoId);
    if (index !== -1) {
      const isLiked = !videosData[index].isLiked;
      videosData[index] = {
        ...videosData[index],
        isLiked,
        likes: isLiked ? videosData[index].likes + 1 : Math.max(0, videosData[index].likes - 1)
      };
      saveVideos();
      return videosData[index];
    }
    throw new Error('Video not found');
  },

  toggleSave: async (videoId) => {
    await simulateDelay(80);
    const index = videosData.findIndex(v => v.id === videoId);
    if (index !== -1) {
      videosData[index] = {
        ...videosData[index],
        isSaved: !videosData[index].isSaved
      };
      saveVideos();
      return videosData[index];
    }
    throw new Error('Video not found');
  },

  addComment: async (videoId, { author, avatar, text }) => {
    await simulateDelay(120);
    const index = videosData.findIndex(v => v.id === videoId);
    if (index !== -1) {
      const newComment = {
        id: `c_${Date.now()}`,
        author,
        avatar,
        text,
        createdAt: 'Just now',
        likes: 0
      };
      const updatedComments = [newComment, ...(videosData[index].comments || [])];
      videosData[index] = {
        ...videosData[index],
        comments: updatedComments
      };
      saveVideos();
      return newComment;
    }
    throw new Error('Video not found');
  },

  uploadVideo: async (videoPayload) => {
    await simulateDelay(400); // Simulate network upload time
    const newVideo = {
      id: `vid_${Date.now()}`,
      title: videoPayload.title,
      description: videoPayload.description || '',
      category: videoPayload.category || 'Education',
      duration: videoPayload.duration || '12:30',
      views: '1',
      likes: 0,
      isLiked: false,
      isSaved: false,
      createdAt: 'Just now',
      thumbnail: videoPayload.thumbnailPreview || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80',
      videoUrl: videoPayload.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      isFeatured: false,
      skillsTaught: videoPayload.skills || ['General Skill'],
      creator: videoPayload.creator,
      comments: []
    };

    videosData = [newVideo, ...videosData];
    saveVideos();
    return newVideo;
  }
};

export default videoService;

