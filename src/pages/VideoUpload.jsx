import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Image, X, Check, AlertTriangle, Film, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { videoService } from '../services/videoService';
import { API_BASE_URL } from '../services/api';
import { CATEGORIES } from './VideoHome';
import { AuthGate } from '../components/auth/AuthGate';
import { AuthModal } from '../components/auth/AuthModal';

export const VideoUpload = () => {
  const navigate = useNavigate();
  const { showToast, isGuest, currentUser, setAuthModalOpen } = useApp();
  const fileRef = useRef(null);
  const thumbRef = useRef(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Programming');
  const [skills, setSkills] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  if (isGuest || !currentUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <AuthGate
          title="Student Video Studio"
          description="Sign in or register a verified student profile to publish peer learning tutorials, manage video privacy permissions, and showcase your teaching skills."
          actionText="Sign In to Upload Videos"
          onAction={() => setAuthModalOpen(true)}
        />
        <AuthModal />
      </div>
    );
  }

  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) setVideoFile(file);
  };

  const handleThumbSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbFile(file);
      const url = URL.createObjectURL(file);
      setThumbPreview(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadError(null);
    if (!title.trim()) { showToast('Please add a title', 'error'); setUploadError('A video title is required before publishing.'); return; }
    if (!videoFile) { showToast('Please select a video file', 'error'); setUploadError('Please select a video file to upload.'); return; }

    setUploading(true);
    setProgress(10);

    try {
      // Build multipart form data
      const formData = new FormData();
      formData.append('video', videoFile);
      if (thumbFile) formData.append('thumbnail', thumbFile);
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('skills', skills);
      formData.append('visibility', visibility);
      formData.append('level', 'Beginner');
      formData.append('language', 'English');

      // Use XHR for real upload progress tracking
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const token = localStorage.getItem('skillswap_token');

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 90));
          }
        };

        xhr.onload = () => {
          if (xhr.status === 201) {
            setProgress(100);
            resolve(JSON.parse(xhr.responseText));
          } else {
            const errData = JSON.parse(xhr.responseText || '{}');
            reject(new Error(errData.error || `Upload failed (${xhr.status})`));
          }
        };

        xhr.onerror = () => reject(new Error('Network error during upload.'));

        xhr.open('POST', `${API_BASE_URL}/upload/video`);
        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
      });

      setDone(true);
      showToast('Video uploaded successfully!');
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'Upload failed. Please try again.');
      showToast(err.message || 'Upload failed. Please try again.', 'error');
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
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Upload Complete!</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Your video is ready and visible to your selected audience.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <button onClick={() => navigate('/videos')} className="px-6 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors shadow-xs">View Videos</button>
          <button onClick={() => { setDone(false); setTitle(''); setDescription(''); setVideoFile(null); setThumbFile(null); setThumbPreview(null); setSkills(''); setProgress(0); }} className="px-6 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors">Upload Another</button>
        </div>
        <AuthModal />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-24">
      <h1 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 mb-5 flex items-center gap-2">
        <Film className="w-5 h-5 text-teal-600 dark:text-teal-400" /> Upload Learning Video
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Video File Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Video File</label>
          <div
            onClick={() => fileRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${videoFile ? 'border-teal-400 bg-teal-50/50 dark:bg-teal-950/30' : 'border-slate-200 dark:border-slate-700 hover:border-teal-400 bg-white dark:bg-slate-800'}`}
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
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">MP4, WebM, MOV up to 500MB</p>
              </>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Title *</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Dynamic Programming in Python Explained" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/30 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500" required />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What concepts or skills will viewers master from this video?" rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/30 outline-none transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500" />
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
            <p className="text-xs text-slate-400 dark:text-slate-500">Optional. 16:9 ratio recommended.</p>
          </div>
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Visibility Controls</label>
          <div className="flex flex-wrap gap-2.5">
            {[
              { id: 'public', label: 'Public' },
              { id: 'selected', label: 'Selected Students' },
              { id: 'exchange', label: 'Skill Partners Only' },
              { id: 'private', label: 'Private' }
            ].map(v => (
              <label key={v.id} className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border cursor-pointer transition-all ${visibility === v.id ? 'bg-teal-50 dark:bg-teal-950/50 border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 font-semibold' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                <input type="radio" name="visibility" value={v.id} checked={visibility === v.id} onChange={() => setVisibility(v.id)} className="sr-only" />
                <span className={`w-3 h-3 rounded-full border-2 ${visibility === v.id ? 'bg-teal-600 border-teal-600' : 'border-slate-300 dark:border-slate-600'}`}></span>
                <span className="text-xs">{v.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Upload Error */}
        {uploadError && !uploading && (
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/30">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-rose-700 dark:text-rose-300">Upload failed</p>
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">{uploadError}</p>
            </div>
            <button type="button" onClick={() => setUploadError(null)} className="p-0.5 rounded hover:bg-rose-100 dark:hover:bg-rose-900 shrink-0">
              <X className="w-3.5 h-3.5 text-rose-400" />
            </button>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center font-medium">{progress}% — {progress < 90 ? 'Uploading video...' : 'Processing and saving...'}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold transition-all shadow-md
            bg-teal-600 hover:bg-teal-700 active:bg-teal-800
            text-white
            disabled:bg-teal-400 disabled:dark:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-80
            focus:outline-none focus:ring-4 focus:ring-teal-300 dark:focus:ring-teal-700"
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin shrink-0" />
              Uploading... {progress > 0 ? `${progress}%` : ''}
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 shrink-0" />
              Publish Video
            </>
          )}
        </button>
      </form>
      <AuthModal />
    </div>
  );
};

export default VideoUpload;