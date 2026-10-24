import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, PlusCircle, Sparkles, Laptop, BookOpen, Code, GraduationCap, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const HeroBanner = () => {
  const navigate = useNavigate();
  const { currentUser } = useApp();

  const firstName = currentUser?.name?.split(' ')[0] || 'Alex';

  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-[#0c1834] via-[#14234b] to-[#1a1c3d] p-6 sm:p-8 lg:p-10 text-white overflow-hidden shadow-xl border border-slate-700/50">
      {/* Background ambient lighting effects */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side Content (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-5">
          {/* Welcome Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-teal-300 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            <span>Welcome back, {firstName}! 👋</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-white">
            Exchange Skills. <br />
            <span className="bg-gradient-to-r from-teal-300 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
              Build Your Future.
            </span>
          </h1>

          {/* Subtitle / Description */}
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
            Join a community of students teaching, learning and growing together. Find the right peer, learn new skills, earn credits and build your Skill Passport.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => navigate('/connect/people')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Find a Skill Match</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/requests')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/20 transition-all hover:-translate-y-0.5 active:translate-y-0 backdrop-blur-md"
            >
              <PlusCircle className="w-4 h-4 text-teal-300" />
              <span>Post a Learning Request</span>
            </button>
          </div>
        </div>

        {/* Right Side Illustration Area (5 cols on lg) */}
        <div className="lg:col-span-5 flex items-center justify-center relative">
          <div className="relative w-full max-w-md aspect-[4/3] flex items-center justify-center">
            
            {/* Glowing Backdrop Circle */}
            <div className="absolute inset-4 rounded-3xl bg-gradient-to-tr from-teal-500/20 via-indigo-500/20 to-purple-500/20 border border-white/10 backdrop-blur-md"></div>

            {/* Central Graphic / Student Collaboration SVG */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6">
              
              {/* Floating Teach & Learn Hub */}
              <div className="relative w-full flex items-center justify-between gap-4">
                
                {/* Left Card: Student Teaching */}
                <div className="relative flex-1 bg-slate-900/80 backdrop-blur-md p-3.5 rounded-2xl border border-teal-500/30 shadow-lg transform -rotate-1 hover:rotate-0 transition-transform">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 text-[10px] font-extrabold uppercase tracking-wider border border-teal-500/40">
                      Teach
                    </span>
                    <Laptop className="w-3.5 h-3.5 text-teal-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                      alt="Student tutor"
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-teal-400"
                    />
                    <div className="text-left">
                      <p className="text-[11px] font-bold text-white leading-tight">Alex (You)</p>
                      <p className="text-[10px] text-teal-300 font-mono">React.js & CSS</p>
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] bg-slate-800/80 px-2 py-1 rounded text-slate-300 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                    <span>+60 Credits / hr</span>
                  </div>
                </div>

                {/* Center Swap Arrow Node */}
                <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-tr from-teal-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-teal-500/30 text-slate-950 font-bold z-20 animate-bounce duration-1000">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-950 fill-none stroke-current stroke-[2.5] stroke-linecap-round stroke-linejoin-round">
                    <path d="M17 4v6h-6" />
                    <path d="M7 20v-6h6" />
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L3 8" />
                    <path d="M3.51 15a9 9 0 0 0 14.85 3.36L21 16" />
                  </svg>
                </div>

                {/* Right Card: Student Learning */}
                <div className="relative flex-1 bg-slate-900/80 backdrop-blur-md p-3.5 rounded-2xl border border-purple-500/30 shadow-lg transform rotate-1 hover:rotate-0 transition-transform">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-extrabold uppercase tracking-wider border border-purple-500/40">
                      Learn
                    </span>
                    <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <img
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
                      alt="Student peer"
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-purple-400"
                    />
                    <div className="text-left">
                      <p className="text-[11px] font-bold text-white leading-tight">Elena R.</p>
                      <p className="text-[10px] text-purple-300 font-mono">Three.js / WebGL</p>
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] bg-slate-800/80 px-2 py-1 rounded text-slate-300 flex items-center gap-1">
                    <CheckCircle className="w-2.5 h-2.5 text-emerald-400" />
                    <span>Skill Passport verified</span>
                  </div>
                </div>

              </div>

              {/* Floating Verified Badge pill below */}
              <div className="mt-4 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] text-slate-200 flex items-center gap-2 shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Active 1:1 Peer Knowledge Exchange on Campus</span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
