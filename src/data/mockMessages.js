// Realistic mock chat conversations and skill exchange sessions for SkillSwap

export const MOCK_CONVERSATIONS = [
  {
    id: 'conv_1',
    participantId: 'usr_1', // Elena Rostova
    unreadCount: 1,
    lastMessage: 'I reviewed your Three.js shaders draft. The lighting coordinates look so much smoother now!',
    lastMessageAt: '12m ago',
    activeSession: {
      id: 'sess_101',
      skill: 'Three.js / WebGL',
      status: 'Accepted', // 'Pending' | 'Accepted' | 'In Progress' | 'Completed' | 'Declined'
      type: 'TUTORING', // 'TUTORING' (token paid) or 'SWAP' (1:1 skill exchange)
      proposedBy: 'usr_me',
      tutorId: 'usr_1',
      studentId: 'usr_me',
      scheduledFor: 'Tomorrow, 5:30 PM (CET)',
      durationMinutes: 20,
      tokenCost: 60,
      tutorPayout: 50,
      platformFee: 10,
      notes: 'Interactive lighting and orbit controls implementation'
    },
    messages: [
      {
        id: 'm1',
        senderId: 'usr_me',
        text: 'Hi Elena! I loved your Three.js video tutorial on YouTube and SkillSwap. I am working on an interactive 3D particle canvas and hitting an issue with GLSL shaders.',
        timestamp: 'Yesterday, 3:15 PM',
        type: 'text'
      },
      {
        id: 'm2',
        senderId: 'usr_1',
        text: 'Hey Alex! Thanks for reaching out. GLSL attributes can be tricky when switching between fragment and vertex shaders. I would be happy to do a live session to walk through it!',
        timestamp: 'Yesterday, 3:42 PM',
        type: 'text'
      },
      {
        id: 'm3',
        senderId: 'usr_me',
        text: 'Would love that! I can also help you review React 19 hooks or Tailwind design systems whenever you want.',
        timestamp: 'Yesterday, 4:00 PM',
        type: 'text'
      },
      {
        id: 'm4',
        senderId: 'usr_me',
        text: 'Proposed a 20-minute live session on Three.js & GLSL Shaders.',
        timestamp: 'Yesterday, 4:05 PM',
        type: 'session_proposal',
        sessionData: {
          id: 'sess_101',
          skill: 'Three.js / WebGL',
          status: 'Accepted',
          scheduledFor: 'Tomorrow, 5:30 PM (CET)',
          durationMinutes: 20,
          tokenCost: 60,
          tutorPayout: 50,
          platformFee: 10
        }
      },
      {
        id: 'm5',
        senderId: 'usr_1',
        text: 'Accepted! Looking forward to it. Send over your GitHub repo or CodeSandbox whenever you have a chance.',
        timestamp: 'Yesterday, 4:18 PM',
        type: 'text'
      },
      {
        id: 'm6',
        senderId: 'usr_1',
        text: 'I reviewed your Three.js shaders draft. The lighting coordinates look so much smoother now!',
        timestamp: '12m ago',
        type: 'text'
      }
    ]
  },
  {
    id: 'conv_2',
    participantId: 'usr_2', // Carlos Mendoza
    unreadCount: 0,
    lastMessage: 'Perfect! See you for our Spanish-React exchange on Thursday.',
    lastMessageAt: '2h ago',
    activeSession: {
      id: 'sess_102',
      skill: 'Skill Swap: Spanish ↔ React.js',
      status: 'Accepted',
      type: 'SWAP',
      proposedBy: 'usr_2',
      tutorId: 'usr_2',
      studentId: 'usr_me',
      scheduledFor: 'Thursday, 6:00 PM',
      durationMinutes: 40,
      tokenCost: 0, // Mutual skill exchange: 0 tokens!
      notes: '20 mins Conversational Spanish + 20 mins React component state review'
    },
    messages: [
      {
        id: 'm21',
        senderId: 'usr_2',
        text: '¡Hola Alex! I saw on your profile that you are learning Spanish and want conversational practice. I am currently learning React to build my tutoring app!',
        timestamp: '2 days ago',
        type: 'text'
      },
      {
        id: 'm22',
        senderId: 'usr_me',
        text: '¡Hola Carlos! That is an ideal match. A 1:1 mutual skill swap would be awesome—no tokens needed for both of us!',
        timestamp: '2 days ago',
        type: 'text'
      },
      {
        id: 'm23',
        senderId: 'usr_2',
        text: 'Proposed a 1:1 Mutual Skill Swap: Spanish ↔ React.js',
        timestamp: 'Yesterday, 10:00 AM',
        type: 'session_proposal',
        sessionData: {
          id: 'sess_102',
          skill: 'Skill Swap: Spanish ↔ React.js',
          status: 'Accepted',
          scheduledFor: 'Thursday, 6:00 PM',
          durationMinutes: 40,
          tokenCost: 0
        }
      },
      {
        id: 'm24',
        senderId: 'usr_2',
        text: 'Perfect! See you for our Spanish-React exchange on Thursday.',
        timestamp: '2h ago',
        type: 'text'
      }
    ]
  },
  {
    id: 'conv_3',
    participantId: 'usr_3', // Dr. Priya Sharma
    unreadCount: 1,
    lastMessage: 'Would love to explore how we can optimize your vector search index.',
    lastMessageAt: 'Yesterday',
    activeSession: {
      id: 'sess_103',
      skill: 'Python for AI & Vector RAG',
      status: 'Pending',
      type: 'TUTORING',
      proposedBy: 'usr_me',
      tutorId: 'usr_3',
      studentId: 'usr_me',
      scheduledFor: 'Saturday, 11:00 AM (GMT)',
      durationMinutes: 30,
      tokenCost: 90,
      tutorPayout: 75,
      platformFee: 15,
      notes: 'Benchmarking embeddings with LangChain and HuggingFace'
    },
    messages: [
      {
        id: 'm31',
        senderId: 'usr_me',
        text: 'Hello Dr. Sharma! Your video on vector embeddings was remarkably lucid. Are you taking students for hands-on fine-tuning questions?',
        timestamp: 'Yesterday, 1:20 PM',
        type: 'text'
      },
      {
        id: 'm32',
        senderId: 'usr_3',
        text: 'Hello Alex! Yes indeed, I have slots open this weekend. Would love to explore how we can optimize your vector search index.',
        timestamp: 'Yesterday, 2:45 PM',
        type: 'text'
      },
      {
        id: 'm33',
        senderId: 'usr_me',
        text: 'Proposed a 30-minute session on Python for AI & Vector RAG.',
        timestamp: 'Yesterday, 3:10 PM',
        type: 'session_proposal',
        sessionData: {
          id: 'sess_103',
          skill: 'Python for AI & Vector RAG',
          status: 'Pending',
          scheduledFor: 'Saturday, 11:00 AM (GMT)',
          durationMinutes: 30,
          tokenCost: 90,
          tutorPayout: 75,
          platformFee: 15
        }
      }
    ]
  }
];

