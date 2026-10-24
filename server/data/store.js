import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Video } from '../models/Video.js';
import { Quiz } from '../models/Quiz.js';

// In-memory fallback dataset for seamless offline / zero-setup runs
const defaultPasswordHash = bcrypt.hashSync('password123', 10);

let memoryUsers = [
  {
    id: 'usr_me',
    _id: 'usr_me',
    name: 'Alex Rivera',
    email: 'alex@skillswap.dev',
    username: 'alexrivera',
    passwordHash: defaultPasswordHash,
    phone: '+15551234567',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    bio: 'CS Junior @ UC Berkeley · Specializing in React, Python algorithms, and UI system design.',
    college: 'UC Berkeley',
    branch: 'Computer Science',
    year: '3rd Year',
    rating: 4.9,
    reviewCount: 18,
    creditsBalance: 240,
    creditsEscrow: 40,
    skillsOffered: [
      { name: 'React & Frontend Architecture', category: 'Programming, DSA & Web Dev', level: 'Advanced', evidenceStatus: 'Demonstrated Across Projects', evidenceUrl: 'https://github.com', endorsedCount: 14 },
      { name: 'Python DSA & Problem Solving', category: 'Programming, DSA & Web Dev', level: 'Intermediate', evidenceStatus: 'Peer-Reviewed', evidenceUrl: '', endorsedCount: 8 }
    ],
    skillsWanted: [
      { name: 'Three.js & WebGL Shaders', category: 'Creative Tech & 3D', level: 'Beginner' },
      { name: 'System Design Fundamentals', category: 'Programming, DSA & Web Dev', level: 'Intermediate' }
    ],
    availability: 'Weekday Evenings & Saturday Morning',
    sessionFormat: 'Live Online Session',
    languages: ['English', 'Spanish'],
    role: 'student',
    verifiedStudent: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr_sarah',
    _id: 'usr_sarah',
    name: 'Sarah Chen',
    email: 'sarah@skillswap.dev',
    username: 'sarahchen',
    passwordHash: defaultPasswordHash,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    bio: 'Stanford graduate student passionate about 3D computer graphics, shader math, and interactive art.',
    college: 'Stanford University',
    branch: 'Interactive Media',
    year: 'Master’s',
    rating: 5.0,
    reviewCount: 32,
    creditsBalance: 310,
    creditsEscrow: 0,
    skillsOffered: [
      { name: 'Three.js & WebGL Shaders', category: 'Creative Tech & 3D', level: 'Expert', evidenceStatus: 'Demonstrated Across Projects', endorsedCount: 22 }
    ],
    skillsWanted: [
      { name: 'React & Frontend Architecture', category: 'Programming, DSA & Web Dev', level: 'Intermediate' }
    ],
    availability: 'Saturday Afternoon',
    sessionFormat: 'Live Online Session',
    languages: ['English', 'Mandarin'],
    role: 'mentor',
    verifiedStudent: true,
    createdAt: new Date().toISOString()
  }
];

export const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

export const findUserByEmail = async (email) => {
  if (isMongoConnected()) {
    return User.findOne({ email: email.toLowerCase() });
  }
  return memoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
};

export const findUserById = async (id) => {
  if (isMongoConnected()) {
    try {
      return await User.findById(id);
    } catch {
      return null;
    }
  }
  return memoryUsers.find(u => u.id === id || u._id === id) || null;
};

export const findUserByPhone = async (phone) => {
  if (isMongoConnected()) {
    return User.findOne({ phone });
  }
  return memoryUsers.find(u => u.phone === phone) || null;
};

export const createUser = async (userData) => {
  if (isMongoConnected()) {
    const newUser = new User(userData);
    await newUser.save();
    return newUser.toSafeObject();
  }

  // Memory fallback
  const id = `usr_${Date.now()}`;
  let passwordHash = userData.passwordHash;
  if (userData.password && !passwordHash) {
    const salt = await bcrypt.genSalt(10);
    passwordHash = await bcrypt.hash(userData.password, salt);
  }

  const newUser = {
    id,
    _id: id,
    ...userData,
    passwordHash,
    creditsBalance: userData.creditsBalance || 0,
    creditsEscrow: 0,
    rating: 5.0,
    reviewCount: 0,
    skillsOffered: userData.skillsOffered || [],
    skillsWanted: userData.skillsWanted || [],
    verifiedStudent: true,
    createdAt: new Date().toISOString()
  };

  memoryUsers.push(newUser);
  const safe = { ...newUser };
  delete safe.passwordHash;
  return safe;
};

export const updateUser = async (id, updates) => {
  if (isMongoConnected()) {
    const updated = await User.findByIdAndUpdate(id, updates, { new: true });
    return updated ? updated.toSafeObject() : null;
  }

  const idx = memoryUsers.findIndex(u => u.id === id || u._id === id);
  if (idx === -1) return null;

  memoryUsers[idx] = { ...memoryUsers[idx], ...updates };
  const safe = { ...memoryUsers[idx] };
  delete safe.passwordHash;
  return safe;
};

export const listUsers = async (query = {}) => {
  if (isMongoConnected()) {
    const users = await User.find(query).select('-passwordHash');
    return users.map(u => u.toSafeObject());
  }

  return memoryUsers.map(u => {
    const safe = { ...u };
    delete safe.passwordHash;
    return safe;
  });
};

// In-memory video store (fallback when MongoDB is unavailable)
let memoryVideos = [];

export const listVideos = async (filter = {}) => {
  if (isMongoConnected()) {
    const query = {};
    if (filter.category && filter.category !== 'All') query.category = filter.category;
    if (filter.search) {
      const q = filter.search.toLowerCase();
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { 'creator.name': { $regex: q, $options: 'i' } },
        { skillsTaught: { $elemMatch: { $regex: q, $options: 'i' } } }
      ];
    }
    return Video.find(query).lean();
  }
  // Simple JS filter for the in‑memory array
  let results = [...memoryVideos];
  if (filter.category && filter.category !== 'All') {
    results = results.filter(v => v.category && v.category.toLowerCase() === filter.category.toLowerCase());
  }
  if (filter.search) {
    const q = filter.search.toLowerCase();
    results = results.filter(v =>
      (v.title && v.title.toLowerCase().includes(q)) ||
      (v.description && v.description.toLowerCase().includes(q)) ||
      (v.creator && v.creator.name && v.creator.name.toLowerCase().includes(q)) ||
      (v.skillsTaught && v.skillsTaught.some(s => s.toLowerCase().includes(q)))
    );
  }
  return results;
};

export const findVideoById = async (id) => {
  if (isMongoConnected()) {
    return Video.findById(id);
  }
  return memoryVideos.find(v => v.id === id || v._id === id) || null;
};

export const createVideo = async (data) => {
  if (isMongoConnected()) {
    const video = new Video(data);
    await video.save();
    return video;
  }
  const newVideo = { ...data, id: `vid_${Date.now()}`, _id: `vid_${Date.now()}` };
  memoryVideos.unshift(newVideo);
  return newVideo;
};

export const updateVideo = async (id, updates) => {
  if (isMongoConnected()) {
    const updated = await Video.findByIdAndUpdate(id, updates, { new: true });
    return updated;
  }
  const idx = memoryVideos.findIndex(v => v.id === id || v._id === id);
  if (idx === -1) return null;
  memoryVideos[idx] = { ...memoryVideos[idx], ...updates };
  return memoryVideos[idx];
};

export const deleteVideo = async (id) => {
  if (isMongoConnected()) {
    const res = await Video.deleteOne({ _id: id });
    return res.deletedCount === 1;
  }
  const before = memoryVideos.length;
  memoryVideos = memoryVideos.filter(v => !(v.id === id || v._id === id));
  return memoryVideos.length < before;
};

// In-memory quiz store (fallback)
let memoryQuizzes = [];

export const listQuizzes = async (filter = {}) => {
  if (isMongoConnected()) {
    const query = {};
    if (filter.subject) query.subject = filter.subject;
    if (filter.level) query.level = filter.level;
    return Quiz.find(query).lean();
  }
  let results = [...memoryQuizzes];
  if (filter.subject) {
    results = results.filter(q => q.subject && q.subject.toLowerCase() === filter.subject.toLowerCase());
  }
  if (filter.level) {
    results = results.filter(q => q.level && q.level.toLowerCase() === filter.level.toLowerCase());
  }
  return results;
};

export const findQuizById = async (id) => {
  if (isMongoConnected()) {
    return Quiz.findById(id);
  }
  return memoryQuizzes.find(q => q.id === id || q._id === id) || null;
};

export const createQuiz = async (data) => {
  if (isMongoConnected()) {
    const quiz = new Quiz(data);
    await quiz.save();
    return quiz;
  }
  const newQuiz = { ...data, id: `quiz_${Date.now()}`, _id: `quiz_${Date.now()}` };
  memoryQuizzes.unshift(newQuiz);
  return newQuiz;
};

export const updateQuiz = async (id, updates) => {
  if (isMongoConnected()) {
    const updated = await Quiz.findByIdAndUpdate(id, updates, { new: true });
    return updated;
  }
  const idx = memoryQuizzes.findIndex(q => q.id === id || q._id === id);
  if (idx === -1) return null;
  memoryQuizzes[idx] = { ...memoryQuizzes[idx], ...updates };
  return memoryQuizzes[idx];
};

export const deleteQuiz = async (id) => {
  if (isMongoConnected()) {
    const res = await Quiz.deleteOne({ _id: id });
    return res.deletedCount === 1;
  }
  const before = memoryQuizzes.length;
  memoryQuizzes = memoryQuizzes.filter(q => !(q.id === id || q._id === id));
  return memoryQuizzes.length < before;
};
