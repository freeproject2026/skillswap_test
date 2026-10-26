import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Video } from '../models/Video.js';
import { Quiz } from '../models/Quiz.js';

export const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

const assertDbConnected = () => {
  if (!isMongoConnected()) {
    const error = new Error('Database is unavailable. Persistent storage requires an active MongoDB connection.');
    error.statusCode = 503;
    throw error;
  }
};

export const findUserByEmail = async (email) => {
  assertDbConnected();
  return User.findOne({ email: email.toLowerCase() });
};

export const findUserById = async (id) => {
  assertDbConnected();
  try {
    return await User.findById(id);
  } catch {
    return null;
  }
};

export const findUserByPhone = async (phone) => {
  assertDbConnected();
  return User.findOne({ phone });
};

export const createUser = async (userData) => {
  assertDbConnected();
  let passwordHash = userData.passwordHash;
  if (userData.password && !passwordHash) {
    const salt = await bcrypt.genSalt(10);
    passwordHash = await bcrypt.hash(userData.password, salt);
  }

  const newUser = new User({
    ...userData,
    passwordHash,
    rating: 0,
    reviewCount: 0,
    teachingRating: 0,
    communicationRating: 0,
    watchTimeMinutes: 0,
    watchTimeSeconds: 0,
    hoursLearned: 0,
    hoursTaught: 0,
    completedSessionsCount: 0,
    tasksApprovedCount: 0,
    watchHistory: [],
    learningProgress: [],
    quizHistory: []
  });
  await newUser.save();
  return newUser.toSafeObject();
};

export const updateUser = async (id, updates) => {
  assertDbConnected();
  try {
    const existingUser = await User.findById(id);
    if (!existingUser) return null;

    // Filter out undefined values to prevent overwriting existing data
    const cleanUpdates = {};
    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined && val !== null) {
        if (key === 'socialLinks' && typeof val === 'object') {
          cleanUpdates.socialLinks = {
            ...(existingUser.socialLinks?.toObject ? existingUser.socialLinks.toObject() : existingUser.socialLinks || {}),
            ...val
          };
        } else {
          cleanUpdates[key] = val;
        }
      }
    }

    const updated = await User.findByIdAndUpdate(id, { $set: cleanUpdates }, { new: true, runValidators: true });
    return updated ? updated.toSafeObject() : null;
  } catch (err) {
    console.error('updateUser error:', err);
    return null;
  }
};

export const listUsers = async (query = {}) => {
  assertDbConnected();
  const users = await User.find(query).select('-passwordHash');
  return users.map(u => (u.toSafeObject ? u.toSafeObject() : u));
};

export const listVideos = async (filter = {}) => {
  assertDbConnected();
  const query = {};
  if (filter.category && filter.category !== 'All') query.category = filter.category;
  
  const orConditions = [];

  if (filter.search) {
    const q = filter.search.toLowerCase();
    orConditions.push(
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { 'creator.name': { $regex: q, $options: 'i' } },
      { skillsTaught: { $elemMatch: { $regex: q, $options: 'i' } } }
    );
  }

  if (filter.topic) {
    const cleanTopic = filter.topic.replace(/^#/, '').trim();
    if (cleanTopic) {
      const topicRegex = { $regex: cleanTopic, $options: 'i' };
      orConditions.push(
        { skillsTaught: { $elemMatch: topicRegex } },
        { title: topicRegex },
        { category: topicRegex },
        { description: topicRegex }
      );
    }
  }

  if (orConditions.length > 0) {
    query.$or = orConditions;
  }

  return Video.find(query).sort({ createdAt: -1 });
};

export const findVideoById = async (id) => {
  assertDbConnected();
  try {
    return await Video.findById(id);
  } catch {
    return null;
  }
};

export const createVideo = async (data) => {
  assertDbConnected();
  const video = new Video(data);
  await video.save();
  return video;
};

export const updateVideo = async (id, updates) => {
  assertDbConnected();
  try {
    const updated = await Video.findByIdAndUpdate(id, updates, { new: true });
    return updated;
  } catch {
    return null;
  }
};

export const deleteVideo = async (id) => {
  assertDbConnected();
  try {
    const res = await Video.deleteOne({ _id: id });
    return res.deletedCount === 1;
  } catch {
    return false;
  }
};

export const listQuizzes = async (filter = {}) => {
  assertDbConnected();
  const query = {};
  if (filter.subject) query.subject = filter.subject;
  if (filter.level) query.level = filter.level;
  return Quiz.find(query);
};

export const findQuizById = async (id) => {
  assertDbConnected();
  try {
    return await Quiz.findById(id);
  } catch {
    return null;
  }
};

export const createQuiz = async (data) => {
  assertDbConnected();
  const quiz = new Quiz(data);
  await quiz.save();
  return quiz;
};

export const updateQuiz = async (id, updates) => {
  assertDbConnected();
  try {
    const updated = await Quiz.findByIdAndUpdate(id, updates, { new: true });
    return updated;
  } catch {
    return null;
  }
};

export const deleteQuiz = async (id) => {
  assertDbConnected();
  try {
    const res = await Quiz.deleteOne({ _id: id });
    return res.deletedCount === 1;
  } catch {
    return false;
  }
};
