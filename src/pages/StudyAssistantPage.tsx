import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../utils/i18n';
import { ChatMessage, Subject } from '../types';
import { dbService } from '../services/db';
import {
  MessageSquare,
  Send,
  Sparkles,
  Trash2,
  Copy,
  Check,
  Bot,
  User,
  Lightbulb,
  GraduationCap
} from 'lucide-react';

interface StudyAssistantPageProps {
  subjects: Subject[];
}

export const StudyAssistantPage: React.FC<StudyAssistantPageProps> = ({ subjects }) => {
  const { user, language } = useAuth();
  const t = translations[language];

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from storage
  useEffect(() => {
    if (!user) return;
    const loadChat = async () => {
      const history = await dbService.getChatMessages(user.id);
      if (history.length === 0) {
        // Starter greeting message
        const welcome: ChatMessage = {
          id: 'msg_welcome',
          sender: 'assistant',
          content: `Hello ${user.fullName.split(' ')[0]}! I am the **Muhammad Ali AI Study Assistant**.

I am your 24/7 dedicated academic tutor powered by Google Gemini. I have context on your registered courses: **${subjects.map((s) => s.name).join(', ') || 'your academic subjects'}**.

Here is how I can help you today:
- 💡 Explain complex concepts simply (like Database Normalization or Dijkstra Algorithm)
- 📝 Break down essays, research ethics, and proof techniques
- 📅 Create 7-day exam preparation strategies
- 🎯 Generate practice quizzes or review mistakes

What would you like to study together?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages([welcome]);
      } else {
        setMessages(history);
      }
    };
    loadChat();
  }, [user, subjects]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if (!content || !user || isTyping) return;

    const userMessage: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsTyping(true);

    try {
      await dbService.saveChatMessage(user.id, userMessage);

      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ sender: m.sender, content: m.content })),
          studentContext: {
            name: user.fullName,
            educationLevel: user.educationLevel,
            subjects: subjects.map((s) => s.name),
          },
        }),
      });

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: `msg_a_${Date.now()}`,
        sender: 'assistant',
        content: data.reply || 'I am ready to assist your study goals! Please ask your question.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      await dbService.saveChatMessage(user.id, assistantMessage);
    } catch {
      const errorMessage: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        sender: 'assistant',
        content: '⚠️ I encountered a temporary connection issue. Please verify your internet connection or try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = async () => {
    if (!user) return;
    if (confirm('Clear the active conversation history?')) {
      await dbService.clearChatMessages(user.id);
      setMessages([]);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const promptSuggestions = [
    'Explain database normalization (1NF, 2NF, 3NF) in simple terms with an example',
    'How does Dijkstra algorithm find the shortest path?',
    'Give me 5 practice conceptual questions on Discrete Mathematics',
    'Which subject should I prioritize for revision this week?',
  ];

  return (
    <div className="space-y-4 h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {t.assistant.title}
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              Powered by Google Gemini • Developed by Muhammad Ali
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          title={t.assistant.clearChat}
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">{t.assistant.clearChat}</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-3 text-xs leading-relaxed ${
                isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-xl p-4 rounded-2xl relative group ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-br-xs shadow-md shadow-indigo-600/20'
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 rounded-bl-xs shadow-xs'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{m.content}</div>

                <div className="flex items-center justify-between gap-4 mt-2 pt-1 border-t border-slate-100/20 text-[10px] opacity-70">
                  <span>{m.timestamp}</span>
                  {!isUser && (
                    <button
                      onClick={() => handleCopy(m.id, m.content)}
                      className="hover:opacity-100 flex items-center gap-1"
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 uppercase font-bold text-xs mt-0.5">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-3 text-xs items-center">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Pill Bar */}
      {messages.length <= 2 && (
        <div className="flex flex-wrap gap-1.5 py-1 shrink-0">
          {promptSuggestions.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-slate-700 text-[11px] text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1 border border-slate-200 dark:border-slate-700"
            >
              <Lightbulb className="w-3 h-3 text-amber-500" />
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md shrink-0"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t.assistant.placeholder}
          className="flex-1 px-3 py-2 text-xs bg-transparent text-slate-900 dark:text-white outline-none"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isTyping}
          className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white shadow-md shadow-indigo-600/20 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
