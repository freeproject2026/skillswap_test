import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Image, X, Check, AlertTriangle, Film } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { videoService } from '../services/videoService';
import { CATEGORIES } from '../data/mockVideos';
import { CURRENT_USER } from '../data/mockUsers';

export const VideoUpload = () => {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const fileRef = useRef(null);
  const thumbRef = useRef(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Programming');
  const [skills, setSkills] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) setVideoFile(file);
  };

  const handleThumbSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setThumbPreview(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { showToast('Please add a title', 'error'); return; }

    setUploading(true);
    setProgress(0);

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 2) {
      await new Promise(r => setTimeout(r, 40));
      setProgress(i);
    }

    try {
      await videoService.uploadVideo({
        title: title.trim(),
        description: description.trim(),
        category,
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        thumbnailPreview: thumbPreview || undefined,
        creator: {
          id: CURRENT_USER.id,
          name: CURRENT_USER.name,
          username: CURRENT_USER.username,
          avatar: CURRENT_USER.avatar,
          title: CURRENT_USER.title,
          subscribers: '18.4K',
          isFollowed: false,
          rating: CURRENT_USER.rating,
          tokensRate: 60
        }
      });
      setDone(true);
      showToast('Demo upload complete!');
    } catch (err) {
      showToast('Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center pb-24">
        <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-teal-600 dark:text-teal-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Demo Upload Complete!</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Your video has been added to the local feed for preview.</p>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-700 dark:text-amber-300 font-medium mb-6">
          <AlertTriangle className="w-3.5 h-3.5" />
          This is a demo — no video was published to a real server.
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate('/')} className="px-6 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors shadow-sm">View Feed</button>
          <button onClick={() => { setDone(false); setTitle(''); setDescription(''); setVideoFile(null); setThumbPreview(null); setSkills(''); setProgress(0); }} className="px-6 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors">Upload Another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-24">
      {/* Demo Disclaimer */}
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 mb-5">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">Demo Mode — uploads are simulated locally and not sent to any server.</p>
      </div>

      <h1 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 mb-5 flex items-center gap-2">
        <Film className="w-5 h-5 text-teal-600 dark:text-teal-400" /> Upload Video
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Video File Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Video File</label>
          <div
            onClick={() => fileRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${videoFile ? 'border-teal-400 bg-teal-50/50 dark:bg-teal-950/30' : 'border-slate-200 dark:border-slate-700 hover:border-teal-400 bg-white dark:bg-slate-850/60'}`}
          >
            <input ref={fileRef} type="file" accept="video/*" onChange={handleVideoSelect} className="hidden" />
            {videoFile ? (
              <div className="flex items-center justify-center gap-3">
                <Film className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                <span className="text-sm font-semibold text-teal-700 dark:text-teal-300">{videoFile.name}</span>
                <button type="button" onClick={(e) => { e.stopPropagation(); setVideoFile(null); }} className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-950/50"><X className="w-4 h-4 text-red-500" /></button>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Click or drag to select a video file</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">MP4, MOV, AVI up to 500MB</p>
              </>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Title *</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., React Hooks Deep Dive Tutorial" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/30 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500" required />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What will viewers learn in this video?" rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/30 outline-none transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500" />
        </div>

        {/* Category & Skills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/30 outline-none bg-white dark:bg-slate-800 transition-all">
              {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Skills Taught</label>
            <input type="text" value={skills} onChange={e => setSkills(e.target.value)} placeholder="React, Hooks, State (comma-separated)" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/30 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500" />
          </div>
        </div>

        {/* Thumbnail */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Thumbnail</label>
          <div className="flex items-center gap-4">
            <div onClick={() => thumbRef.current?.click()} className="w-32 h-20 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-teal-400 flex items-center justify-center cursor-pointer bg-white dark:bg-slate-800 overflow-hidden transition-all">
              <input ref={thumbRef} type="file" accept="image/*" onChange={handleThumbSelect} className="hidden" />
              {thumbPreview ? <img src={thumbPreview} alt="Thumb" className="w-full h-full object-cover" /> : <Image className="w-5 h-5 text-slate-400 dark:text-slate-500" />}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500">Optional. PNG/JPG, 16:9 ratio recommended.</p>
          </div>
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Visibility</label>
          <div className="flex gap-3">
            {['public', 'unlisted', 'private'].map(v => (
              <label key={v} className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-all ${visibility === v ? 'bg-teal-50 dark:bg-teal-950/50 border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 font-semibold' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                <input type="radio" name="visibility" value={v} checked={visibility === v} onChange={() => setVisibility(v)} className="sr-only" />
                <span className={`w-3 h-3 rounded-full border-2 ${visibility === v ? 'bg-teal-600 border-teal-600' : 'border-slate-300 dark:border-slate-600'}`}></span>
                <span className="text-sm capitalize">{v}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">{progress}% — Simulating upload...</p>
          </div>
        )}

        {/* Submit */}
        <button type="submit" disabled={uploading || !title.trim()} className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed transition-all shadow-sm shadow-teal-500/20">
          <Upload className="w-4 h-4" />
          {uploading ? 'Uploading...' : 'Upload Video'}
        </button>
      </form>
    </div>
  );
};

export default VideoUpload;
