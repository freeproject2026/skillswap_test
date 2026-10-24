import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, Video, MapPin, ArrowRight,
  BookOpen, GraduationCap, ChevronRight, CheckCircle2
} from 'lucide-react';
import { sessionService } from '../../services/sessionService';

export const UpcomingSessionsCard = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fallback demo sessions if none fetched
  const fallbackSessions = [
    {
      id: 'sess_demo_1',
      skill: 'Python for Beginners & Data Structures',
      partnerName: 'Elena Rostova',
      partnerDetails: 'TU Berlin · Computer Science',
      partnerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
      dateTime: 'Tomorrow, 5:30 PM (CET)',
      format: 'Live Online Session',
      type: 'Learning',
      status: 'Upcoming'
    },
    {
      id: 'sess_demo_2',
      skill: 'UI/UX Design Basics & Figma Tokens',
      partnerName: 'Marcus Chen',
      partnerDetails: 'Univ of Toronto · Product Design',
      partnerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
      dateTime: 'Friday, 4:00 PM (EST)',
      format: 'Online & Code Review',
      type: 'Teaching',
      status: 'Confirmed'
    },
    {
      id: 'sess_demo_3',
      skill: 'DSA – Arrays, Strings & Binary Trees',
      partnerName: 'Carlos Mendoza',
      partnerDetails: 'UPM Madrid · Software Eng',
      partnerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
      dateTime: 'Sunday, 11:00 AM (CET)',
      format: 'On Campus Lab (Room 302)',
      type: 'Learning',
      status: 'Upcoming'
    }
  ];

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await sessionService.getSessions();
        if (data && data.length > 0) {
          // Format into card display rows
          const formatted = data.slice(0, 3).map(s => {
            const isLearning = s.studentId === 'usr_me';
            return {
              id: s.id,
              skill: s.skill,
              partnerName: isLearning ? s.tutorName : s.studentName,
              partnerDetails: isLearning ? (s.tutorCollege || 'Campus Peer Tutor') : (s.studentCollege || 'Student Learner'),
              partnerAvatar: isLearning ? s.tutorAvatar : s.studentAvatar,
              dateTime: `${s.scheduledDate}, ${s.scheduledTime}`,
              format: s.format || 'Live Online Session',
              type: isLearning ? 'Learning' : 'Teaching',
              status: s.status || 'Upcoming'
            };
          });
          setSessions(formatted);
        } else {
          setSessions(fallbackSessions);
        }
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setSessions(fallbackSessions);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
              Upcoming Sessions
            </h3>
            <p className="text-[11px] text-slate-400">
              Scheduled 1:1 peer learning & exchanges
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/sessions')}
          className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1 group"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Sessions List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/60 my-2">
        {loading ? (
          <div className="py-8 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          sessions.map((sess) => (
            <div
              key={sess.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-slate-50/70 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
            >
              {/* Left: Partner info & Session details */}
              <div className="flex items-start gap-3">
                <img
                  src={sess.partnerAvatar}
                  alt={sess.partnerName}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800 shrink-0 mt-0.5"
                />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {sess.skill}
                    </h4>

                    {/* Learning / Teaching badge */}
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        sess.type === 'Learning'
                          ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40'
                          : 'bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/40'
                      }`}
                    >
                      {sess.type}
                    </span>

                    {/* Status Badge */}
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                      {sess.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    with <span className="font-semibold text-slate-700 dark:text-slate-300">{sess.partnerName}</span> · {sess.partnerDetails}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {sess.dateTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Video className="w-3 h-3 text-slate-400" />
                      {sess.format}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: View Details CTA */}
              <div className="shrink-0 self-end sm:self-center">
                <button
                  onClick={() => navigate(`/room/${sess.id}`)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-600 hover:text-white dark:hover:bg-teal-600 dark:hover:text-white text-slate-700 dark:text-slate-300 text-xs font-bold transition-all shadow-2xs"
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom status note */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
        <span>3 scheduled sessions this week</span>
        <span className="text-teal-600 dark:text-teal-400 font-semibold cursor-pointer" onClick={() => navigate('/sessions')}>
          Calendar View →
        </span>
      </div>
    </div>
  );
};

export default UpcomingSessionsCard;
