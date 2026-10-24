import React, { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, X, Send, Minimize2, HelpCircle, BookOpen, Code, GraduationCap } from 'lucide-react';
import { apiClient } from '../../services/api';

export const FloatingAIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hello! I am your SkillSwap Academic AI Assistant. Ask me to explain difficult coding concepts, generate practice questions, debug code, or prepare you for peer skill exchanges.',
      timestamp: 'Now'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (messageText) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;

    const userMsg = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!messageText) setInput('');
    setIsTyping(true);

    try {
      const res = await apiClient.post('/ai/chat', {
        message: textToSend.trim(),
        contextTopic: 'Computer Science & Academic Exchange'
      });

      if (res?.success && res.reply) {
        setMessages(prev => [
          ...prev,
          {
            id: `reply_${Date.now()}`,
            sender: 'assistant',
            text: res.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            topicAllowed: res.topicAllowed
          }
        ]);
        setIsTyping(false);
        return;
      }
    } catch (err) {
      console.warn('AI Companion request fallback:', err.message);
    }

    // Local resilient academic tutor answer
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: `reply_${Date.now()}`,
          sender: 'assistant',
          text: `Here is a study breakdown for **"${textToSend.slice(0, 30)}..."**:\n\n1. **Core Concept:** Deconstruct the core invariants before writing code.\n2. **Complexity:** Benchmark runtime and space allocations.\n3. **Practical Next Step:** Schedule a 20-minute mutual swap with a peer mentor on the Skill Marketplace!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Learning Assistant"
          title="Open SkillSwap AI Learning Assistant"
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 p-3.5 sm:px-4 sm:py-3 rounded-full bg-gradient-to-r from-teal-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 group"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
          </div>
          <span className="hidden sm:inline text-xs font-bold tracking-tight">AI Assistant</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-300 hidden sm:inline" />
        </button>
      )}

      {/* Responsive Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-16 sm:bottom-6 right-2 sm:right-6 z-50 w-[calc(100vw-1rem)] sm:w-96 max-h-[85vh] sm:max-h-[580px] h-[520px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-fade-in transition-colors">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-teal-600 via-indigo-600 to-slate-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20">
                <Bot className="w-4 h-4 text-teal-300" />
              </div>
              <div>
                <h3 className="text-xs font-bold leading-tight flex items-center gap-1.5">
                  <span>AI Learning Assistant</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">Online</span>
                </h3>
                <p className="text-[10px] text-slate-300">OpenAI Academic Engine</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            <button
              onClick={() => handleSend('Explain binary search trees and time complexity simply')}
              className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-slate-700 dark:text-slate-200 hover:border-teal-400"
            >
              <BookOpen className="w-3 h-3 text-teal-500" /> Explain BST
            </button>
            <button
              onClick={() => handleSend('Generate 3 practice questions for React hooks')}
              className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-slate-700 dark:text-slate-200 hover:border-teal-400"
            >
              <HelpCircle className="w-3 h-3 text-amber-500" /> React Quiz
            </button>
            <button
              onClick={() => handleSend('How do I prepare for a peer code review session?')}
              className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-slate-700 dark:text-slate-200 hover:border-teal-400"
            >
              <GraduationCap className="w-3 h-3 text-purple-500" /> Session Prep
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
            {messages.map(msg => {
              const isUser = msg.sender === 'user';
              return (
                <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? 'bg-teal-600 text-white rounded-br-xs shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-xs shadow-xs'
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                    <span className={`text-[9px] block mt-1.5 ${isUser ? 'text-teal-200' : 'text-slate-400 dark:text-slate-500'}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-slate-400 text-xs p-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse delay-100"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse delay-200"></span>
                <span className="text-[11px] ml-1">Assistant reasoning...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask an academic question..."
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs outline-none focus:border-teal-500"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default FloatingAIAssistant;
