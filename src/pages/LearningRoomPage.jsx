import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Video, Mic, MicOff, VideoOff, Bot,
  ArrowLeft, Sparkles, ExternalLink, Plus, Save, ShieldCheck,
  VolumeX, Volume2, Wifi, WifiOff, AlertCircle
} from 'lucide-react';
import { sessionService } from '../services/sessionService';
import { walletService } from '../services/walletService';
import { API_BASE_URL } from '../services/api';
import { LearningCompanionDrawer } from '../components/LearningCompanionDrawer';
import { useApp } from '../context/AppContext';
import { AuthGate } from '../components/auth/AuthGate';
import { AuthModal } from '../components/auth/AuthModal';
import LiveWhiteboard from '../components/session/LiveWhiteboard';

export const LearningRoomPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { showToast, isGuest, currentUser, setAuthModalOpen } = useApp();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionNotes, setSessionNotes] = useState('');
  const [sharedResources, setSharedResources] = useState([]);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [taskSubmissionUrl, setTaskSubmissionUrl] = useState('');
  const [taskNotes, setTaskNotes] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [isCompanionOpen, setIsCompanionOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'resources' | 'tasks' | 'completion'

  // WebRTC, Media, and Whiteboard States
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [hasLocalMedia, setHasLocalMedia] = useState(false);
  const [hasRemoteStream, setHasRemoteStream] = useState(false);
  const [mediaError, setMediaError] = useState(null);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [connectionState, setConnectionState] = useState('new');
  const [isPeerConnected, setIsPeerConnected] = useState(false);
  const [initialStrokes, setInitialStrokes] = useState([]);

  // Refs for persistent connection and stream handles
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const pcRef = useRef(null);
  const dataChannelRef = useRef(null);
  const eventSourceRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const whiteboardRef = useRef(null);
  const isInitializingMediaRef = useRef(false);
  const pendingIceCandidatesRef = useRef([]);
  const remoteDescSetRef = useRef(false);
  const makingOfferRef = useRef(false);
  const ignoreOfferRef = useRef(false);
  const isSettingRemoteAnswerPendingRef = useRef(false);
  const lastSignalTimeRef = useRef(0);
  const lastWhiteboardSeqRef = useRef(0);

  // Load Session Data
  useEffect(() => {
    if (isGuest || !currentUser) {
      setLoading(false);
      return;
    }
    const loadSession = async () => {
      setLoading(true);
      try {
        const s = await sessionService.getSessionById(sessionId);
        setSession(s);
        setSessionNotes(s?.sessionNotes || '');
        setSharedResources(s?.sharedResources || []);
        setNextSteps(s?.nextSteps || '');
        if (s?.taskSubmission) {
          setTaskSubmissionUrl(s.taskSubmission.url || '');
          setTaskNotes(s.taskSubmission.notes || '');
        }

        // Fetch persisted whiteboard strokes
        try {
          const strokes = await sessionService.getWhiteboard(sessionId);
          setInitialStrokes(strokes || []);
        } catch (_wbErr) {
          // Non-fatal if initial whiteboard fetch fails
        }
      } catch (err) {
        console.error('Failed to load session:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, [sessionId, isGuest, currentUser]);

  // Role resolution
  const isTutor = currentUser && session ? String(currentUser.id) === String(session.tutorId) : false;
  const peerName = session ? (isTutor ? session.studentName : session.tutorName) : 'Peer';
  const peerAvatar = session ? (isTutor ? session.studentAvatar : session.tutorAvatar) : '';
  const myAvatar = session ? (isTutor ? session.tutorAvatar : session.studentAvatar) : '';
  const myRoleLabel = isTutor ? 'Mentor / Tutor' : 'Student Learner';
  const peerRoleLabel = isTutor ? 'Student Learner' : 'Mentor / Tutor';

  // Request Local Media Stream
  const initLocalMedia = useCallback(async () => {
    if (
      localStreamRef.current &&
      localStreamRef.current.active &&
      localStreamRef.current.getTracks().length > 0 &&
      localStreamRef.current.getTracks().every(t => t.readyState === 'live')
    ) {
      return localStreamRef.current;
    }
    if (isInitializingMediaRef.current) return null;
    isInitializingMediaRef.current = true;

    if (!navigator?.mediaDevices?.getUserMedia) {
      const msg = 'Media devices API is unavailable in this environment.';
      setMediaError(msg);
      showToast(msg, 'error');
      isInitializingMediaRef.current = false;
      return null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      localStreamRef.current = stream;
      setHasLocalMedia(true);
      setMediaError(null);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      isInitializingMediaRef.current = false;
      return stream;
    } catch (err) {
      console.warn('Full audio+video getUserMedia failed, attempting audio-only...', err);

      // Attempt audio-only fallback if video camera is missing
      try {
        const audioOnlyStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          },
          video: false
        });

        localStreamRef.current = audioOnlyStream;
        setHasLocalMedia(true);
        setIsVideoOff(true);
        setMediaError('Camera not detected. Connected in audio-only mode.');

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = audioOnlyStream;
        }
        isInitializingMediaRef.current = false;
        return audioOnlyStream;
      } catch (audioErr) {
        console.error('Microphone/camera access failure:', audioErr);
        let errorMsg = 'Failed to access camera or microphone.';
        if (audioErr.name === 'NotAllowedError' || audioErr.name === 'PermissionDeniedError') {
          errorMsg = 'Microphone and camera permissions were denied. Please allow device access in browser settings.';
        } else if (audioErr.name === 'NotFoundError' || audioErr.name === 'DevicesNotFoundError') {
          errorMsg = 'No microphone or camera devices were found on this system.';
        }
        setMediaError(errorMsg);
        showToast(errorMsg, 'error');
        isInitializingMediaRef.current = false;
        return null;
      }
    }
  }, [showToast]);

  // Ensure DOM video elements stay attached to media streams
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current && localVideoRef.current.srcObject !== localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [hasLocalMedia, isVideoOff]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStreamRef.current && remoteVideoRef.current.srcObject !== remoteStreamRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
      remoteVideoRef.current.play().catch(() => {});
    }
  }, [hasRemoteStream]);

  // Handle incoming remote WebRTC signal
  const handleRemoteSignal = useCallback(async (signalPayload, isPolite) => {
    const pc = pcRef.current;
    if (!pc) return;

    try {
      if (signalPayload.type === 'description') {
        const description = signalPayload.description;
        const readyForOffer =
          !makingOfferRef.current &&
          (pc.signalingState === 'stable' || isSettingRemoteAnswerPendingRef.current);
        const offerCollision = description.type === 'offer' && !readyForOffer;

        ignoreOfferRef.current = !isPolite && offerCollision;
        if (ignoreOfferRef.current) {
          return;
        }

        isSettingRemoteAnswerPendingRef.current = description.type === 'answer';
        if (offerCollision) {
          await Promise.all([
            pc.setLocalDescription({ type: 'rollback' }),
            pc.setRemoteDescription(new RTCSessionDescription(description))
          ]);
        } else {
          await pc.setRemoteDescription(new RTCSessionDescription(description));
        }
        isSettingRemoteAnswerPendingRef.current = false;
        remoteDescSetRef.current = true;

        // Drain any queued ICE candidates that arrived before remoteDescription
        while (pendingIceCandidatesRef.current.length > 0) {
          const cand = pendingIceCandidatesRef.current.shift();
          try {
            await pc.addIceCandidate(new RTCIceCandidate(cand));
          } catch (_candErr) {
            // Non-fatal candidate error
          }
        }

        if (description.type === 'offer') {
          await pc.setLocalDescription();
          await sessionService.sendSignal(sessionId, {
            type: 'description',
            description: pc.localDescription
          });
        }
      } else if (signalPayload.type === 'ice') {
        if (!signalPayload.candidate) return;
        try {
          if (remoteDescSetRef.current && pc.remoteDescription && pc.remoteDescription.type) {
            await pc.addIceCandidate(new RTCIceCandidate(signalPayload.candidate));
          } else {
            pendingIceCandidatesRef.current.push(signalPayload.candidate);
          }
        } catch (candErr) {
          if (!ignoreOfferRef.current) {
            console.warn('Candidate add error:', candErr);
          }
        }
      } else if (signalPayload.type === 'peer-left') {
        setIsPeerConnected(false);
        setHasRemoteStream(false);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }
      }
    } catch (err) {
      console.warn('Signaling processing error:', err);
    }
  }, [sessionId]);

  // Main WebRTC Connection & Signaling Lifecycle
  useEffect(() => {
    const sessId = session?._id || session?.id;
    if (!sessId || !currentUser?.id) return;

    let isDisposed = false;
    const isPolite = !isTutor; // Learner is polite, Tutor is impolite

    const setupDataChannel = (dc) => {
      dataChannelRef.current = dc;
      dc.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'stroke' && whiteboardRef.current) {
            whiteboardRef.current.addRemoteStroke(msg.stroke);
          } else if (msg.type === 'clear' && whiteboardRef.current) {
            whiteboardRef.current.clearCanvas();
          }
        } catch (_parseErr) {}
      };
    };

    const startWebRTC = async () => {
      // 1. Initialize local media
      const stream = await initLocalMedia();
      if (isDisposed) return;

      // 2. Create RTCPeerConnection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' }
        ]
      });
      pcRef.current = pc;
      if (typeof window !== 'undefined') window.__debugPC = pc;

      // 3. Set up remote media stream receiver
      const remoteStream = new MediaStream();
      remoteStreamRef.current = remoteStream;

      pc.ontrack = (event) => {
        const stream = (event.streams && event.streams[0]) || remoteStream;
        if (!event.streams || !event.streams[0]) {
          remoteStream.addTrack(event.track);
        }
        remoteStreamRef.current = stream;
        setHasRemoteStream(true);
        if (typeof window !== 'undefined') {
          window.__lastTrackEvent = { kind: event.track?.kind, streamTracks: stream.getTracks().length };
        }
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
          remoteVideoRef.current.play().catch((playErr) => {
            if (playErr.name === 'NotAllowedError') {
              setAutoplayBlocked(true);
            }
          });
        }
      };

      // 4. ICE candidate handling
      pc.onicecandidate = ({ candidate }) => {
        if (candidate) {
          sessionService.sendSignal(sessionId, { type: 'ice', candidate }).catch(() => {});
        }
      };

      // 5. Connection state monitoring
      pc.onconnectionstatechange = () => {
        setConnectionState(pc.connectionState);
        if (pc.connectionState === 'connected') {
          setIsPeerConnected(true);
        } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          setIsPeerConnected(false);
        }
      };

      // 6. DataChannel handling
      pc.ondatachannel = (e) => {
        setupDataChannel(e.channel);
      };

      // 7. Perfect Negotiation: negotiationneeded
      pc.onnegotiationneeded = async () => {
        try {
          makingOfferRef.current = true;
          await pc.setLocalDescription();
          await sessionService.sendSignal(sessionId, {
            type: 'description',
            description: pc.localDescription
          });
        } catch (err) {
          console.warn('Negotiation error:', err);
        } finally {
          makingOfferRef.current = false;
        }
      };

      // 8. Add local media tracks to peer connection
      if (stream) {
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });
      }

      // 9. Set up Whiteboard DataChannel (Impolite peer creates, Polite peer receives)
      if (!isPolite) {
        const dc = pc.createDataChannel('skillswap-whiteboard', { ordered: true });
        setupDataChannel(dc);
      }

      // 9. Real-Time Channel (SSE with fallback polling)
      const token = localStorage.getItem('skillswap_token') || '';
      const sseUrl = `${API_BASE_URL}/sessions/${sessionId}/live-events?token=${encodeURIComponent(token)}`;
      const es = new EventSource(sseUrl);
      eventSourceRef.current = es;

      es.onmessage = (e) => {
        if (isDisposed) return;
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'signal' && data.signal) {
            lastSignalTimeRef.current = Math.max(lastSignalTimeRef.current, data.timestamp || Date.now());
            handleRemoteSignal(data.signal, isPolite);
          } else if (data.type === 'stroke' && data.stroke) {
            if (whiteboardRef.current) {
              whiteboardRef.current.addRemoteStroke(data.stroke);
            }
          } else if (data.type === 'clear') {
            if (whiteboardRef.current) {
              whiteboardRef.current.clearCanvas();
            }
          } else if (data.type === 'peer-joined') {
            // Trigger negotiation if impolite
            if (!isPolite && pc.signalingState === 'stable') {
              pc.onnegotiationneeded();
            }
          } else if (data.type === 'peer-left') {
            setIsPeerConnected(false);
            setHasRemoteStream(false);
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = null;
            }
          }
        } catch (_parseErr) {}
      };

      es.onerror = () => {
        // SSE disconnected: fallback polling keeps session alive
      };

      // 10. Polling Fallback Interval (for environments with proxy SSE drops)
      pollIntervalRef.current = setInterval(async () => {
        if (isDisposed) return;
        try {
          // Poll for signals
          const pendingSignals = await sessionService.pollSignals(sessionId, lastSignalTimeRef.current);
          if (Array.isArray(pendingSignals) && pendingSignals.length > 0) {
            for (const item of pendingSignals) {
              lastSignalTimeRef.current = Math.max(lastSignalTimeRef.current, item.timestamp);
              if (item.signal) {
                handleRemoteSignal(item.signal, isPolite);
              }
            }
          }

          // Poll for whiteboard strokes
          const wbData = await sessionService.pollWhiteboardEvents(sessionId, lastWhiteboardSeqRef.current);
          if (wbData?.events && wbData.events.length > 0) {
            lastWhiteboardSeqRef.current = wbData.currentSeq;
            for (const ev of wbData.events) {
              if (ev.type === 'stroke' && ev.stroke && whiteboardRef.current) {
                whiteboardRef.current.addRemoteStroke(ev.stroke);
              } else if (ev.type === 'clear' && whiteboardRef.current) {
                whiteboardRef.current.clearCanvas();
              }
            }
          }
        } catch (_pollErr) {
          // Silent polling retry
        }
      }, 2000);
    };

    startWebRTC();

    // Resource Cleanup when participant leaves
    return () => {
      isDisposed = true;

      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }

      // Notify peer that user has left
      sessionService.sendSignal(sessionId, { type: 'peer-left' }).catch(() => {});

      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }

      if (remoteStreamRef.current) {
        remoteStreamRef.current.getTracks().forEach((track) => track.stop());
        remoteStreamRef.current = null;
      }

      setHasLocalMedia(false);
      setHasRemoteStream(false);
      setIsPeerConnected(false);
    };
  }, [session?._id, session?.id, currentUser?.id, isTutor, sessionId]);

  // Audio Microphone Mute/Unmute Toggle
  const handleToggleMute = () => {
    if (!localStreamRef.current) {
      showToast('No active microphone stream', 'info');
      return;
    }
    const audioTracks = localStreamRef.current.getAudioTracks();
    if (audioTracks.length === 0) {
      showToast('No microphone device found on this system', 'error');
      return;
    }
    const nextMuted = !isMuted;
    audioTracks.forEach((track) => {
      track.enabled = !nextMuted;
    });
    setIsMuted(nextMuted);
    showToast(nextMuted ? 'Microphone muted' : 'Microphone unmuted', 'info');
  };

  // Video Camera On/Off Toggle
  const handleToggleVideo = () => {
    if (!localStreamRef.current) {
      showToast('No active camera stream', 'info');
      return;
    }
    const videoTracks = localStreamRef.current.getVideoTracks();
    if (videoTracks.length === 0) {
      showToast('No camera device found on this system', 'error');
      return;
    }
    const nextVideoOff = !isVideoOff;
    videoTracks.forEach((track) => {
      track.enabled = !nextVideoOff;
    });
    setIsVideoOff(nextVideoOff);
    showToast(nextVideoOff ? 'Camera turned off' : 'Camera turned on', 'info');
  };

  // Whiteboard dispatch handlers
  const handleSendWhiteboardStroke = (stroke) => {
    // 1. Send peer-to-peer over DataChannel (sub-10ms)
    if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
      try {
        dataChannelRef.current.send(JSON.stringify({ type: 'stroke', stroke }));
      } catch (_e) {}
    }

    // 2. Persist to server (and broadcast via SSE)
    sessionService.sendWhiteboardStroke(sessionId, stroke).catch((err) => {
      console.warn('Failed to save stroke to server:', err);
    });
  };

  const handleClearWhiteboard = () => {
    if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
      try {
        dataChannelRef.current.send(JSON.stringify({ type: 'clear' }));
      } catch (_e) {}
    }
    sessionService.clearWhiteboard(sessionId).catch(console.error);
  };

  const handleResumeAutoplay = () => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.play().then(() => {
        setAutoplayBlocked(false);
      }).catch(console.error);
    }
  };

  // Session Notes Save
  const handleSaveNotes = async () => {
    if (!session) return;
    try {
      await sessionService.updateSessionNotes(session.id, {
        sessionNotes,
        sharedResources,
        nextSteps
      });
      showToast('Session notes saved to cloud', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to save notes', 'error');
    }
  };

  const handleAddResource = async () => {
    if (!newLinkUrl.trim() || !session) return;
    const newRes = {
      title: newLinkTitle.trim() || 'Resource Link',
      url: newLinkUrl.trim()
    };
    const updated = [...sharedResources, newRes];
    setSharedResources(updated);
    setNewLinkTitle('');
    setNewLinkUrl('');

    try {
      await sessionService.updateSessionNotes(session.id, {
        sharedResources: updated
      });
      showToast('Resource added', 'success');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!taskSubmissionUrl.trim() || !session) return;
    try {
      await sessionService.submitTaskEvidence(session.id, {
        url: taskSubmissionUrl.trim(),
        notes: taskNotes.trim()
      });
      showToast('Practical task evidence submitted for peer verification!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to submit task proof', 'error');
    }
  };

  const handleConfirmCompletion = async (role = 'learner') => {
    if (!session) return;
    try {
      const updated = await sessionService.confirmCompletion(session.id, role);
      setSession(updated);

      if (updated.status === 'Completed' && session.creditCost > 0) {
        await walletService.releaseEscrowOnCompletion(session.skill, session.tutorName, session.creditCost);
        showToast('Two-sided completion verified! Escrow credits released.', 'success');
      } else {
        showToast('Your completion confirmation logged. Awaiting peer check.', 'info');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to record confirmation', 'error');
    }
  };

  const handleDispute = async () => {
    if (!session) return;
    const reason = prompt('Please explain the issue or dispute reason:');
    if (!reason || !reason.trim()) return;

    try {
      const updated = await sessionService.disputeSession(session.id, reason.trim());
      await walletService.disputeEscrowHold(session.skill, session.tutorName, session.creditCost, reason.trim());
      setSession(updated);
      showToast('Dispute recorded. Escrow hold paused for moderation review.', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  if (isGuest || !currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <AuthGate
          title="Virtual Learning Room"
          description="Sign in or register a verified student profile to enter collaborative learning rooms, use real-time scratchpads, submit task proofs, and settle credits."
          actionText="Sign In to Enter Room"
          onAction={() => setAuthModalOpen(true)}
        />
        <AuthModal />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-400 mt-2">Connecting to Learning Room...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-500 dark:text-slate-400">Session not found.</p>
        <button onClick={() => navigate('/sessions')} className="mt-3 text-xs font-bold text-teal-600 dark:text-teal-400">Back to Sessions</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 pb-24 space-y-5">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => navigate('/sessions')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> All Sessions
        </button>

        <div className="flex items-center gap-2">
          {/* Connection Status Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            {isPeerConnected ? (
              <>
                <Wifi className="w-3 h-3 text-emerald-500" />
                <span className="text-emerald-700 dark:text-emerald-300">P2P Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-amber-500" />
                <span className="text-amber-700 dark:text-amber-300">
                  {connectionState === 'connecting' ? 'Connecting...' : 'Awaiting Peer'}
                </span>
              </>
            )}
          </div>

          <button
            onClick={() => setIsCompanionOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors shadow-xs"
          >
            <Bot className="w-4 h-4" />
            <span>AI Companion</span>
          </button>

          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
            session.status === 'Completed'
              ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
              : session.status === 'Disputed'
              ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300'
              : 'bg-teal-100 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300'
          }`}>
            {session.status}
          </span>
        </div>
      </div>

      {/* Main Room Layout: Left video/canvas stage, Right collaborative panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Stage Area (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Live Video Calling Stage */}
          <div className="relative rounded-2xl bg-slate-950 overflow-hidden shadow-2xl border border-slate-800 flex flex-col justify-between p-3.5 text-white">
            
            {/* Top Room Status Info */}
            <div className="flex items-center justify-between text-xs z-10 mb-3">
              <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full backdrop-blur-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-bold">{session.skill}</span>
              </div>
              <span className="bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-xs text-[11px] text-slate-300">
                Escrow: {session.creditCost} Credits
              </span>
            </div>

            {/* Video Streams Container: Side-by-Side Local & Remote Feeds */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-auto w-full">
              
              {/* Local Participant Box (You) */}
              <div className="relative aspect-video rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center">
                {/* Local Video Element (Muted to prevent feedback) */}
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover transition-opacity ${
                    hasLocalMedia && !isVideoOff ? 'opacity-100' : 'opacity-0'
                  }`}
                />

                {/* Local Placeholder when video is off or starting */}
                {(!hasLocalMedia || isVideoOff) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-slate-900/90 z-10">
                    <img
                      src={myAvatar || currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-teal-400 mb-1"
                    />
                    <p className="text-xs font-bold text-white">{currentUser?.name || 'You'}</p>
                    <span className="text-[10px] text-teal-300">{myRoleLabel} (You)</span>
                    <span className="mt-1 text-[10px] text-slate-400">
                      {isVideoOff ? 'Camera Off' : 'Starting camera...'}
                    </span>
                  </div>
                )}

                {/* Local Status Pill */}
                <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[10px] text-white">
                  <span>You ({isTutor ? 'Mentor' : 'Learner'})</span>
                  {isMuted && <MicOff className="w-3 h-3 text-rose-400" />}
                </div>
              </div>

              {/* Remote Participant Box */}
              <div className="relative aspect-video rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center">
                {/* Remote Video Element (Unmuted for audio playback) */}
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className={`w-full h-full object-cover transition-opacity ${
                    hasRemoteStream ? 'opacity-100' : 'opacity-0'
                  }`}
                />

                {/* Remote Placeholder when waiting or remote stream unavailable */}
                {!hasRemoteStream && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-slate-900/90 z-10">
                    <img
                      src={peerAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-600 mb-1"
                    />
                    <p className="text-xs font-bold text-white">{peerName}</p>
                    <span className="text-[10px] text-teal-300">{peerRoleLabel}</span>
                    <span className="mt-1 text-[10px] text-amber-400 animate-pulse">
                      {isPeerConnected ? 'Connecting media...' : 'Waiting for peer to join...'}
                    </span>
                  </div>
                )}

                {/* Autoplay Restriction Unlock Overlay */}
                {autoplayBlocked && (
                  <div className="absolute inset-0 z-30 bg-black/85 flex flex-col items-center justify-center p-4 text-center">
                    <VolumeX className="w-8 h-8 text-amber-400 mb-2 animate-bounce" />
                    <p className="text-xs font-bold text-white mb-1">Audio Autoplay Paused</p>
                    <p className="text-[11px] text-slate-300 mb-3 max-w-xs">
                      Browser autoplay policy requires your interaction to play live audio.
                    </p>
                    <button
                      onClick={handleResumeAutoplay}
                      className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                    >
                      <Volume2 className="w-4 h-4" /> Click to Play Audio
                    </button>
                  </div>
                )}

                {/* Remote Status Pill */}
                <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[10px] text-white">
                  <span>{peerName}</span>
                </div>
              </div>

            </div>

            {/* Media Error Banner */}
            {mediaError && (
              <div className="my-2 p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2 z-10">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>{mediaError}</span>
              </div>
            )}

            {/* Bottom Controls Strip */}
            <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-800/80 z-10">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleMute}
                  className={`p-2.5 rounded-xl transition-colors shadow-xs ${
                    isMuted
                      ? 'bg-rose-600 text-white hover:bg-rose-500'
                      : 'bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700'
                  }`}
                  title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={handleToggleVideo}
                  className={`p-2.5 rounded-xl transition-colors shadow-xs ${
                    isVideoOff
                      ? 'bg-rose-600 text-white hover:bg-rose-500'
                      : 'bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700'
                  }`}
                  title={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
                >
                  {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                </button>
              </div>

              <div className="text-[11px] text-slate-300 bg-slate-900/90 px-3 py-1 rounded-full border border-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                <span>WebRTC Live Session</span>
              </div>
            </div>
          </div>

          {/* Collaborative Live Whiteboard Workspace */}
          <div className="space-y-2">
            <LiveWhiteboard
              ref={whiteboardRef}
              initialStrokes={initialStrokes}
              onSendStroke={handleSendWhiteboardStroke}
              onClearBoard={handleClearWhiteboard}
              currentUserId={currentUser?.id}
              peerName={peerName}
            />
          </div>

          {/* Session Overview Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-2">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Session Objective & Next Milestones</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {session.learningObjective || 'No objective specified.'}
            </p>
            {session.nextSteps && (
              <p className="text-xs text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 p-2.5 rounded-xl border border-teal-100 dark:border-teal-800/50">
                <strong>Next Steps:</strong> {session.nextSteps}
              </p>
            )}
          </div>
        </div>

        {/* Right Collaborative Workstation (5 cols on desktop) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft overflow-hidden flex flex-col h-[640px]">
          {/* Tabs */}
          <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 p-1 text-xs font-bold text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-2 rounded-xl transition-all ${activeTab === 'notes' ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-xs' : 'hover:text-slate-900 dark:hover:text-white'}`}
            >
              Notes
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`flex-1 py-2 rounded-xl transition-all ${activeTab === 'resources' ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-xs' : 'hover:text-slate-900 dark:hover:text-white'}`}
            >
              Resources ({sharedResources.length})
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex-1 py-2 rounded-xl transition-all ${activeTab === 'tasks' ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-xs' : 'hover:text-slate-900 dark:hover:text-white'}`}
            >
              Proof
            </button>
            <button
              onClick={() => setActiveTab('completion')}
              className={`flex-1 py-2 rounded-xl transition-all ${activeTab === 'completion' ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-xs' : 'hover:text-slate-900 dark:hover:text-white'}`}
            >
              Settle
            </button>
          </div>

          {/* Tab Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div className="space-y-3 h-full flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Live Shared Scratchpad</span>
                  <button
                    onClick={handleSaveNotes}
                    className="flex items-center gap-1 text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Notes
                  </button>
                </div>
                <textarea
                  value={sessionNotes}
                  onChange={e => setSessionNotes(e.target.value)}
                  placeholder="Record key concepts, code snippets, syntax reminders, or formulas discussed during this session..."
                  className="flex-1 w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:border-teal-500 outline-none resize-none font-mono leading-relaxed"
                />
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Agreed Next Steps for Student</label>
                  <input
                    type="text"
                    value={nextSteps}
                    onChange={e => setNextSteps(e.target.value)}
                    placeholder="e.g. Complete shader rotation assignment before Saturday"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:border-teal-500 outline-none"
                  />
                </div>
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">Shared Reference Materials</span>
                <div className="space-y-2">
                  {sharedResources.map((res, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                      <div className="truncate mr-2">
                        <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{res.title}</p>
                        <a href={res.url} target="_blank" rel="noreferrer" className="text-[10px] text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1">
                          {res.url} <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">Add Link / Repo</span>
                  <input
                    type="text"
                    placeholder="Resource Title (e.g. Official Documentation)"
                    value={newLinkTitle}
                    onChange={e => setNewLinkTitle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs outline-none"
                  />
                  <input
                    type="text"
                    placeholder="https://..."
                    value={newLinkUrl}
                    onChange={e => setNewLinkUrl(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs outline-none"
                  />
                  <button
                    onClick={handleAddResource}
                    disabled={!newLinkUrl.trim()}
                    className="w-full flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" /> Attach Resource
                  </button>
                </div>
              </div>
            )}

            {/* Task Proof Tab */}
            {activeTab === 'tasks' && (
              <form onSubmit={handleSubmitTask} className="space-y-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">Submit Practical Task Proof</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Submit code links or design prototypes completed during this session to update your Skill Passport.
                </p>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">Project / PR / Figma URL</label>
                  <input
                    type="text"
                    value={taskSubmissionUrl}
                    onChange={e => setTaskSubmissionUrl(e.target.value)}
                    placeholder="https://github.com/your-username/project-repo"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">Execution Notes & Test Results</label>
                  <textarea
                    value={taskNotes}
                    onChange={e => setTaskNotes(e.target.value)}
                    placeholder="Summary of what you implemented and how to verify it..."
                    rows={3}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!taskSubmissionUrl.trim()}
                  className="w-full py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 disabled:opacity-40"
                >
                  Submit for Peer Review
                </button>
              </form>
            )}

            {/* Two-Sided Completion Tab */}
            {activeTab === 'completion' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 text-teal-900 dark:text-teal-200 font-bold">
                    <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>Two-Sided Escrow Settlement</span>
                  </div>
                  <p className="text-[11px] text-teal-800 dark:text-teal-300 leading-relaxed">
                    Credits are only transferred when <strong>both</strong> the learner and tutor independently confirm the session occurred according to expectations.
                  </p>
                </div>

                {/* Status Badges */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Learner Confirmation:</span>
                    <span className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
                      session.learnerConfirmed ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                    }`}>
                      {session.learnerConfirmed ? 'Confirmed' : 'Pending'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Tutor Confirmation ({session.tutorName}):</span>
                    <span className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
                      session.teacherConfirmed ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}>
                      {session.teacherConfirmed ? 'Confirmed' : 'Awaiting confirmation'}
                    </span>
                  </div>
                </div>

                {/* Settle Action */}
                <button
                  onClick={() => handleConfirmCompletion(isTutor ? 'tutor' : 'learner')}
                  disabled={isTutor ? session.teacherConfirmed : session.learnerConfirmed}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    (isTutor ? session.teacherConfirmed : session.learnerConfirmed)
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 cursor-default'
                      : 'bg-teal-600 text-white hover:bg-teal-700 border-teal-600 shadow-xs'
                  }`}
                >
                  {(isTutor ? session.teacherConfirmed : session.learnerConfirmed)
                    ? 'You Have Confirmed Completion'
                    : 'Confirm Session Occurred'}
                </button>

                {/* Dispute Action */}
                {session.status !== 'Completed' && (
                  <button
                    onClick={handleDispute}
                    className="w-full py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 transition-colors"
                  >
                    Report Issue / Dispute Session
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Companion Drawer */}
      <LearningCompanionDrawer
        isOpen={isCompanionOpen}
        onClose={() => setIsCompanionOpen(false)}
        contextTopic={session.skill}
        initialNotes={sessionNotes}
      />
      <AuthModal />
    </div>
  );
};

export default LearningRoomPage;
