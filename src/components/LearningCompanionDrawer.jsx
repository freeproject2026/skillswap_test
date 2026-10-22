import React, { useState } from 'react';
import { Bot, Sparkles, BookOpen, HelpCircle, FileText, Send, ChevronRight, X, AlertCircle } from 'lucide-react';
import { AI_COMPANION_PROMPTS } from '../data/mockSkillsData';

export const LearningCompanionDrawer = ({ isOpen, onClose, contextTopic = 'React & WebGL', initialNotes = '' }) => {
  const [activeTab, setActiveTab] = useState('explain');
  const [proficiencyLevel, setProficiencyLevel] = useState('Beginner');
  const [customInput, setCustomInput] = useState('');
  const [conversation, setConversation] = useState([
    {
      sender: 'assistant',
      text: `Hello! I am your SkillSwap Learning Companion (Demo AI). I can explain concepts at your chosen level, generate practice questions for ${contextTopic}, or turn your session notes into flashcards.`,
      timestamp: 'Just now'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleRunPrompt = (promptType, customPromptText = '') => {
    const userText = customPromptText || AI_COMPANION_PROMPTS.find(p => p.type === promptType)?.prompt || 'Can you help me prepare?';
    setConversation(prev => [...prev, { sender: 'user', text: userText, timestamp: 'Just now' }]);
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      if (promptType === 'explain') {
        if (proficiencyLevel === 'Beginner') {
          reply = `💡 **Beginner Concept Breakdown (${contextTopic}):**\nImagine a binary tree as an inverted family tree. You start at the root at the top. For any person (node), their left child is strictly smaller, and their right child is strictly larger. Balancing ensures the tree doesn't look like a long single line, keeping searches super fast in O(log n) time!`;
        } else if (proficiencyLevel === 'Intermediate') {
          reply = `⚙️ **Intermediate Technical Overview (${contextTopic}):**\nWhen you insert into an AVL tree, you check the balance factor: \`height(left) - height(right)\`. If it exceeds +1 or -1, you apply rotations: Single Left (LL), Single Right (RR), Left-Right (LR), or Right-Left (RL) to restore the height invariant in O(1) rotation time.`;
        } else {
          reply = `🔬 **Advanced Systems Deep-Dive (${contextTopic}):**\nCompared to Red-Black trees which permit height differences up to a factor of 2 (fewer rotations during write-heavy workloads), AVL trees maintain strict balance factor ∈ {-1, 0, 1}, making them optimal for read-heavy dictionary lookups. Memory overhead is 2 bits per node for balance factors.`;
        }
      } else if (promptType === 'quiz') {
        reply = `📝 **3 Diagnostic Practice Questions for ${contextTopic}:**\n\n1. What is the worst-case time complexity of searching an unbalanced BST with N elements, and how does balancing fix it?\n2. In a Left-Right (LR) imbalance, which node rotates first and in which direction?\n3. Why do Red-Black trees usually outperform AVL trees in write-intensive database indexes?`;
      } else if (promptType === 'session_prep') {
        reply = `🎯 **Top 3 Questions to Ask Your Mentor in Your Upcoming Session:**\n\n1. "Could you walk through how you trace a double rotation with real memory pointers or visual diagrams?"\n2. "What common bug or edge case did you encounter when testing height recalculation?"\n3. "How would you explain the trade-offs between iterative vs recursive tree balancing in a technical interview?"`;
      } else if (promptType === 'revision_notes') {
        reply = `📚 **Synthesized Revision Flashcards:**\n\n• **Core Invariant**: AVL balance factor must stay within {-1, 0, +1}.\n• **Single Rotation**: Fixes LL or RR single-slope imbalances.\n• **Double Rotation**: Straightens bent zigzag (LR / RL) shapes before outer balancing.\n• **Time Complexity**: Search, Insert, and Delete all strictly guaranteed O(log N).`;
      } else {
        reply = `🤖 **Learning Companion Guidance for "${userText}":**\nFor ${contextTopic}, focus on writing test assertions first. Break the problem into small verifiable steps and bring any failing edge cases to your next peer session!`;
      }

      setConversation(prev => [...prev, { sender: 'assistant', text: reply, timestamp: 'Just now' }]);
      setIsTyping(false);
    }, 500);
  };

  const handleSendCustom = (e) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    const msg = customInput.trim();
    setCustomInput('');
    handleRunPrompt('custom', msg);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-slide-left">
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-900 text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500 text-slate-950 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold">AI Learning Companion</h3>
              <span className="text-[9px] font-bold px-1.5 py-0.2 bg-teal-400 text-slate-950 rounded">Demo</span>
            </div>
            <p className="text-[11px] text-slate-400">Context: {contextTopic}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Action Pills */}
      <div className="p-3 bg-slate-50 border-b border-slate-200/80 space-y-2">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => { setActiveTab('explain'); handleRunPrompt('explain'); }}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:border-teal-400 text-slate-700 shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-teal-600" /> Explain
          </button>
          <button
            onClick={() => { setActiveTab('quiz'); handleRunPrompt('quiz'); }}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:border-teal-400 text-slate-700 shadow-xs"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-500" /> Quiz Me
          </button>
          <button
            onClick={() => { setActiveTab('session_prep'); handleRunPrompt('session_prep'); }}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:border-teal-400 text-slate-700 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Prep Questions
          </button>
          <button
            onClick={() => { setActiveTab('revision_notes'); handleRunPrompt('revision_notes'); }}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:border-teal-400 text-slate-700 shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" /> Flashcards
          </button>
        </div>

        {/* Proficiency Level Switcher */}
        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-slate-400 font-medium text-[11px]">Explanation Depth:</span>
          <div className="flex gap-1">
            {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
              <button
                key={lvl}
                onClick={() => { setProficiencyLevel(lvl); handleRunPrompt('explain'); }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                  proficiencyLevel === lvl ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'
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
                : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-bl-xs shadow-xs'
            }`}>
              <div className="whitespace-pre-wrap">{msg.text}</div>
              <span className={`text-[9px] block mt-1.5 ${msg.sender === 'user' ? 'text-teal-200' : 'text-slate-400'}`}>
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
            <span className="text-[11px] ml-1">Learning Companion reasoning...</span>
          </div>
        )}
      </div>

      {/* Demo Warning */}
      <div className="px-4 py-2 bg-amber-50 border-t border-amber-100 flex items-center gap-2 text-[10px] text-amber-800">
        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
        <span>Simulated companion responses. Connect real LLM API in future backend phase.</span>
      </div>

      {/* Input */}
      <form onSubmit={handleSendCustom} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
        <input
          type="text"
          value={customInput}
          onChange={e => setCustomInput(e.target.value)}
          placeholder={`Ask about ${contextTopic}...`}
          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-teal-500"
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
