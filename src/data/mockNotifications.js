// Realistic mock notifications and dual-ledger wallet transactions
// Supports separate Skill-Exchange Credits vs Paid Tokens, and escrow statuses

export const MOCK_NOTIFICATIONS = [
  {
    id: 'notif_1',
    type: 'connection_request',
    title: 'New Connection Request',
    description: 'Marcus Chen wants to connect with you. He teaches Figma Design Systems at University of Toronto.',
    userId: 'usr_4',
    user: {
      name: 'Marcus Chen',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      title: 'Lead Product Designer',
      skillMatch: 'Can teach: Figma Design Systems'
    },
    isRead: false,
    timestamp: '25m ago',
    actionRequired: true,
    status: 'pending' // 'pending' | 'accepted' | 'declined'
  },
  {
    id: 'notif_2',
    type: 'session_accepted',
    title: 'Session Escrow Locked & Confirmed',
    description: 'Elena Rostova accepted your Three.js session for Tomorrow at 5:30 PM. 60 Skill Credits are reserved in escrow.',
    userId: 'usr_1',
    user: {
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      title: 'Visual Computing Scholar'
    },
    isRead: false,
    timestamp: '1h ago',
    actionRequired: false,
    tokenAmount: 60,
    currencyType: 'skill_credit'
  },
  {
    id: 'notif_3',
    type: 'skill_swap_request',
    title: 'Two-Sided Confirmation Needed',
    description: 'Your 1:1 Skill Swap with Carlos Mendoza ended. Both of you must independently confirm completion to update merit badges.',
    userId: 'usr_2',
    user: {
      name: 'Carlos Mendoza',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      title: 'Native Spanish Coach'
    },
    isRead: false,
    timestamp: '2h ago',
    actionRequired: true,
    status: 'awaiting_confirmation'
  },
  {
    id: 'notif_4',
    type: 'token_credit',
    title: 'Starter Learning Credits Credited',
    description: 'Welcome to SkillSwap! 150 skill-exchange credits and 100 starter tokens have been credited to your campus account.',
    isRead: true,
    timestamp: '1d ago',
    actionRequired: false,
    tokenAmount: 150,
    currencyType: 'skill_credit'
  },
  {
    id: 'notif_5',
    type: 'new_follower',
    title: 'New Campus Follower',
    description: 'Sarah Jenkins (UT Austin) started following your React & algorithm tutorials.',
    userId: 'usr_5',
    user: {
      name: 'Sarah Jenkins',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
      title: 'TEDx Campus Speaker'
    },
    isRead: true,
    timestamp: '2d ago',
    actionRequired: false
  }
];

export const MOCK_WALLET_TRANSACTIONS = [
  {
    id: 'tx_escrow_1',
    type: 'reserved',
    currencyType: 'skill_credit',
    title: 'Escrow Lock: Upcoming Three.js / WebGL Session',
    counterparty: 'Elena Rostova (TU Berlin)',
    date: 'Oct 22, 2026',
    amount: -60,
    status: 'Reserved', // 'Pending' | 'Reserved' | 'Completed' | 'Refunded' | 'Disputed'
    category: 'escrow_hold',
    note: 'Held in platform escrow until both learner & tutor confirm session completion.'
  },
  {
    id: 'tx_1',
    type: 'credit',
    currencyType: 'skill_credit',
    title: 'Taught 30-min React 19 State Architecture Lab',
    counterparty: 'David Kim (UC Berkeley)',
    date: 'Oct 21, 2026',
    amount: 65,
    status: 'Completed',
    category: 'tutoring_earned',
    note: 'Two-sided confirmation completed. 65 credits released from escrow.'
  },
  {
    id: 'tx_2',
    type: 'debit',
    currencyType: 'skill_credit',
    title: 'Learned Python for AI & Vector RAG (30 mins)',
    counterparty: 'Dr. Priya Sharma (Imperial College)',
    date: 'Oct 19, 2026',
    amount: -75,
    status: 'Completed',
    category: 'tutoring_spent',
    note: 'Two-sided confirmation completed. Rating submitted.'
  },
  {
    id: 'tx_swap',
    type: 'credit',
    currencyType: 'skill_credit',
    title: 'Mutual Skill Exchange: Spanish ↔ React.js',
    counterparty: 'Carlos Mendoza (UPM Madrid)',
    date: 'Oct 21, 2026',
    amount: 0,
    status: 'Pending',
    category: 'mutual_swap',
    note: '0 credits charged for 1:1 mutual barter exchange. Pending tutor confirmation.'
  },
  {
    id: 'tx_dispute',
    type: 'hold',
    currencyType: 'skill_credit',
    title: 'Settlement Paused: Figma Tokens Design Review',
    counterparty: 'Marcus Chen (U of Toronto)',
    date: 'Oct 15, 2026',
    amount: -50,
    status: 'Disputed',
    category: 'disputed_hold',
    note: 'Hardware drop reported. 50 credits paused in escrow pending campus review.'
  },
  {
    id: 'tx_refund',
    type: 'credit',
    currencyType: 'skill_credit',
    title: 'Automated Refund: Cancelled C++ Trees Session',
    counterparty: 'Campus Tutor Pool',
    date: 'Oct 12, 2026',
    amount: 40,
    status: 'Refunded',
    category: 'refund',
    note: 'Session cancelled > 4 hours in advance. Full 100% credit refund returned.'
  },
  {
    id: 'tx_tokens_welcome',
    type: 'credit',
    currencyType: 'paid_token',
    title: 'Welcome Campus Starter Credits',
    counterparty: 'SkillSwap Academic Grant',
    date: 'Oct 10, 2026',
    amount: 100,
    status: 'Completed',
    category: 'bonus',
    note: 'Initial trial grant for undergraduate tutoring experiments.'
  }
];
