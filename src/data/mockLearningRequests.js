// Realistic mock learning requests submitted by students

export const MOCK_LEARNING_REQUESTS = [
  {
    id: 'req_1',
    authorId: 'usr_me',
    authorName: 'Alex Rivera',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    college: 'UC Berkeley',
    title: 'Need help understanding and balancing Binary Search Trees for CS exam',
    description: 'Struggling with AVL tree rotations (left-right and right-left cases) and amortized tree balance guarantees. Need an experienced peer to walk through code examples together.',
    skill: 'Data Structures & Algorithms',
    category: 'Programming, DSA & Web Dev',
    currentProficiency: 'Beginner',
    targetProficiency: 'Intermediate',
    learningGoal: 'Master all 4 tree rotation cases and trace recursion trees without hesitation',
    desiredOutcome: 'Write bug-free BST insertion and deletion with O(log n) performance in C++ or Python',
    preferredSchedule: 'Weekday Evenings (after 6 PM PST)',
    language: 'English',
    format: 'Live Online Session',
    proposedCredits: 40,
    status: 'Open', // 'Open' | 'Responses Received' | 'Accepted' | 'Completed' | 'Cancelled'
    createdAt: '3 hours ago',
    responses: []
  },
  {
    id: 'req_2',
    authorId: 'usr_4',
    authorName: 'Marcus Chen',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    college: 'University of Toronto',
    title: 'Seeking frontend partner to pair on Tailwind CSS design system tokens',
    description: 'I created a Figma tokens repository and want a developer to help implement the matching Tailwind theme plugin and test accessibility contrast.',
    skill: 'Tailwind CSS',
    category: 'Graphic Design, Video Editing & UI/UX',
    currentProficiency: 'Intermediate',
    targetProficiency: 'Advanced',
    learningGoal: 'Translate Figma color & font variables directly into tailwind.config.js plugins',
    desiredOutcome: 'An open-source accessible UI component library for our campus hackathon',
    preferredSchedule: 'Saturday Afternoon',
    language: 'English',
    format: 'Shared Project',
    proposedCredits: 60,
    status: 'Responses Received',
    createdAt: '1 day ago',
    responses: [
      {
        id: 'resp_201',
        responderId: 'usr_me',
        responderName: 'Alex Rivera',
        responderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        message: 'Hey Marcus! I would love to pair on this. I built custom Tailwind plugin tokens for our university portal.',
        proposedTime: 'Saturday 2:00 PM',
        status: 'Pending'
      }
    ]
  },
  {
    id: 'req_3',
    authorId: 'usr_2',
    authorName: 'Carlos Mendoza',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    college: 'UPM Madrid',
    title: 'Mutual Skill Swap: Conversational Spanish for React 19 State Management',
    description: 'Offering native Spanish conversation in exchange for code review and hands-on guidance on React 19 forms and optimistic updates. Zero tokens required!',
    skill: 'React.js',
    category: 'Programming, DSA & Web Dev',
    currentProficiency: 'Beginner',
    targetProficiency: 'Intermediate',
    learningGoal: 'Master server actions and client-side form validation',
    desiredOutcome: 'A working tutoring appointment booking form in React',
    preferredSchedule: 'Thursday or Weekend',
    language: 'Spanish / English',
    format: 'Live Online Session',
    proposedCredits: 0, // Mutual exchange
    status: 'Accepted',
    createdAt: '2 days ago',
    responses: [
      {
        id: 'resp_301',
        responderId: 'usr_me',
        responderName: 'Alex Rivera',
        responderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        message: 'Perfect match! I want to prepare for my Madrid semester. Let us do a 40-min 50/50 swap.',
        proposedTime: 'Thursday 6:00 PM',
        status: 'Accepted'
      }
    ]
  },
  {
    id: 'req_4',
    authorId: 'usr_6',
    authorName: 'Liam O’Connor',
    authorAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
    college: 'Trinity College Dublin',
    title: 'Help debugging Web Audio API AnalyserNode in React canvas',
    description: 'Building an audio visualizer for my synthesis tutorial. The frequency bin array freezes after 10 seconds of playback on Chrome.',
    skill: 'JavaScript / Web Audio API',
    category: 'Programming, DSA & Web Dev',
    currentProficiency: 'Intermediate',
    targetProficiency: 'Advanced',
    learningGoal: 'Understand requestAnimationFrame timing with Web Audio context state transitions',
    desiredOutcome: 'Smooth 60 FPS real-time audio FFT spectrum visualizer',
    preferredSchedule: 'Friday Evening',
    language: 'English',
    format: 'Live Online Session',
    proposedCredits: 50,
    status: 'Open',
    createdAt: '4 hours ago',
    responses: []
  }
];
