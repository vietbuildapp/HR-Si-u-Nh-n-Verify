
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Trash2, Users, Shield, Smile, BrainCircuit } from 'lucide-react';
import { chatWithHRBot } from '../services/gemini';
import { ChatMessage } from '../types';

interface ChatbotAgentProps {
  lang: 'vi' | 'en';
}

type Persona = 'recruiter' | 'policy' | 'culture';

const ChatbotAgent: React.FC<ChatbotAgentProps> = ({ lang }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [persona, setPersona] = useState<Persona>('recruiter');
  const [useThinking, setUseThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial greeting based on persona
    const greetings = {
        recruiter: lang === 'vi' 
            ? 'Chào bạn, tôi là Chuyên gia Tuyển dụng. Chúng ta cần tìm kiếm ứng viên cho vị trí nào hôm nay?' 
            : 'Hello, I am your Senior Recruiter. Who are we hiring today?',
        policy: lang === 'vi' 
            ? 'Xin chào, tôi là Chuyên gia Chính sách HR. Bạn có thắc mắc gì về Luật lao động hay Quy định công ty không?' 
            : 'Hello, HR Policy Expert here. Questions about compliance or handbook?',
        culture: lang === 'vi' 
            ? 'Chào đồng nghiệp! Mình thuộc team Văn hóa & Gắn kết. Chúng ta cùng lên ý tưởng cho sự kiện sắp tới nhé?' 
            : 'Hi! Culture & Vibes team here. Planning an event?'
    };

    setMessages([{
      id: 'init',
      role: 'model',
      text: greetings[persona],
      timestamp: new Date()
    }]);
  }, [persona, lang]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Format history for Gemini
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const responseText = await chatWithHRBot(history, userMsg.text, lang, persona, useThinking);

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText || "Sorry, I couldn't understand that.",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMsg]);
    setLoading(false);
  };

  const handleClear = () => {
    setMessages([]);
  };

  const personas = [
    { id: 'recruiter', name: lang === 'vi' ? 'Tuyển dụng' : 'Recruiter', icon: Users, color: 'text-ios-blue', bg: 'bg-ios-blue' },
    { id: 'policy', name: lang === 'vi' ? 'Luật & Chính sách' : 'Policy & Legal', icon: Shield, color: 'text-ios-orange', bg: 'bg-ios-orange' },
    { id: 'culture', name: lang === 'vi' ? 'Văn hóa' : 'Culture', icon: Smile, color: 'text-ios-pink', bg: 'bg-ios-pink' },
  ];

  return (
    <div className="animate-slide-up h-[calc(100vh-140px)] max-w-5xl mx-auto p-2 flex flex-col">
      <div className="glass-panel flex-1 rounded-3xl shadow-xl flex flex-col overflow-hidden relative border border-white/40 dark:border-gray-700">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/40 dark:bg-gray-800/40 backdrop-blur-md flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
             <div className={`p-2 rounded-full text-white shadow-lg ${personas.find(p => p.id === persona)?.bg}`}>
               <Bot size={20} />
             </div>
             <div>
               <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                 HR Assistant 
                 <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 font-normal">
                    {personas.find(p => p.id === persona)?.name}
                 </span>
               </h3>
               <p className="text-xs text-ios-green flex items-center gap-1">
                 <span className="w-2 h-2 rounded-full bg-ios-green animate-pulse"></span>
                 Online
               </p>
             </div>
          </div>
          
          <div className="flex gap-2 items-center">
              {/* Thinking Toggle */}
              <button 
                onClick={() => setUseThinking(!useThinking)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all border ${
                    useThinking 
                    ? 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-200 text-indigo-600 dark:text-indigo-300' 
                    : 'bg-gray-100 dark:bg-gray-800 border-transparent text-gray-500 hover:bg-gray-200'
                }`}
                title="Enable Gemini 2.5 Deep Thinking"
              >
                  <BrainCircuit size={16} className={useThinking ? "animate-pulse" : ""} />
                  <span className="text-xs font-bold hidden md:inline">Deep Think</span>
              </button>

              <div className="hidden md:flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                 {personas.map(p => (
                     <button
                        key={p.id}
                        onClick={() => setPersona(p.id as Persona)}
                        className={`p-2 rounded-lg transition-all ${persona === p.id ? 'bg-white dark:bg-gray-700 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                        title={p.name}
                     >
                        <p.icon size={16} className={persona === p.id ? p.color : 'text-gray-400'} />
                     </button>
                 ))}
              </div>
              <button onClick={handleClear} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 rounded-full transition-colors">
                <Trash2 size={18} />
              </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30 dark:bg-slate-900/30">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-ios-blue text-white rounded-br-none' 
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-gray-700'
              }`}>
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div className={`text-[10px] mt-1 opacity-70 ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
               <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-bl-none border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-2">
                 <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                 </div>
                 {useThinking && (
                     <div className="text-[10px] text-indigo-500 font-medium flex items-center gap-1 animate-pulse">
                         <BrainCircuit size={10} />
                         {lang === 'vi' ? 'Đang suy luận sâu...' : 'Thinking intensely...'}
                     </div>
                 )}
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 bg-gray-100 dark:bg-gray-900 border-0 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-ios-blue outline-none transition-all dark:text-white placeholder-gray-400"
              placeholder={lang === 'vi' ? 'Nhập câu hỏi của bạn...' : 'Type your question...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="bg-ios-blue hover:bg-blue-600 disabled:opacity-50 text-white p-3 rounded-2xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center aspect-square"
            >
              <Send size={20} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChatbotAgent;
