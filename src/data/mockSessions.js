// Realistic mock learning sessions with two-sided confirmation states,
// escrow credit tracking, shared resources, and room notes.

export const MOCK_SESSIONS = [
  {
    id: 'sess_201',
    tutorId: 'usr_1',
    tutorName: 'Elena Rostova',
    tutorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    tutorCollege: 'TU Berlin',
    studentId: 'usr_me',
    studentName: 'Alex Rivera',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    skill: 'Three.js / WebGL',
    status: 'Upcoming', // 'Requested' | 'Accepted' | 'Upcoming' | 'In Progress' | 'Awaiting Confirmation' | 'Completed' | 'Cancelled' | 'Disputed'
    scheduledDate: 'Tomorrow',
    scheduledTime: '5:30 PM (CET)',
    durationMinutes: 20,
    creditCost: 60,
    escrowStatus: 'Reserved', // 'Reserved' | 'Settled' | 'Refunded' | 'Paused'
    tutorPayout: 50,
    platformFee: 10,
    format: 'Live Online Session',
    meetingLink: 'https://meet.skillswap.edu/demo-room-302',
    learningObjective: 'Implement custom GLSL vertex shaders for a dynamic particle cloud and wire up orbit controls.',
    sessionNotes: 'Student has basic Three.js setup ready. Need to troubleshoot uniform variable bindings and attribute buffers.',
    sharedResources: [
      { title: 'The Book of Shaders', url: 'https://thebookofshaders.com' },
      { title: 'Three.js Official ShaderMaterial Documentation', url: 'https://threejs.org/docs/#api/en/materials/ShaderMaterial' }
    ],
    taskSubmission: {
      url: 'https://github.com/alexrivera-dev/webgl-particle-canvas',
      notes: 'Initial buffer geometry created, shader compiles with no errors.'
    },
    nextSteps: 'Add mouse move interaction to distort particle coordinates on hover.',
    learnerConfirmed: false,
    teacherConfirmed: false,
    disputeReason: null,
    ratingGiven: null
  },
  {
    id: 'sess_202',
    tutorId: 'usr_2',
    tutorName: 'Carlos Mendoza',
    tutorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    tutorCollege: 'UPM Madrid',
    studentId: 'usr_me',
    studentName: 'Alex Rivera',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    skill: 'Skill Swap: Spanish Conversation ↔ React.js',
    status: 'Awaiting Confirmation',
    scheduledDate: 'Yesterday',
    scheduledTime: '6:00 PM (CET)',
    durationMinutes: 40,
    creditCost: 0, // Mutual exchange is 0 credits
    escrowStatus: 'Settled',
    tutorPayout: 0,
    platformFee: 0,
    format: 'Online & Language Circle',
    meetingLink: 'https://meet.skillswap.edu/demo-swap-carlos',
    learningObjective: '20 minutes conversational Spanish debate followed by 20 minutes React 19 state review.',
    sessionNotes: 'Covered irregular preterite verb conjugations and reviewed React useState vs useActionState.',
    sharedResources: [
      { title: 'Spanish Idioms in Tech Cheatsheet', url: 'https://spanish-tech.edu/vocab' }
    ],
    taskSubmission: null,
    nextSteps: 'Practice ordering food and booking hostel accommodation in Spanish before next week.',
    learnerConfirmed: true, // Learner already clicked confirm!
    teacherConfirmed: false, // Waiting for Carlos to confirm
    disputeReason: null,
    ratingGiven: null
  },
  {
    id: 'sess_203',
    tutorId: 'usr_3',
    tutorName: 'Dr. Priya Sharma',
    tutorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    tutorCollege: 'Imperial College London',
    studentId: 'usr_me',
    studentName: 'Alex Rivera',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    skill: 'Python for AI & Vector RAG',
    status: 'Completed',
    scheduledDate: 'Oct 19, 2026',
    scheduledTime: '3:00 PM (GMT)',
    durationMinutes: 30,
    creditCost: 75,
    escrowStatus: 'Settled',
    tutorPayout: 65,
    platformFee: 10,
    format: 'Live Online Session',
    meetingLink: 'https://meet.skillswap.edu/completed-priya',
    learningObjective: 'Benchmark dense vector retrieval with Pinecone and HuggingFace MiniLM embeddings.',
    sessionNotes: 'Evaluated chunking strategies (500 tokens with 50 overlap). Fixed query embedding dimension mismatch.',
    sharedResources: [
      { title: 'HuggingFace Sentence Transformers Guide', url: 'https://huggingface.co/sentence-transformers' }
    ],
    taskSubmission: {
      url: 'https://github.com/alexrivera-dev/rag-embedding-benchmark',
      notes: 'Final pipeline achieving 94% recall on test queries.'
    },
    nextSteps: 'Integrate reranking layer using cross-encoders.',
    learnerConfirmed: true,
    teacherConfirmed: true,
    disputeReason: null,
    ratingGiven: {
      teachingQuality: 5,
      communication: 5,
      feedback: 'Dr. Sharma explained embedding projections with crystal clarity. Super helpful session!'
    }
  },
  {
    id: 'sess_204',
    tutorId: 'usr_4',
    tutorName: 'Marcus Chen',
    tutorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    tutorCollege: 'University of Toronto',
    studentId: 'usr_me',
    studentName: 'Alex Rivera',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    skill: 'Product Design (Figma Tokens)',
    status: 'Disputed',
    scheduledDate: 'Oct 15, 2026',
    scheduledTime: '4:00 PM (EST)',
    durationMinutes: 20,
    creditCost: 50,
    escrowStatus: 'Paused',
    tutorPayout: 40,
    platformFee: 10,
    format: 'Live Online Session',
    meetingLink: 'https://meet.skillswap.edu/disputed-session',
    learningObjective: 'Review student onboarding wireframe tokens and accessible button states.',
    sessionNotes: 'Session interrupted due to technical failure.',
    sharedResources: [],
    taskSubmission: null,
    nextSteps: 'Pending moderation team review.',
    learnerConfirmed: false,
    teacherConfirmed: true,
    disputeReason: 'Learner reported the session dropped after 4 minutes due to audio hardware failure. Settlement paused in escrow pending campus review.',
    ratingGiven: null
  }
];
