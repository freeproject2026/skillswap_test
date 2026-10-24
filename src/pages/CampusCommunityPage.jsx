import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Trophy, Award, Calendar, Flame, CheckCircle,
  Sparkles, ExternalLink, UserPlus, Star, ArrowRight, ShieldCheck
} from 'lucide-react';
import { campusCommunityService } from '../services/campusCommunityService';
import { useApp } from '../context/AppContext';
import { AuthModal } from '../components/auth/AuthModal';

const TABS = ['Communities', 'Weekly Challenges', 'Peer Workshops', 'Hackathon Teams', 'Leaderboard'];

export const CampusCommunityPage = () => {
  const navigate = useNavigate();
  const { showToast, isGuest, currentUser, setAuthModalOpen } = useApp();

  const [activeTab, setActiveTab] = useState('Communities');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await campusCommunityService.getCommunityData();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleJoin = async (commId) => {
    if (isGuest || !currentUser) {
      setAuthModalOpen(true);
      return;
    }
    try {
      await campusCommunityService.toggleJoinCommunity(commId);
      showToast('Community membership updated!');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleWorkshop = async (wsId) => {
    if (isGuest || !currentUser) {
      setAuthModalOpen(true);
      return;
    }
    try {
      await campusCommunityService.toggleRegisterWorkshop(wsId);
      showToast('Workshop registration updated!');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitChallenge = async (chalId) => {
    if (isGuest || !currentUser) {
      setAuthModalOpen(true);
      return;
    }
    try {
      await campusCommunityService.submitChallengeSolution(chalId);
      showToast('Challenge solution submitted for peer evaluation! +50 Credits queued.');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyTeam = () => {
    if (isGuest || !currentUser) {
      setAuthModalOpen(true);
      return;
    }
    showToast('Applied to join hackathon team!');
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-400 mt-2">Loading campus circles and challenges...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-5 pb-24 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">Campus Skill Community</h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Join collegiate study circles, sprint on weekly challenges, and earn merit credit through peer mentoring
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab: Communities */}
      {activeTab === 'Communities' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.communities.map(comm => (
            <div
              key={comm.id}
              className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-soft flex flex-col justify-between"
            >
              <div>
                <div className="h-28 relative">
                  <img src={comm.banner} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <span className="absolute bottom-2 left-3 text-white text-xs font-bold drop-shadow-sm">
                    {comm.college}
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-snug">{comm.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{comm.description}</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {comm.topics.slice(0, 3).map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800 mt-3 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{comm.memberCount} Members</span>
                <button
                  onClick={() => handleToggleJoin(comm.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    comm.isJoined
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      : 'bg-teal-600 text-white hover:bg-teal-700 shadow-xs'
                  }`}
                >
                  {comm.isJoined ? 'Joined' : 'Join Circle'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Weekly Challenges */}
      {activeTab === 'Weekly Challenges' && (
        <div className="space-y-3">
          {data.challenges.map(chal => (
            <div
              key={chal.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                    Reward: +{chal.creditsReward} Credits
                  </span>
                  <span className="text-xs text-slate-400">{chal.deadline}</span>
                  <span className="text-xs text-slate-400">· {chal.participantsCount} Students</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{chal.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">{chal.description}</p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {chal.status === 'Submitted' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle className="w-3.5 h-3.5" /> Solution Submitted
                  </span>
                ) : (
                  <button
                    onClick={() => handleSubmitChallenge(chal.id)}
                    className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 shadow-xs"
                  >
                    Submit Proof
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Peer Workshops */}
      {activeTab === 'Peer Workshops' && (
        <div className="space-y-3">
          {data.workshops.map(ws => (
            <div
              key={ws.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 text-[10px] font-bold border border-teal-100 dark:border-teal-800/60">
                  {ws.format}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">{ws.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Host: <strong>{ws.host}</strong> · {ws.date}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{ws.attendeesCount} Registered Peers · {ws.creditsCost === 0 ? 'Free Entry' : `${ws.creditsCost} Credits`}</p>
              </div>

              <button
                onClick={() => handleToggleWorkshop(ws.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  ws.isRegistered
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    : 'bg-teal-600 text-white hover:bg-teal-700 shadow-xs'
                }`}
              >
                {ws.isRegistered ? 'Registered (Leave)' : 'Register for Workshop'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Hackathon Teams */}
      {activeTab === 'Hackathon Teams' && (
        <div className="space-y-3">
          {data.teams.map(team => (
            <div
              key={team.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full">
                  {team.event}
                </span>
                <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">{team.openSpots} open spots</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{team.projectTitle}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                <strong>Looking for:</strong> {team.lookingFor.join(' · ')}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <strong>Current Members:</strong> {team.members.join(', ')}
              </p>
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleApplyTeam}
                  className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-700"
                >
                  Apply to Join
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Contribution Leaderboard */}
      {activeTab === 'Leaderboard' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Quality-Driven Campus Recognition</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Rankings weighted by verified evidence badges, peer satisfaction ratings, and endorsed teaching hours
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.leaderboard.map((item, index) => (
              <div key={item.id} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    index === 0 ? 'bg-amber-400 text-slate-950 font-extrabold' : index === 1 ? 'bg-slate-300 text-slate-800' : index === 2 ? 'bg-amber-600 text-white' : 'text-slate-400'
                  }`}>
                    {item.rank}
                  </span>
                  <img src={item.avatar} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-teal-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate flex items-center gap-1">
                      {item.name}
                      {item.id === 'usr_me' && (
                        <span className="text-[10px] font-bold px-1.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">You</span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.college}</p>
                    <p className="text-[11px] text-teal-700 dark:text-teal-400 italic truncate">{item.highlight}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-sm font-extrabold text-teal-700 dark:text-teal-400">{item.meritCredits} Merit Cr</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    ★ {item.qualityRating} · {item.evidenceBadges} Badges
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <AuthModal />
    </div>
  );
};

export default CampusCommunityPage;