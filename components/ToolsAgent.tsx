
import React, { useState, useRef } from 'react';
import { 
  Globe, 
  Search, 
  BarChart2, 
  HeartPulse, 
  Mic, 
  Play, 
  AlertTriangle, 
  ExternalLink, 
  Loader2,
  Volume2
} from 'lucide-react';
import { getSalaryBenchmark, analyzeSentiment, speakInterviewQuestion } from '../services/gemini';
import { MarketData, SentimentResult } from '../types';

interface ToolsAgentProps {
  lang: 'vi' | 'en';
}

const ToolsAgent: React.FC<ToolsAgentProps> = ({ lang }) => {
  const [activeTool, setActiveTool] = useState<'market' | 'sentiment' | 'interview'>('market');

  // Market Scout State
  const [marketRole, setMarketRole] = useState('');
  const [marketLocation, setMarketLocation] = useState('Vietnam');
  const [marketData, setMarketData] = useState<{text: string, sources: any[]} | null>(null);
  const [marketLoading, setMarketLoading] = useState(false);

  // Sentiment State
  const [sentimentText, setSentimentText] = useState('');
  const [sentimentResult, setSentimentResult] = useState<SentimentResult | null>(null);
  const [sentimentLoading, setSentimentLoading] = useState(false);

  // Interview State
  const [interviewRole, setInterviewRole] = useState('');
  const [audioData, setAudioData] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- Handlers ---

  const handleMarketSearch = async () => {
    if (!marketRole) return;
    setMarketLoading(true);
    const result = await getSalaryBenchmark(marketRole, marketLocation, lang);
    // @ts-ignore
    setMarketData(result);
    setMarketLoading(false);
  };

  const handleSentimentAnalysis = async () => {
    if (!sentimentText) return;
    setSentimentLoading(true);
    // @ts-ignore
    const result: SentimentResult = await analyzeSentiment(sentimentText, lang);
    setSentimentResult(result);
    setSentimentLoading(false);
  };

  const handleInterviewGen = async () => {
    if (!interviewRole) return;
    setAudioLoading(true);
    const result = await speakInterviewQuestion(interviewRole, lang);
    setAudioData(result || null);
    setAudioLoading(false);
  };

  const playAudio = () => {
    if (audioData) {
      const audio = new Audio(`data:audio/mp3;base64,${audioData}`);
      audio.play();
    }
  };

  return (
    <div className="animate-slide-up max-w-6xl mx-auto p-2 space-y-6">
      <div className="flex items-center gap-3 mb-2">
         <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl text-white shadow-lg shadow-pink-500/30">
            <Globe size={24} />
         </div>
         <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">AI Tools Lab</h2>
            <p className="text-sm text-gray-500">{lang === 'vi' ? 'Các tính năng mở rộng của Gemini 2.5' : 'Experimental features powered by Gemini 2.5'}</p>
         </div>
      </div>

      {/* Tool Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          onClick={() => setActiveTool('market')}
          className={`p-4 rounded-2xl border transition-all flex items-center gap-3 ${activeTool === 'market' ? 'bg-white dark:bg-slate-800 border-ios-blue ring-2 ring-ios-blue shadow-lg' : 'bg-white/50 dark:bg-slate-800/50 border-transparent hover:bg-white dark:hover:bg-slate-800'}`}
        >
          <div className="bg-blue-100 dark:bg-blue-900/30 text-ios-blue p-2 rounded-xl"><Search size={20}/></div>
          <div className="text-left">
            <div className="font-bold text-gray-800 dark:text-white">{lang === 'vi' ? 'Tra cứu Lương' : 'Market Scout'}</div>
            <div className="text-xs text-gray-500">{lang === 'vi' ? 'Dữ liệu thời gian thực' : 'Real-time Search Grounding'}</div>
          </div>
        </button>

        <button 
          onClick={() => setActiveTool('sentiment')}
          className={`p-4 rounded-2xl border transition-all flex items-center gap-3 ${activeTool === 'sentiment' ? 'bg-white dark:bg-slate-800 border-ios-red ring-2 ring-ios-red shadow-lg' : 'bg-white/50 dark:bg-slate-800/50 border-transparent hover:bg-white dark:hover:bg-slate-800'}`}
        >
          <div className="bg-red-100 dark:bg-red-900/30 text-ios-red p-2 rounded-xl"><HeartPulse size={20}/></div>
          <div className="text-left">
            <div className="font-bold text-gray-800 dark:text-white">{lang === 'vi' ? 'Đo lường Hài lòng' : 'Flight Risk'}</div>
            <div className="text-xs text-gray-500">{lang === 'vi' ? 'Phân tích cảm xúc' : 'Sentiment Analysis'}</div>
          </div>
        </button>

        <button 
          onClick={() => setActiveTool('interview')}
          className={`p-4 rounded-2xl border transition-all flex items-center gap-3 ${activeTool === 'interview' ? 'bg-white dark:bg-slate-800 border-ios-purple ring-2 ring-ios-purple shadow-lg' : 'bg-white/50 dark:bg-slate-800/50 border-transparent hover:bg-white dark:hover:bg-slate-800'}`}
        >
          <div className="bg-purple-100 dark:bg-purple-900/30 text-ios-purple p-2 rounded-xl"><Mic size={20}/></div>
          <div className="text-left">
            <div className="font-bold text-gray-800 dark:text-white">{lang === 'vi' ? 'Phỏng vấn Ảo' : 'Interview Sim'}</div>
            <div className="text-xs text-gray-500">{lang === 'vi' ? 'Giọng nói AI' : 'Gemini Neural Audio'}</div>
          </div>
        </button>
      </div>

      {/* Active Tool Content */}
      <div className="glass-panel p-6 rounded-3xl shadow-xl min-h-[400px]">
        
        {/* === MARKET SCOUT === */}
        {activeTool === 'market' && (
          <div className="space-y-6 animate-fade-in">
             <div className="flex flex-col md:flex-row gap-4">
                <input 
                  value={marketRole}
                  onChange={(e) => setMarketRole(e.target.value)}
                  placeholder={lang === 'vi' ? "Nhập vị trí (ví dụ: Senior React Dev)" : "Enter Role (e.g. Senior React Dev)"}
                  className="flex-1 p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-ios-blue outline-none"
                />
                <input 
                  value={marketLocation}
                  onChange={(e) => setMarketLocation(e.target.value)}
                  placeholder={lang === 'vi' ? "Địa điểm" : "Location"}
                  className="md:w-1/4 p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-ios-blue outline-none"
                />
                <button 
                  onClick={handleMarketSearch}
                  disabled={marketLoading || !marketRole}
                  className="bg-ios-blue hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2"
                >
                   {marketLoading ? <Loader2 className="animate-spin"/> : <Search size={20}/>}
                   {lang === 'vi' ? 'Tra cứu' : 'Scout'}
                </button>
             </div>

             {marketData && (
                <div className="space-y-4">
                   <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 text-gray-800 dark:text-gray-200 leading-relaxed">
                      <div className="flex items-start gap-3">
                         <BarChart2 className="text-ios-blue shrink-0 mt-1" />
                         <div className="whitespace-pre-wrap">{marketData.text}</div>
                      </div>
                   </div>
                   
                   {marketData.sources.length > 0 && (
                     <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Sources (Grounding)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                           {marketData.sources.map((s, i) => (
                              <a href={s.uri} target="_blank" rel="noreferrer" key={i} className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-ios-blue transition-colors group">
                                 <ExternalLink size={14} className="text-gray-400 group-hover:text-ios-blue"/>
                                 <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{s.title}</span>
                              </a>
                           ))}
                        </div>
                     </div>
                   )}
                </div>
             )}
          </div>
        )}

        {/* === SENTIMENT ANALYZER === */}
        {activeTool === 'sentiment' && (
          <div className="space-y-6 animate-fade-in">
             <div className="relative">
                <textarea 
                  value={sentimentText}
                  onChange={(e) => setSentimentText(e.target.value)}
                  placeholder={lang === 'vi' ? "Dán nội dung khảo sát, email hoặc feedback của nhân viên..." : "Paste employee survey, email, or feedback here..."}
                  className="w-full h-32 p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-ios-red outline-none resize-none"
                />
                <button 
                  onClick={handleSentimentAnalysis}
                  disabled={sentimentLoading || !sentimentText}
                  className="absolute bottom-4 right-4 bg-ios-red hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-all shadow-lg shadow-red-500/30 flex items-center gap-2 text-sm"
                >
                   {sentimentLoading ? <Loader2 className="animate-spin" size={16}/> : <HeartPulse size={16}/>}
                   {lang === 'vi' ? 'Phân tích Rủi ro' : 'Analyze Risk'}
                </button>
             </div>

             {sentimentResult && (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                     <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                           <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200 dark:text-gray-700" />
                           <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" 
                              strokeDasharray={377} 
                              strokeDashoffset={377 - (377 * sentimentResult.score) / 100}
                              className={`${sentimentResult.riskLevel === 'Critical' ? 'text-ios-red' : sentimentResult.riskLevel === 'High' ? 'text-ios-orange' : 'text-ios-green'}`} 
                           />
                        </svg>
                        <span className="absolute text-3xl font-bold text-gray-800 dark:text-white">{sentimentResult.score}</span>
                     </div>
                     <p className="mt-4 font-bold text-gray-600 dark:text-gray-300">{lang === 'vi' ? 'Điểm Hài Lòng' : 'Retention Score'}</p>
                     <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase mt-2 ${
                        sentimentResult.riskLevel === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                     }`}>
                        {lang === 'vi' ? 'Rủi ro: ' : 'Risk: '} {sentimentResult.riskLevel}
                     </span>
                  </div>

                  <div className="md:col-span-2 space-y-4">
                     <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <h4 className="font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                           <AlertTriangle size={18} className="text-ios-orange"/> {lang === 'vi' ? 'Tóm tắt' : 'Summary'}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{sentimentResult.summary}</p>
                     </div>
                     <div>
                        <h4 className="font-bold text-gray-800 dark:text-white mb-2">{lang === 'vi' ? 'Đề xuất hành động' : 'Recommended Actions'}</h4>
                        <ul className="space-y-2">
                           {sentimentResult.actionItems.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                 <span className="min-w-[20px] h-5 flex items-center justify-center bg-ios-blue text-white rounded-full text-xs font-bold">{i+1}</span>
                                 {item}
                              </li>
                           ))}
                        </ul>
                     </div>
                  </div>
               </div>
             )}
          </div>
        )}

        {/* === INTERVIEW COACH === */}
        {activeTool === 'interview' && (
           <div className="flex flex-col items-center justify-center py-10 animate-fade-in text-center">
              <div className="bg-purple-100 dark:bg-purple-900/20 p-6 rounded-full mb-6 relative">
                 <div className="absolute inset-0 bg-ios-purple opacity-20 rounded-full animate-ping"></div>
                 <Mic size={48} className="text-ios-purple relative z-10" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{lang === 'vi' ? 'Giả lập Phỏng vấn AI' : 'AI Interview Simulator'}</h3>
              <p className="text-gray-500 mb-8 max-w-md">
                 {lang === 'vi' 
                    ? 'Tạo câu hỏi phỏng vấn thực tế bằng giọng nói AI cao cấp của Gemini.' 
                    : 'Generate realistic, spoken interview questions for any role using Gemini\'s high-fidelity text-to-speech.'}
              </p>

              <div className="flex w-full max-w-md gap-3 mb-8">
                 <input 
                   value={interviewRole}
                   onChange={(e) => setInterviewRole(e.target.value)}
                   placeholder={lang === 'vi' ? "Vị trí phỏng vấn (VD: Trưởng phòng Marketing)" : "Role (e.g. Project Manager)"}
                   className="flex-1 p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-ios-purple outline-none"
                 />
                 <button 
                    onClick={handleInterviewGen}
                    disabled={audioLoading || !interviewRole}
                    className="bg-ios-purple hover:bg-purple-600 text-white font-bold p-3 rounded-xl transition-all shadow-lg shadow-purple-500/30"
                 >
                    {audioLoading ? <Loader2 className="animate-spin"/> : <Play fill="currentColor"/>}
                 </button>
              </div>

              {audioData && (
                 <div className="animate-slide-up w-full max-w-md p-6 bg-gray-900 rounded-3xl shadow-2xl flex flex-col items-center gap-4">
                    <div className="w-full flex justify-between items-center text-gray-400 text-xs uppercase font-bold tracking-widest">
                       <span>Voice: Fenrir</span>
                       <span>Gemini 2.5</span>
                    </div>
                    
                    {/* Visualizer Mockup */}
                    <div className="flex items-center gap-1 h-12">
                       {[...Array(20)].map((_, i) => (
                          <div 
                            key={i} 
                            className="w-1 bg-ios-purple rounded-full animate-pulse" 
                            style={{ 
                               height: `${Math.random() * 100}%`,
                               animationDelay: `${i * 0.05}s`
                            }}
                          ></div>
                       ))}
                    </div>

                    <button 
                       onClick={playAudio}
                       className="w-full py-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                    >
                       <Volume2 size={20} />
                       {lang === 'vi' ? 'Nghe Câu Hỏi' : 'Listen to Question'}
                    </button>
                 </div>
              )}
           </div>
        )}

      </div>
    </div>
  );
};

export default ToolsAgent;
