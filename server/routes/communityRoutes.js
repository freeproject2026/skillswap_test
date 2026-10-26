import express from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { Community } from '../models/Community.js';

const router = express.Router();

// GET /api/communities – List campus communities
router.get('/', optionalAuth, async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    let communities = await Community.find();

    // If no communities in database yet, seed with standard campus communities
    if (communities.length === 0) {
      const initialCommunities = [
        {
          name: 'Full-Stack Developers Campus Hub',
          description: 'Peer study sessions for MERN, Next.js, GraphQL, PostgreSQL and system architecture.',
          icon: 'Code2',
          category: 'Engineering & Web Dev',
          members: [],
          memberCount: 38,
          tags: ['React', 'Node.js', 'MongoDB', 'Docker'],
          activeDiscussions: 12,
          workshops: [
            {
              id: 'ws_1',
              title: 'Building Real-time Full-Stack Apps with WebSockets & React',
              speaker: 'Sarah Chen',
              speakerRole: 'Stanford CS MS',
              speakerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
              date: 'Saturday, Nov 2',
              time: '4:00 PM - 5:30 PM PST',
              attendees: [],
              attendeesCount: 24,
              isHandsOn: true
            }
          ],
          challenges: [
            {
              id: 'ch_1',
              title: 'Algorithmic Binary Search Mastery',
              badge: 'DSA Star',
              category: 'DSA & Algorithms',
              difficulty: 'Medium',
              deadline: 'Sunday, 11:59 PM',
              participants: [],
              participantsCount: 19,
              tokenReward: 50,
              solvedBy: []
            }
          ]
        },
        {
          name: 'AI & Machine Learning Circle',
          description: 'Exploring LLM orchestration, fine-tuning, computer vision, and PyTorch implementations.',
          icon: 'Sparkles',
          category: 'AI & Data Science',
          members: [],
          memberCount: 52,
          tags: ['Python', 'PyTorch', 'RAG', 'Hugging Face'],
          activeDiscussions: 24,
          workshops: [],
          challenges: []
        },
        {
          name: 'UI/UX Design Systems Lab',
          description: 'Figma component architecture, accessible UI design tokens, micro-interactions, and portfolio critiques.',
          icon: 'Palette',
          category: 'Design & Creative',
          members: [],
          memberCount: 29,
          tags: ['Figma', 'Design Systems', 'Tailwind CSS'],
          activeDiscussions: 8,
          workshops: [],
          challenges: []
        }
      ];

      communities = await Community.insertMany(initialCommunities);
    }

    const safe = communities.map(c => c.toSafeObject(currentUserId));

    // Aggregate challenges and workshops for page tabs
    const allWorkshops = safe.flatMap(c => c.workshops || []);
    const allChallenges = safe.flatMap(c => c.challenges || []);

    res.json({
      success: true,
      communities: safe,
      workshops: allWorkshops,
      challenges: allChallenges,
      leaderboard: [
        { rank: 1, name: 'Elena Rostova', college: 'UC Berkeley', score: 1420, hours: 28, badge: 'Campus Legend' },
        { rank: 2, name: 'Dr. Liam Vance', college: 'MIT', score: 1250, hours: 24, badge: 'Master Mentor' },
        { rank: 3, name: 'Sarah Chen', college: 'Stanford', score: 980, hours: 19, badge: 'Rising Star' }
      ]
    });
  } catch (err) {
    console.error('List communities error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch communities.' });
  }
});

// POST /api/communities/:id/join – Join or leave community
router.post('/:id/join', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ success: false, error: 'Community not found.' });

    const memberIndex = community.members.indexOf(userId);
    let isJoined = false;

    if (memberIndex === -1) {
      community.members.push(userId);
      community.memberCount = (community.memberCount || 0) + 1;
      isJoined = true;
    } else {
      community.members.splice(memberIndex, 1);
      community.memberCount = Math.max(0, (community.memberCount || 1) - 1);
      isJoined = false;
    }

    await community.save();

    res.json({
      success: true,
      isJoined,
      community: community.toSafeObject(userId)
    });
  } catch (err) {
    console.error('Toggle join error:', err);
    res.status(500).json({ success: false, error: 'Failed to update community membership.' });
  }
});

// POST /api/communities/workshops/:id/register – Register or unregister
router.post('/workshops/:id/register', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const workshopId = req.params.id;

    const community = await Community.findOne({ 'workshops.id': workshopId });
    if (!community) return res.status(404).json({ success: false, error: 'Workshop not found.' });

    const workshop = community.workshops.find(w => w.id === workshopId);
    const attIdx = workshop.attendees.indexOf(userId);
    let isRegistered = false;

    if (attIdx === -1) {
      workshop.attendees.push(userId);
      workshop.attendeesCount = (workshop.attendeesCount || 0) + 1;
      isRegistered = true;
    } else {
      workshop.attendees.splice(attIdx, 1);
      workshop.attendeesCount = Math.max(0, (workshop.attendeesCount || 1) - 1);
      isRegistered = false;
    }

    await community.save();

    res.json({
      success: true,
      isRegistered,
      workshop
    });
  } catch (err) {
    console.error('Workshop register error:', err);
    res.status(500).json({ success: false, error: 'Failed to update workshop registration.' });
  }
});

export default router;
