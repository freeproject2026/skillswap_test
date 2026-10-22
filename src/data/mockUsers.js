// Realistic mock student and mentor user data for SkillSwap platform
// Enriched with academic, evidence-backed skills, and trust/safety credentials

export const CURRENT_USER = {
  id: 'usr_me',
  name: 'Alex Rivera',
  username: 'alexrivera',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  title: 'CS Undergrad & Frontend Specialist',
  bio: 'Building modern web apps by day, tutoring React & algorithms by night. Excited to master 3D WebGL and conversational Spanish this semester!',
  college: 'UC Berkeley',
  branch: 'Computer Science & Engineering',
  semester: '6th Semester',
  email: 'alex.rivera@berkeley.edu',
  emailVerified: true,
  location: 'Berkeley, CA (PST)',
  tokens: 100, // Paid tutoring tokens
  credits: 150, // Available skill-exchange credits
  reservedCredits: 60, // Reserved in escrow for pending sessions
  earnedTokens: 420,
  spentTokens: 320,
  rating: 4.92,
  teachingRating: 4.95,
  communicationRating: 4.88,
  reviewsCount: 38,
  followersCount: 1420,
  followingCount: 284,
  connectionsCount: 89,
  hoursTaught: 54,
  hoursLearned: 38,
  completedSessionsCount: 42,
  tasksApprovedCount: 12,
  availability: 'Available Evenings & Weekends',
  availableDays: ['Tue', 'Thu', 'Sat', 'Sun'],
  availableTimeSlots: '5:00 PM - 8:30 PM (PST)',
  preferredTeachingMethod: 'Live Online Session', // 'Live Online Session' | 'Chat & Code Review' | 'In-Person Campus Lab' | 'Shared Project'
  preferredLearningMethod: 'Live Online Session',
  languages: ['English (Native)', 'Spanish (Beginner)'],
  learningGoals: 'Master 3D WebGL / Three.js for interactive portfolios, pass Spanish B1 oral exam, and train local embeddings with PyTorch.',
  interests: ['Frontend Engineering', 'Generative UI', 'Creative Coding', 'Language Learning', 'Hackathons'],
  socialLinks: {
    github: 'https://github.com/alexrivera-dev',
    linkedin: 'https://linkedin.com/in/alexrivera-cs',
    portfolio: 'https://alexrivera.dev',
    projects: 'https://github.com/alexrivera-dev?tab=repositories'
  },
  privacySettings: {
    profileVisibility: 'public', // 'public' | 'connections' | 'private'
    showProjects: true,
    showEvidence: true,
    showOnline: true,
    allowRequests: true
  },
  skillsOffered: [
    {
      name: 'React.js',
      category: 'Programming, DSA & Web Dev',
      level: 'Advanced',
      evidenceStatus: 'Demonstrated Across Projects',
      evidenceProjectUrl: 'https://github.com/alexrivera-dev/react-state-engine',
      evidenceReviewerFeedback: 'Exceptional component composition, custom hook abstractions, and robust React 19 state patterns.',
      evidenceDate: 'Sep 2026',
      endorsedBy: 46
    },
    {
      name: 'Tailwind CSS',
      category: 'Graphic Design, Video Editing & UI/UX',
      level: 'Advanced',
      evidenceStatus: 'Demonstrated Across Projects',
      evidenceProjectUrl: 'https://github.com/alexrivera-dev/design-system-tokens',
      evidenceReviewerFeedback: 'Mastery of fluid typographic scaling, custom variant plugins, and dark mode accessibility.',
      evidenceDate: 'Aug 2026',
      endorsedBy: 39
    },
    {
      name: 'TypeScript',
      category: 'Programming, DSA & Web Dev',
      level: 'Advanced',
      evidenceStatus: 'Peer-Reviewed',
      evidenceProjectUrl: 'https://github.com/alexrivera-dev/typed-data-structures',
      evidenceReviewerFeedback: 'Passed campus peer review with rigorous generics and strict null safety checks.',
      evidenceDate: 'Jul 2026',
      endorsedBy: 31
    },
    {
      name: 'Data Structures & Algorithms',
      category: 'Programming, DSA & Web Dev',
      level: 'Intermediate',
      evidenceStatus: 'Practical Task Completed',
      evidenceProjectUrl: 'https://github.com/alexrivera-dev/berkeley-cs61b-lab',
      evidenceReviewerFeedback: 'Completed binary tree balancing and graph traversal coursework with 98% test coverage.',
      evidenceDate: 'Jun 2026',
      endorsedBy: 22
    }
  ],
  skillsWanted: [
    {
      name: 'Three.js / WebGL',
      category: 'Programming, DSA & Web Dev',
      targetLevel: 'Intermediate',
      priority: 'High',
      reason: 'Building interactive 3D portfolios and WebGL shader installations'
    },
    {
      name: 'Spanish Conversation',
      category: 'Communication, English & Interview Prep',
      targetLevel: 'Intermediate',
      priority: 'High',
      reason: 'Preparing for study-abroad semester in Madrid next spring'
    },
    {
      name: 'Product Design (Figma)',
      category: 'Graphic Design, Video Editing & UI/UX',
      targetLevel: 'Intermediate',
      priority: 'Medium',
      reason: 'Improving component token hierarchy and design system wireframing'
    },
    {
      name: 'Python for AI',
      category: 'Programming, DSA & Web Dev',
      targetLevel: 'Advanced',
      priority: 'High',
      reason: 'Fine-tuning small language models and building RAG pipelines'
    }
  ],
  passportBadges: [
    { id: 'b1', name: 'Master Peer Tutor', desc: 'Maintained 4.9+ rating over 40+ peer sessions', icon: 'Award', color: 'teal', dateAwarded: 'Oct 2026' },
    { id: 'b2', name: 'Verified Campus Scholar', desc: 'Verified academic email & coursework evidence', icon: 'CheckCircle', color: 'blue', dateAwarded: 'Sep 2026' },
    { id: 'b3', name: 'Reliable Collaborator', desc: 'Zero unexcused cancellations in 6 months', icon: 'Zap', color: 'amber', dateAwarded: 'Aug 2026' },
    { id: 'b4', name: 'Community Contributor', desc: 'Uploaded 10+ popular open tutorials and notes', icon: 'Sparkles', color: 'purple', dateAwarded: 'Jul 2026' }
  ]
};

export const MOCK_USERS = [
  {
    id: 'usr_1',
    name: 'Elena Rostova',
    username: 'elenacodes',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    college: 'TU Berlin',
    branch: 'Computer Science & Visual Computing',
    semester: '7th Semester',
    email: 'elena.rostova@campus.tu-berlin.de',
    emailVerified: true,
    title: 'Visual Computing Scholar & 3D Artist',
    bio: 'WebGL shader enthusiast and Three.js practitioner. Happy to tutor graphics math and lighting in exchange for backend architecture mentorship.',
    location: 'Berlin, Germany (CET)',
    rating: 4.96,
    teachingRating: 4.98,
    communicationRating: 4.94,
    reviewsCount: 42,
    tokensRate: 60,
    creditsRate: 60,
    availability: 'Available Saturday & Weekday Evenings',
    availableDays: ['Wed', 'Fri', 'Sat'],
    preferredTeachingMethod: 'Live Online Session',
    sessionFormat: 'Online & Lab Pairing',
    status: 'online',
    languages: ['English (Fluent)', 'German (Native)'],
    connectionStatus: 'connected',
    teachingMatch: 'Can teach what you want to learn: Three.js / WebGL',
    learningMatch: 'Wants to learn what you teach: React.js & TypeScript',
    skillsOffered: [
      {
        name: 'Three.js / WebGL',
        category: 'Programming, DSA & Web Dev',
        level: 'Advanced',
        evidenceStatus: 'Demonstrated Across Projects',
        evidenceProjectUrl: 'https://github.com/elenacodes/threejs-particle-galaxy',
        evidenceReviewerFeedback: 'Engineered custom fragment shaders and dynamic orbit controls with 60 FPS performance.',
        evidenceDate: 'Sep 2026'
      },
      {
        name: 'Blender 3D Modeling',
        category: 'Graphic Design, Video Editing & UI/UX',
        level: 'Advanced',
        evidenceStatus: 'Peer-Reviewed',
        evidenceProjectUrl: 'https://artstation.com/elenacodes/hard-surface',
        evidenceReviewerFeedback: 'Clean topology, UV unwrapping, and PBR material setups reviewed by university media lab.',
        evidenceDate: 'Aug 2026'
      },
      {
        name: 'GLSL Shader Art',
        category: 'Programming, DSA & Web Dev',
        level: 'Intermediate',
        evidenceStatus: 'Practical Task Completed',
        evidenceProjectUrl: 'https://shadertoy.com/user/elenacodes',
        evidenceReviewerFeedback: 'Procedural raymarching and noise functions demonstrated.',
        evidenceDate: 'Jul 2026'
      }
    ],
    skillsWanted: [
      { name: 'React.js', priority: 'High', targetLevel: 'Advanced' },
      { name: 'PostgreSQL / Supabase', priority: 'Medium', targetLevel: 'Intermediate' }
    ]
  },
  {
    id: 'usr_2',
    name: 'Carlos Mendoza',
    username: 'carlos_m',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80',
    college: 'Universidad Politécnica de Madrid',
    branch: 'Telecommunications & Software Engineering',
    semester: '5th Semester',
    email: 'carlos.mendoza@alumnos.upm.es',
    emailVerified: true,
    title: 'Native Spanish Peer Coach & Junior Dev',
    bio: 'Teaching conversational Spanish through role-play and debate. Eager to master modern frontend component state to build my campus tutoring tools.',
    location: 'Madrid, Spain (CET)',
    rating: 4.89,
    teachingRating: 4.92,
    communicationRating: 4.95,
    reviewsCount: 65,
    tokensRate: 50,
    creditsRate: 50,
    availability: 'Available Thursday & Weekends',
    availableDays: ['Tue', 'Thu', 'Sat'],
    preferredTeachingMethod: 'Live Online Session',
    sessionFormat: 'Online & In-Person Study Circles',
    status: 'online',
    languages: ['Spanish (Native)', 'English (C2 Fluent)'],
    connectionStatus: 'connected',
    teachingMatch: 'Can teach what you want to learn: Spanish Conversation',
    learningMatch: 'Wants to learn what you teach: React.js & Tailwind CSS',
    skillsOffered: [
      {
        name: 'Spanish Conversation',
        category: 'Communication, English & Interview Prep',
        level: 'Advanced',
        evidenceStatus: 'Demonstrated Across Projects',
        evidenceProjectUrl: 'https://carlosmendoza.es/spanish-labs',
        evidenceReviewerFeedback: 'Led 40+ campus language exchange meetups with outstanding pronunciation outcomes.',
        evidenceDate: 'Sep 2026'
      },
      {
        name: 'Pronunciation & Accent Coaching',
        category: 'Communication, English & Interview Prep',
        level: 'Advanced',
        evidenceStatus: 'Peer-Reviewed',
        evidenceProjectUrl: 'https://upm.es/language-clinic',
        evidenceReviewerFeedback: 'Certified peer language facilitator with positive student testimonials.',
        evidenceDate: 'Aug 2026'
      }
    ],
    skillsWanted: [
      { name: 'React.js', priority: 'High', targetLevel: 'Intermediate' },
      { name: 'Tailwind CSS', priority: 'High', targetLevel: 'Intermediate' }
    ]
  },
  {
    id: 'usr_3',
    name: 'Dr. Priya Sharma',
    username: 'priya_ai',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=1200&q=80',
    college: 'Imperial College London',
    branch: 'Department of Computing (AI Research)',
    semester: 'PhD Candidate',
    email: 'priya.sharma@imperial.ac.uk',
    emailVerified: true,
    title: 'AI Researcher & Data Science Peer Mentor',
    bio: 'PhD candidate studying neural information retrieval. I mentor students on PyTorch and embeddings, and look for frontend collaborators.',
    location: 'London, UK (GMT)',
    rating: 5.0,
    teachingRating: 5.0,
    communicationRating: 4.97,
    reviewsCount: 79,
    tokensRate: 75,
    creditsRate: 75,
    availability: 'Available Weekends & Friday Evenings',
    availableDays: ['Fri', 'Sat', 'Sun'],
    preferredTeachingMethod: 'Live Online Session',
    sessionFormat: 'Online',
    status: 'offline',
    languages: ['English (Fluent)', 'Hindi (Fluent)'],
    connectionStatus: 'pending',
    teachingMatch: 'Can teach what you want to learn: Python for AI',
    learningMatch: 'Wants to learn what you teach: React.js & TypeScript',
    skillsOffered: [
      {
        name: 'Python for AI',
        category: 'Programming, DSA & Web Dev',
        level: 'Advanced',
        evidenceStatus: 'Demonstrated Across Projects',
        evidenceProjectUrl: 'https://github.com/priyasharma-ai/neural-rag-eval',
        evidenceReviewerFeedback: 'Published peer-reviewed workshop paper and open-source benchmark.',
        evidenceDate: 'Aug 2026'
      },
      {
        name: 'Machine Learning Fundamentals',
        category: 'Academic Subjects, Presentations & Projects',
        level: 'Advanced',
        evidenceStatus: 'Demonstrated Across Projects',
        evidenceProjectUrl: 'https://github.com/priyasharma-ai/ml-coursework-solutions',
        evidenceReviewerFeedback: 'Head Teaching Assistant for Machine Learning at Imperial College.',
        evidenceDate: 'Jul 2026'
      }
    ],
    skillsWanted: [
      { name: 'React.js', priority: 'High', targetLevel: 'Intermediate' },
      { name: 'TypeScript', priority: 'Medium', targetLevel: 'Intermediate' }
    ]
  },
  {
    id: 'usr_4',
    name: 'Marcus Chen',
    username: 'marcus_design',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    college: 'University of Toronto',
    branch: 'Faculty of Information & Human-Centered Design',
    semester: '6th Semester',
    email: 'marcus.chen@mail.utoronto.ca',
    emailVerified: true,
    title: 'Product Design Lead & Design Systems Advocate',
    bio: 'Design systems nerd. I teach Figma tokens, UX architecture, and wireframing. Seeking frontend coding partners for student hackathons.',
    location: 'Toronto, Canada (EST)',
    rating: 4.93,
    teachingRating: 4.95,
    communicationRating: 4.91,
    reviewsCount: 51,
    tokensRate: 60,
    creditsRate: 60,
    availability: 'Available Today & Tuesday',
    availableDays: ['Mon', 'Tue', 'Thu'],
    preferredTeachingMethod: 'Shared Project',
    sessionFormat: 'Online & In-Person',
    status: 'online',
    languages: ['English (Native)', 'Mandarin (Conversational)'],
    connectionStatus: 'none',
    teachingMatch: 'Can teach what you want to learn: Product Design (Figma)',
    learningMatch: 'Wants to learn what you teach: Tailwind CSS',
    skillsOffered: [
      {
        name: 'Product Design (Figma)',
        category: 'Graphic Design, Video Editing & UI/UX',
        level: 'Advanced',
        evidenceStatus: 'Demonstrated Across Projects',
        evidenceProjectUrl: 'https://figma.com/@marcusdesign',
        evidenceReviewerFeedback: 'Authored campus design library used by 12 student project teams.',
        evidenceDate: 'Aug 2026'
      },
      {
        name: 'Design Systems & Tokens',
        category: 'Graphic Design, Video Editing & UI/UX',
        level: 'Advanced',
        evidenceStatus: 'Peer-Reviewed',
        evidenceProjectUrl: 'https://github.com/marcuschen-ux/design-tokens-standard',
        evidenceReviewerFeedback: 'Complies with W3C Design Tokens Community Group specifications.',
        evidenceDate: 'Jul 2026'
      }
    ],
    skillsWanted: [
      { name: 'Tailwind CSS', priority: 'High', targetLevel: 'Advanced' },
      { name: 'React.js', priority: 'High', targetLevel: 'Intermediate' }
    ]
  },
  {
    id: 'usr_5',
    name: 'Sarah Jenkins',
    username: 'sarah_speaks',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    college: 'UT Austin',
    branch: 'Moody College of Communication',
    semester: '8th Semester',
    email: 'sarah.jenkins@utexas.edu',
    emailVerified: true,
    title: 'TEDx Campus Speaker & Interview Coach',
    bio: 'Helping engineers and founders communicate with clarity and crush behavioral interviews. Wanting to grasp full-stack fundamentals.',
    location: 'Austin, TX (CST)',
    rating: 4.97,
    teachingRating: 4.98,
    communicationRating: 4.98,
    reviewsCount: 88,
    tokensRate: 70,
    creditsRate: 70,
    availability: 'Available Weekdays',
    availableDays: ['Mon', 'Wed', 'Fri'],
    preferredTeachingMethod: 'Live Online Session',
    sessionFormat: 'Online & In-Person Labs',
    status: 'offline',
    languages: ['English (Native)'],
    connectionStatus: 'none',
    skillsOffered: [
      {
        name: 'Technical Interview Preparation',
        category: 'Communication, English & Interview Prep',
        level: 'Advanced',
        evidenceStatus: 'Demonstrated Across Projects',
        evidenceProjectUrl: 'https://sarahspeaks.dev/interview-rubric',
        evidenceReviewerFeedback: 'Mentored 35+ students who secured offers at top tech firms.',
        evidenceDate: 'Sep 2026'
      },
      {
        name: 'Public Speaking & Presentations',
        category: 'Communication, English & Interview Prep',
        level: 'Advanced',
        evidenceStatus: 'Peer-Reviewed',
        evidenceProjectUrl: 'https://youtube.com/watch?v=demo-tedx-sarah',
        evidenceReviewerFeedback: 'Keynote delivery and stage presence verified by university debate coach.',
        evidenceDate: 'Jun 2026'
      }
    ],
    skillsWanted: [
      { name: 'Web Fundamentals', priority: 'Medium', targetLevel: 'Beginner' },
      { name: 'Product Management', priority: 'High', targetLevel: 'Intermediate' }
    ]
  },
  {
    id: 'usr_6',
    name: 'Liam O’Connor',
    username: 'liam_music',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    college: 'Trinity College Dublin',
    branch: 'Music & Media Technologies',
    semester: '6th Semester',
    email: 'liam.oconnor@tcd.ie',
    emailVerified: true,
    title: 'Sound Designer & Audio Software Tinkerer',
    bio: 'Ableton Certified peer tutor. Looking for mentors in Web Audio API and interactive JS visualization.',
    location: 'Dublin, Ireland (GMT)',
    rating: 4.85,
    teachingRating: 4.88,
    communicationRating: 4.82,
    reviewsCount: 29,
    tokensRate: 50,
    creditsRate: 50,
    availability: 'Available Evenings',
    availableDays: ['Tue', 'Thu', 'Sat'],
    preferredTeachingMethod: 'Shared Project',
    sessionFormat: 'Online',
    status: 'online',
    languages: ['English (Native)'],
    connectionStatus: 'none',
    skillsOffered: [
      {
        name: 'Audio Production & Ableton',
        category: 'Graphic Design, Video Editing & UI/UX',
        level: 'Advanced',
        evidenceStatus: 'Demonstrated Across Projects',
        evidenceProjectUrl: 'https://soundcloud.com/liam-sound-design',
        evidenceReviewerFeedback: 'Original EP and game audio assets praised for spatial acoustics.',
        evidenceDate: 'Aug 2026'
      }
    ],
    skillsWanted: [
      { name: 'JavaScript / React', priority: 'High', targetLevel: 'Intermediate' },
      { name: 'Web Audio API', priority: 'High', targetLevel: 'Advanced' }
    ]
  }
];
