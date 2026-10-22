// Realistic mock campus communities, weekly challenges, workshops,
// and contribution-based recognition leaderboard for SkillSwap.

export const CAMPUS_COMMUNITIES = [
  {
    id: 'comm_1',
    name: 'UC Berkeley EECS Circle',
    college: 'UC Berkeley',
    department: 'Electrical Engineering & Computer Sciences',
    banner: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
    memberCount: 482,
    activeCirclesCount: 8,
    isJoined: true,
    description: 'The premier peer learning community for Cal engineers. Weekly algorithm whiteboarding, React labs, and systems code reviews.',
    leadMentor: 'Alex Rivera',
    topics: ['CS61A', 'CS61B Algorithms', 'Web Development', 'Systems Architecture']
  },
  {
    id: 'comm_2',
    name: 'Stanford AI & Neural Systems Guild',
    college: 'Stanford University',
    department: 'Computer Science (AI Track)',
    banner: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    memberCount: 390,
    activeCirclesCount: 6,
    isJoined: false,
    description: 'Undergraduate and graduate students building open-source LLM agents, diffusion experiments, and neural search tools.',
    leadMentor: 'Dr. Priya Sharma',
    topics: ['PyTorch', 'Transformer Attention', 'Vector RAG', 'Reinforcement Learning']
  },
  {
    id: 'comm_3',
    name: 'Global Product Design & UX Collective',
    college: 'Multi-Campus Design Hub',
    department: 'Human-Computer Interaction & Visual Arts',
    banner: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80',
    memberCount: 615,
    activeCirclesCount: 11,
    isJoined: true,
    description: 'Designers from Toronto, Berlin, and Madrid collaborating on design tokens, usability tests, and Figma design systems.',
    leadMentor: 'Marcus Chen',
    topics: ['Figma Variables', 'Design Systems', 'Micro-Interactions', 'Portfolio Critique']
  }
];

export const WEEKLY_CHALLENGES = [
  {
    id: 'chal_1',
    title: 'Invert & Balance a Binary Tree in C++ or Python',
    category: 'Programming, DSA & Web Dev',
    difficulty: 'Medium',
    creditsReward: 50,
    deadline: 'Ends in 3 days',
    participantsCount: 84,
    description: 'Submit an iterative solution with O(n) time and O(1) auxiliary space beyond recursion stack. Include unit test assertions.',
    status: 'In Progress' // 'Not Started' | 'In Progress' | 'Submitted' | 'Completed'
  },
  {
    id: 'chal_2',
    title: 'Design an Accessible Spring Toggle Switch in Figma',
    category: 'Graphic Design, Video Editing & UI/UX',
    difficulty: 'Easy',
    creditsReward: 40,
    deadline: 'Ends in 5 days',
    participantsCount: 62,
    description: 'Create an interactive prototype switch with 3 states (Default, Focus-Visible, Checked) meeting WCAG 2.2 AA contrast standards.',
    status: 'Completed'
  },
  {
    id: 'chal_3',
    title: '3-Minute Elevator Pitch: Explain RAG to a Non-Techie',
    category: 'Communication, English & Interview Prep',
    difficulty: 'Medium',
    creditsReward: 45,
    deadline: 'Ends in 6 days',
    participantsCount: 39,
    description: 'Record an audio or video clip explaining retrieval-augmented generation using an intuitive real-world library analogy.',
    status: 'Not Started'
  }
];

export const PEER_WORKSHOPS = [
  {
    id: 'ws_1',
    title: 'Demystifying React 19 Compiler & Server Actions',
    host: 'Alex Rivera (UC Berkeley)',
    date: 'Saturday, 11:00 AM (PST)',
    format: 'Live Online Workshop',
    attendeesCount: 46,
    creditsCost: 0, // Free campus workshop
    isRegistered: true
  },
  {
    id: 'ws_2',
    title: 'Hands-on GLSL Shaders: Building 3D Waves in Three.js',
    host: 'Elena Rostova (TU Berlin)',
    date: 'Sunday, 4:00 PM (CET)',
    format: 'Live Online Workshop',
    attendeesCount: 58,
    creditsCost: 20,
    isRegistered: false
  },
  {
    id: 'ws_3',
    title: 'Behavioral Interview Masterclass: STAR Method in Tech',
    host: 'Sarah Jenkins (UT Austin)',
    date: 'Next Tuesday, 6:00 PM (CST)',
    format: 'Live Online Workshop',
    attendeesCount: 72,
    creditsCost: 0,
    isRegistered: false
  }
];

export const TEAM_MATCHMAKING = [
  {
    id: 'team_1',
    projectTitle: 'EduGraph: Open-Source Campus Knowledge Graph',
    event: 'Global Hackathon 2026',
    lookingFor: ['Backend Developer (FastAPI / Neo4j)', 'UI/UX Designer (Figma)'],
    members: ['Alex Rivera (Full-Stack)', 'Dr. Priya Sharma (AI Advisor)'],
    openSpots: 2
  },
  {
    id: 'team_2',
    projectTitle: 'SignBridge: WebCam Real-Time Gesture Translator',
    event: 'Social Impact Student Challenge',
    lookingFor: ['Computer Vision Specialist (OpenCV / MediaPipe)', 'Frontend Dev (React)'],
    members: ['Carlos Mendoza (Team Lead)'],
    openSpots: 3
  }
];

// Leaderboard rewards USEFUL contributions, verified evidence, and peer mentoring quality
export const CONTRIBUTION_LEADERBOARD = [
  {
    rank: 1,
    id: 'usr_3',
    name: 'Dr. Priya Sharma',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    college: 'Imperial College London',
    evidenceBadges: 8,
    qualityRating: 5.0,
    meritCredits: 940,
    peerEndorsements: 79,
    highlight: 'Top AI research tutor & course TA'
  },
  {
    rank: 2,
    id: 'usr_me',
    name: 'Alex Rivera',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    college: 'UC Berkeley',
    evidenceBadges: 7,
    qualityRating: 4.95,
    meritCredits: 820,
    peerEndorsements: 46,
    highlight: 'React & Algorithm peer mentor'
  },
  {
    rank: 3,
    id: 'usr_1',
    name: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    college: 'TU Berlin',
    evidenceBadges: 6,
    qualityRating: 4.96,
    meritCredits: 790,
    peerEndorsements: 42,
    highlight: '3D WebGL shader workshops lead'
  },
  {
    rank: 4,
    id: 'usr_4',
    name: 'Marcus Chen',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    college: 'University of Toronto',
    evidenceBadges: 5,
    qualityRating: 4.93,
    meritCredits: 710,
    peerEndorsements: 51,
    highlight: 'Open-source design system author'
  },
  {
    rank: 5,
    id: 'usr_2',
    name: 'Carlos Mendoza',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    college: 'UPM Madrid',
    evidenceBadges: 5,
    qualityRating: 4.89,
    meritCredits: 660,
    peerEndorsements: 65,
    highlight: 'Active language exchange coordinator'
  }
];
