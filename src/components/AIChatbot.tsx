import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { MessageSquare, Send, X, Sparkles, Bot, User, CornerDownLeft, Mic } from 'lucide-react';
import { api } from '../lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I am Akua, your AI Recruiter Assistant. How can I help you today? You can ask about active jobs, how to apply, or ask for interview preparation tips!'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isOpen]);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Try Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }
      setInputValue(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    if (!textToSend) setInputValue('');

    const newMessages = [...messages, { role: 'user', content: text } as Message];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await api.chatAI(newMessages);
      setMessages([...newMessages, { role: 'assistant', content: res.response }]);
    } catch (err: any) {
      console.error('Chatbot error:', err);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'Sorry, I ran into an issue communicating with the AI server. Please make sure your server is running and your GEMINI_API_KEY is configured.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestionChips = [
    { text: '🔍 What jobs are open?', prompt: 'What jobs are currently open?' },
    { text: '💡 Give me interview tips', prompt: 'Can you give me some preparation tips for a software engineering interview?' },
    { text: '📝 How do I apply?', prompt: 'How do I submit an application?' }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="chat-trigger"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-xl shadow-indigo-600/30 ring-2 ring-indigo-400/40 cursor-pointer"
            title="Ask Akua (AI Recruiter)"
          >
            <MessageSquare className="w-6 h-6" />
            <span className="absolute -top-1.5 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 text-[9px] font-bold items-center justify-center text-white">✨</span>
            </span>
          </motion.button>
        )}

        {isOpen && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="w-[360px] h-[480px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative"
          >
            {/* Header */}
            <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md relative">
                  <Bot className="w-4 h-4" />
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-slate-950"></span>
                </div>
                <div>
                  <div className="text-xs font-black text-white flex items-center space-x-1">
                    <span>Akua (AI Recruiter)</span>
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  </div>
                  <div className="text-[10px] text-slate-400">Powered by Gemini AI</div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-850 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {messages.map((msg, i) => {
                const isBot = msg.role === 'assistant';
                return (
                  <div key={i} className={`flex items-start space-x-2.5 ${!isBot ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs ${
                      isBot ? 'bg-indigo-600/20 text-indigo-455 border border-indigo-500/20' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {isBot ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                    </div>

                    <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                      isBot 
                        ? 'bg-slate-950 border border-slate-850 text-slate-200 rounded-tl-none prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800' 
                        : 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/10 whitespace-pre-wrap'
                    }`}>
                      {isBot ? (
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-start space-x-2.5">
                  <div className="w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-xs">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-slate-955 border border-slate-850 p-3 rounded-2xl rounded-tl-none flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions Footer */}
            {messages.length === 1 && (
              <div className="px-4 py-2 flex flex-wrap gap-1.5 bg-slate-950/20 border-t border-slate-850">
                {suggestionChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(chip.prompt)}
                    className="text-[10px] px-2.5 py-1 rounded-full border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {chip.text}
                  </button>
                ))}
              </div>
            )}

            {/* Form Input */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2">
              <textarea
                rows={1}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Akua a question..."
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 resize-none max-h-16"
              />
              <button
                onClick={toggleListening}
                className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
                  isListening 
                    ? 'bg-rose-500/20 text-rose-500 animate-pulse border border-rose-500/50' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white'
                }`}
                title="Voice Input"
              >
                <Mic className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputValue.trim()}
                className="p-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-550 text-white disabled:bg-slate-800 disabled:text-slate-500 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
