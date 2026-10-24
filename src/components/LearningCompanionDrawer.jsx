import React, { useState } from 'react';
import { Bot, Sparkles, BookOpen, HelpCircle, FileText, Send, ChevronRight, X, AlertCircle } from 'lucide-react';
import { AI_COMPANION_PROMPTS } from '../data/mockSkillsData';
import { apiClient } from '../services/api';

export const LearningCompanionDrawer = ({ isOpen, onClose, contextTopic = 'React & WebGL', initialNotes = '' }) => {
  const [activeTab, setActiveTab] = useState('explain');
  const [proficiencyLevel, setProficiencyLevel] = useState('Beginner');
  const [customInput, setCustomInput] = useState('');
  const [conversation, setConversation] = useState([
    {
      sender: 'assistant',
      text: `Hello! I am your SkillSwap Learning Companion. I can explain concepts at your chosen proficiency, generate diagnostic practice questions for ${contextTopic}, or turn your session notes into flashcards.`,
      timestamp: 'Just now'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleRunPrompt = async (promptType, customPromptText = '') => {
    let userText = customPromptText;
    if (!userText) {
      if (promptType === 'explain') {
        userText = `Explain ${contextTopic} for a ${proficiencyLevel} student with intuitive examples.`;
      } else if (promptType === 'quiz') {
        userText = `Generate 3 diagnostic practice questions for ${contextTopic}.`;
      } else if (promptType === 'session_prep') {
        userText = `What are the top 3 questions I should ask my mentor about ${contextTopic}?`;
      } else if (promptType === 'revision_notes') {
        userText = `Summarize key revision takeaways and formulas for ${contextTopic}.`;
      } else {
        userText = 'How can I approach mastering this topic?';
      }
    }

    setConversation(prev => [...prev, { sender: 'user', text: userText, timestamp: 'Just now' }]);
    setIsTyping(true);

    try {
      const res = await apiClient.post('/ai/chat', {
        message: userText,
        contextTopic,
        notesContext: initialNotes
      });

      if (res?.success && res.reply) {
        setConversation(prev => [...prev, { sender: 'assistant', text: res.reply, timestamp: 'Just now' }]);
        setIsTyping(false);
        return;
      }
    } catch (err) {
      console.warn('AI API call error, using local tutor fallback:', err.message);
    }

    // Local pedagogical fallback
    let reply = '';
    if (promptType === 'explain') {
      if (proficiencyLevel === 'Beginner') {
        reply = `💡 **Beginner Breakdown (${contextTopic}):**\nImagine learning ${contextTopic} as building blocks. You start with core primitives. Balancing ensures quick searches and minimal overhead!`;
      } else if (proficiencyLevel === 'Intermediate') {
        reply = `⚙️ **Intermediate Technical Overview (${contextTopic}):**\nFocus on invariants and edge cases. Measure time and space complexity at each stage before scaling up workloads.`;
      } else {
        reply = `🔬 **Advanced Systems Deep-Dive (${contextTopic}):**\nExamine memory layouts, cache locality, and concurrency limits when scaling ${contextTopic}.`;
      }
    } else if (promptType === 'quiz') {
      reply = `📝 **3 Diagnostic Practice Questions for ${contextTopic}:**\n\n1. What is the worst-case time complexity of this operation, and how does optimal structuring fix it?\n2. What edge cases must be handled when inputs are empty or inverted?\n3. How would you defend your design decisions during a peer code review?`;
    } else {
      reply = `🎯 **Academic Strategy for "${userText}":**\nBreak this challenge into testable sub-problems. Bring your failing test cases to your next peer session for verification!`;
    }

    setConversation(prev => [...prev, { sender: 'assistant', text: reply, timestamp: 'Just now' }]);
    setIsTyping(false);
  };

  const handleSendCustom = (e) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    const msg = customInput.trim();
    setCustomInput('');
    handleRunPrompt('custom', msg);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-slide-left">
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-900 text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500 text-slate-950 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold">AI Learning Companion</h3>
              <span className="text-[9px] font-bold px-1.5 py-0.2 bg-teal-400 text-slate-950 rounded">Live AI</span>
            </div>
            <p className="text-[11px] text-slate-400">Context: {contextTopic}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Action Pills */}
      <div className="p-3 bg-slate-50 dark:bg-slate-850 border-b border-slate-200/80 dark:border-slate-800 space-y-2">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => { setActiveTab('explain'); handleRunPrompt('explain'); }}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-400 text-slate-700 dark:text-slate-200 shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> Explain
          </button>
          <button
            onClick={() => { setActiveTab('quiz'); handleRunPrompt('quiz'); }}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-400 text-slate-700 dark:text-slate-200 shadow-xs"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-500" /> Quiz Me
          </button>
          <button
            onClick={() => { setActiveTab('session_prep'); handleRunPrompt('session_prep'); }}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-400 text-slate-700 dark:text-slate-200 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Prep Questions
          </button>
          <button
            onClick={() => { setActiveTab('revision_notes'); handleRunPrompt('revision_notes'); }}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-400 text-slate-700 dark:text-slate-200 shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Flashcards
          </button>
        </div>

        {/* Proficiency Level Switcher */}
        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-slate-400 dark:text-slate-400 font-medium text-[11px]">Explanation Depth:</span>
          <div className="flex gap-1">
            {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
              <button
                key={lvl}
                onClick={() => { setProficiencyLevel(lvl); handleRunPrompt('explain'); }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                  proficiencyLevel === lvl ? 'bg-teal-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {conversation.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[88%] p-3 rounded-2xl text-xs leading-relaxed ${
              msg.sender === 'user'
                ? 'bg-teal-600 text-white rounded-br-xs'
                : 'bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-xs shadow-xs'
            }`}>
              <div className="whitespace-pre-wrap">{msg.text}</div>
              <span className={`text-[9px] block mt-1.5 ${msg.sender === 'user' ? 'text-teal-200' : 'text-slate-400 dark:text-slate-500'}`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-1.5 text-slate-400 text-xs p-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse delay-100"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse delay-200"></span>
            <span className="text-[11px] ml-1">Academic Companion reasoning...</span>
          </div>
        )}
      </div>

      {/* Safety Notice */}
      <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/40 border-t border-amber-100 dark:border-amber-900/40 flex items-center gap-2 text-[10px] text-amber-800 dark:text-amber-300">
        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
        <span>Restricted strictly to educational and skill development inquiries.</span>
      </div>

      {/* Input */}
      <form onSubmit={handleSendCustom} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
        <input
          type="text"
          value={customInput}
          onChange={e => setCustomInput(e.target.value)}
          placeholder={`Ask about ${contextTopic}...`}
          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs outline-none focus:border-teal-500"
        />
        <button
          type="submit"
          disabled={!customInput.trim()}
          className="p-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default LearningCompanionDrawer;
