// Centralized skill data, marketplace categories, proof of learning tasks,
// and career roadmaps for the Skill Gap Analyzer & Learning Companion.

export const SKILL_CATEGORIES = [
  'All Categories',
  'Programming, DSA & Web Dev',
  'Graphic Design, Video Editing & UI/UX',
  'Communication, English & Interview Prep',
  'Academic Subjects, Presentations & Projects',
  'Soft Skills, Productivity & Student Interests'
];

export const EVIDENCE_LEVELS = [
  {
    status: 'Self-Declared',
    badge: 'Self-Reported',
    color: 'slate',
    description: 'The student entered this skill on their profile. Pending practical task or peer verification.',
    verificationTier: 1
  },
  {
    status: 'Practical Task Completed',
    badge: 'Task Verified',
    color: 'blue',
    description: 'The student completed and submitted a concrete coding or design assignment on SkillSwap.',
    verificationTier: 2
  },
  {
    status: 'Peer-Reviewed',
    badge: 'Peer-Reviewed',
    color: 'teal',
    description: 'A verified campus peer mentor inspected the submitted evidence and confirmed proficiency against rubric standards.',
    verificationTier: 3
  },
  {
    status: 'Demonstrated Across Projects',
    badge: 'Project Master',
    color: 'purple',
    description: 'The skill is supported by multiple live projects, public repositories, and peer-teaching evaluations over time.',
    verificationTier: 4
  }
];

export const PROOF_OF_LEARNING_TASKS = [
  {
    id: 'task_1',
    skill: 'React.js',
    title: 'Build an Accessible Modal & Focus Trap with React 19',
    category: 'Programming, DSA & Web Dev',
    targetProficiency: 'Intermediate',
    objective: 'Create a reusable, fully accessible modal component adhering to WAI-ARIA dialog patterns with keyboard navigation and focus lock.',
    rubric: [
      'Component cleanly mounts in a Portal',
      'Esc key closes modal and restores previous focus',
      'Focus is trapped inside modal when open',
      'Zero layout shift or overflow bugs'
    ],
    submissionType: 'Code Sandbox / GitHub Repo',
    status: 'Approved', // 'Not Started' | 'Submitted' | 'Under Review' | 'Changes Requested' | 'Approved' | 'Rejected'
    submittedUrl: 'https://github.com/alexrivera-dev/react-modal-portal',
    mentorName: 'Elena Rostova',
    mentorFeedback: 'Impeccable focus management! The forwardRef hook implementation and clean escape listener cleanup make this production-ready.',
    reviewDate: 'Oct 14, 2026',
    creditsAwarded: 50
  },
  {
    id: 'task_2',
    skill: 'Three.js / WebGL',
    title: 'Interactive 3D Solar Model with GLSL Shaders',
    category: 'Programming, DSA & Web Dev',
    targetProficiency: 'Intermediate',
    objective: 'Implement custom vertex and fragment shaders for an orbiting planetary sphere with dynamic specular highlights and normal maps.',
    rubric: [
      'Smooth 60fps render loop on standard mobile devices',
      'Custom GLSL shader material with uniform time & light position',
      'Proper camera aspect ratio resize handling'
    ],
    submissionType: 'Live Demo URL + Repo Link',
    status: 'Under Review',
    submittedUrl: 'https://github.com/alexrivera-dev/webgl-orbit-canvas',
    mentorName: 'Elena Rostova',
    mentorFeedback: 'Submission received. Currently checking shader compile benchmarks on low-power devices.',
    reviewDate: 'Pending',
    creditsAwarded: 60
  },
  {
    id: 'task_3',
    skill: 'Data Structures & Algorithms',
    title: 'Balanced Binary Search Tree (AVL / Red-Black) Implementation',
    category: 'Programming, DSA & Web Dev',
    targetProficiency: 'Intermediate',
    objective: 'Implement self-balancing binary search tree insertion and deletion with O(log n) guarantees and full unit test coverage.',
    rubric: [
      'Correct left and right rotation implementations',
      'Height balance factor recalculated on every insert/delete',
      '100% test coverage with randomized edge cases'
    ],
    submissionType: 'GitHub Repository / LeetCode Submission Link',
    status: 'Approved',
    submittedUrl: 'https://github.com/alexrivera-dev/balanced-bst-algorithms',
    mentorName: 'Dr. Priya Sharma',
    mentorFeedback: 'Rigorous proof of rotation invariants. Outstanding test assertions covering all 4 imbalance cases.',
    reviewDate: 'Sep 28, 2026',
    creditsAwarded: 70
  },
  {
    id: 'task_4',
    skill: 'Product Design (Figma)',
    title: 'Tokenized Mobile Design System & Auto-Layout Flow',
    category: 'Graphic Design, Video Editing & UI/UX',
    targetProficiency: 'Intermediate',
    objective: 'Design a 4-screen student onboarding flow using W3C semantic design tokens, responsive auto-layout, and interactive component variants.',
    rubric: [
      'Semantic color, typography, and spacing variables defined',
      'Strict Auto-Layout with zero fixed pixel containers',
      'Interactive Figma prototype with smart animations'
    ],
    submissionType: 'Figma Community / File Link',
    status: 'Changes Requested',
    submittedUrl: 'https://figma.com/@alexrivera/student-onboarding-draft',
    mentorName: 'Marcus Chen',
    mentorFeedback: 'Great visual hierarchy! Please refine the contrast ratio on disabled button states and add intermediate error states for input fields before final approval.',
    reviewDate: 'Oct 18, 2026',
    creditsAwarded: 50
  }
];

export const CAREER_ROADMAPS = [
  {
    id: 'road_fullstack',
    title: 'Full-Stack Web Developer',
    role: 'Modern Full-Stack Engineer (React, Node, SQL, Cloud)',
    description: 'Master frontend architecture, resilient backend APIs, relational databases, and end-to-end fullstack deployment.',
    totalMilestones: 5,
    completedMilestones: 3,
    milestones: [
      {
        id: 'm1',
        title: 'HTML5, Semantic Accessibility & Tailwind CSS',
        status: 'Completed',
        currentLevel: 'Advanced',
        skills: ['HTML5', 'Tailwind CSS', 'Web Accessibility (ARIA)'],
        suggestedProject: 'Accessible Responsive Marketing Landing Page',
        mentors: ['Marcus Chen', 'Alex Rivera']
      },
      {
        id: 'm2',
        title: 'Modern JavaScript (ESNext) & TypeScript In-Depth',
        status: 'Completed',
        currentLevel: 'Advanced',
        skills: ['TypeScript', 'Async/Await', 'Generics', 'DOM Architecture'],
        suggestedProject: 'Type-Safe In-Memory State Store with Observables',
        mentors: ['Alex Rivera', 'Elena Rostova']
      },
      {
        id: 'm3',
        title: 'React 19 & Frontend Architecture',
        status: 'Completed',
        currentLevel: 'Advanced',
        skills: ['React.js', 'Hooks', 'Server Actions', 'Optimistic UI'],
        suggestedProject: 'Production-Grade Dashboard with Client Escrow Management',
        mentors: ['Alex Rivera']
      },
      {
        id: 'm4',
        title: 'Node.js, Express & REST/GraphQL API Design',
        status: 'In Progress',
        currentLevel: 'Intermediate',
        skills: ['Node.js', 'Express', 'JWT Authentication', 'API Security'],
        suggestedProject: 'Real-Time Peer Messaging & Webhook Event Server',
        mentors: ['Carlos Mendoza', 'Elena Rostova']
      },
      {
        id: 'm5',
        title: 'Relational Databases (PostgreSQL) & Full-Stack Deployment',
        status: 'Not Started',
        currentLevel: 'Beginner',
        skills: ['PostgreSQL', 'Prisma ORM', 'Docker', 'CI/CD Pipelines'],
        suggestedProject: 'Deploy Monolith with Neon Database and Automated Testing',
        mentors: ['Elena Rostova', 'Dr. Priya Sharma']
      }
    ]
  },
  {
    id: 'road_aiml',
    title: 'AI & Machine Learning Engineer',
    role: 'Applied AI & Neural Search Engineer',
    description: 'Build foundations in linear algebra, machine learning, deep learning with PyTorch, and deploy production LLM RAG pipelines.',
    totalMilestones: 5,
    completedMilestones: 1,
    milestones: [
      {
        id: 'ai_m1',
        title: 'Python for Data Science & Numerical Computing',
        status: 'Completed',
        currentLevel: 'Advanced',
        skills: ['Python 3.12', 'NumPy', 'Pandas', 'Vectorized Math'],
        suggestedProject: 'Data Pipeline Cleaning & Statistical Distribution Analyzer',
        mentors: ['Dr. Priya Sharma']
      },
      {
        id: 'ai_m2',
        title: 'Classical Machine Learning & Feature Engineering',
        status: 'In Progress',
        currentLevel: 'Intermediate',
        skills: ['Scikit-Learn', 'Regression', 'Decision Trees', 'Cross-Validation'],
        suggestedProject: 'Student Grade & Session Success Predictor Model',
        mentors: ['Dr. Priya Sharma']
      },
      {
        id: 'ai_m3',
        title: 'Deep Learning with PyTorch',
        status: 'Not Started',
        currentLevel: 'Beginner',
        skills: ['PyTorch', 'Backpropagation', 'CNNs', 'Loss Functions'],
        suggestedProject: 'Handwritten Digit & Mathematical Symbol Classifier',
        mentors: ['Dr. Priya Sharma']
      },
      {
        id: 'ai_m4',
        title: 'Embeddings, Vector Search & RAG Architecture',
        status: 'Not Started',
        currentLevel: 'Beginner',
        skills: ['Vector Databases', 'HuggingFace', 'LangChain', 'Cosine Similarity'],
        suggestedProject: 'Campus Coursework Question Answering Semantic Search',
        mentors: ['Dr. Priya Sharma']
      },
      {
        id: 'ai_m5',
        title: 'Fine-Tuning Small Language Models & Model Deployment',
        status: 'Not Started',
        currentLevel: 'Beginner',
        skills: ['LoRA / QLoRA', 'Ollama / vLLM', 'FastAPI Serving'],
        suggestedProject: 'Domain-Tuned Peer Study Bot with Local Inference',
        mentors: ['Dr. Priya Sharma']
      }
    ]
  },
  {
    id: 'road_uiux',
    title: 'UI/UX Product Designer',
    role: 'Digital Product Designer & Design Systems Architect',
    description: 'From user research and mental models to tokenized design systems and interactive micro-interactions.',
    totalMilestones: 4,
    completedMilestones: 2,
    milestones: [
      {
        id: 'ux_m1',
        title: 'User Research, Personas & Information Architecture',
        status: 'Completed',
        currentLevel: 'Advanced',
        skills: ['User Interviews', 'Empathy Maps', 'Card Sorting', 'Sitemaps'],
        suggestedProject: 'Campus Ride-Sharing User Research Synthesis Deck',
        mentors: ['Marcus Chen']
      },
      {
        id: 'ux_m2',
        title: 'Wireframing, Typography & Visual Hierarchy',
        status: 'Completed',
        currentLevel: 'Intermediate',
        skills: ['Low-Fi Wireframes', 'Typographic Hierarchy', 'Grid Systems'],
        suggestedProject: 'Peer Tutoring Booking Web Flow Low-Fi Wireframe',
        mentors: ['Marcus Chen']
      },
      {
        id: 'ux_m3',
        title: 'Figma Auto-Layout & Semantic Token Systems',
        status: 'In Progress',
        currentLevel: 'Intermediate',
        skills: ['Figma Variables', 'Design Tokens', 'Component Variants'],
        suggestedProject: 'Complete 24-Component Student Design System Library',
        mentors: ['Marcus Chen']
      },
      {
        id: 'ux_m4',
        title: 'Micro-Interactions, Usability Testing & Handoff',
        status: 'Not Started',
        currentLevel: 'Beginner',
        skills: ['Smart Animate', 'WCAG AAA Accessibility', 'Developer Handoff'],
        suggestedProject: 'Full Interactive High-Fidelity Mobile App Case Study',
        mentors: ['Marcus Chen']
      }
    ]
  }
];

export const AI_COMPANION_PROMPTS = [
  {
    type: 'explain',
    title: 'Explain Concept',
    prompt: 'Explain how binary tree balancing works like I am a beginner.'
  },
  {
    type: 'quiz',
    title: 'Generate Practice Questions',
    prompt: 'Give me 3 diagnostic practice questions to test my React state knowledge.'
  },
  {
    type: 'session_prep',
    title: 'Prepare Session Questions',
    prompt: 'What are the top 3 questions I should ask Elena in our Three.js shader session?'
  },
  {
    type: 'revision_notes',
    title: 'Synthesize Revision Notes',
    prompt: 'Turn my rough session notes into structured flashcard bullet points.'
  }
];
