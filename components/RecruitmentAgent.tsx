
import React, { useState } from 'react';
import { Upload, CheckCircle, FileText, Loader2, Tag, Briefcase, DollarSign } from 'lucide-react';
import { analyzeJD, scoreCV } from '../services/gemini';
import { CVData, JDAnalysis } from '../types';

interface RecruitmentAgentProps {
  lang: 'vi' | 'en';
}

const RecruitmentAgent: React.FC<RecruitmentAgentProps> = ({ lang }) => {
  const [jdText, setJdText] = useState('');
  const [analysis, setAnalysis] = useState<JDAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvResult, setCvResult] = useState<CVData | null>(null);

  const handleAnalyzeJD = async () => {
    if (!jdText.trim()) return;
    setLoading(true);
    // @ts-ignore
    const result: JDAnalysis = await analyzeJD(jdText, lang);
    setAnalysis(result);
    setLoading(false);
  };

  const handleCVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const handleScoreCV = async () => {
    if (!cvFile || !jdText) return;
    setLoading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const result = await scoreCV(jdText, text);
      setCvResult({
        id: Date.now().toString(),
        name: cvFile.name,
        content: text,
        ...result
      });
      setLoading(false);
    };
    reader.readAsText(cvFile);
  };

  return (
    <div className="animate-slide-up space-y-6 max-w-6xl mx-auto p-2">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* JD Section */}
        <div className="glass-panel p-6 rounded-3xl shadow-lg flex flex-col h-full">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <div className="bg-ios-blue rounded-lg p-1">
              <FileText size={20} className="text-white" />
            </div>
            {lang === 'vi' ? '1. Phân Tích JD' : '1. Analyze JD'}
          </h3>
          <textarea
            className="w-full h-40 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-ios-blue outline-none resize-none transition-all text-sm mb-4"
            placeholder={lang === 'vi' ? 'Dán nội dung mô tả công việc (JD) vào đây...' : 'Paste JD content here...'}
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
          />
          <button
            onClick={handleAnalyzeJD}
            disabled={loading || !jdText}
            className="w-full py-3 bg-ios-blue hover:bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : (lang === 'vi' ? 'Phân Tích Ngay' : 'Analyze Now')}
          </button>

          {analysis && (
            <div className="mt-6 space-y-4 animate-fade-in flex-1 overflow-y-auto">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                <h4 className="font-semibold text-ios-blue mb-1 text-sm">{lang === 'vi' ? 'Tóm tắt' : 'Summary'}</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">{analysis.summary}</p>
              </div>
              
              <div className="flex gap-4">
                 <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center gap-3">
                    <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg text-ios-orange"><Briefcase size={16}/></div>
                    <div>
                       <p className="text-xs text-gray-500">{lang === 'vi' ? 'Kinh nghiệm' : 'Experience'}</p>
                       <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{analysis.experience}</p>
                    </div>
                 </div>
                 <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center gap-3">
                    <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg text-ios-green"><DollarSign size={16}/></div>
                    <div>
                       <p className="text-xs text-gray-500">{lang === 'vi' ? 'Mức lương' : 'Salary'}</p>
                       <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{analysis.salary}</p>
                    </div>
                 </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2 text-sm">{lang === 'vi' ? 'Kỹ năng cốt lõi' : 'Critical Skills'}</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.skills?.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-ios-indigo text-xs font-medium flex items-center gap-1 border border-indigo-100 dark:border-indigo-800">
                      <Tag size={10} /> {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CV Scoring Section */}
        <div className="glass-panel p-6 rounded-3xl shadow-lg flex flex-col h-full relative overflow-hidden">
          {!analysis && (
            <div className="absolute inset-0 bg-gray-100/60 dark:bg-slate-900/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-6">
               <FileText size={48} className="text-gray-400 mb-4 opacity-50" />
               <p className="text-gray-600 dark:text-gray-400 font-medium">
                {lang === 'vi' ? 'Vui lòng phân tích JD trước để mở khóa tính năng đánh giá ứng viên' : 'Please analyze a JD first to unlock AI CV scoring'}
               </p>
            </div>
          )}
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <div className="bg-ios-purple rounded-lg p-1">
              <CheckCircle size={20} className="text-white" />
            </div>
            {lang === 'vi' ? '2. Đánh giá Hồ sơ' : '2. Score Candidate'}
          </h3>

          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-ios-purple transition-colors bg-gray-50/50 dark:bg-slate-800/50 group mb-4">
            <input 
              type="file" 
              accept=".txt,.md,.json" 
              onChange={handleCVUpload}
              className="hidden" 
              id="cv-upload" 
            />
            <label htmlFor="cv-upload" className="cursor-pointer flex flex-col items-center">
              <Upload size={32} className="text-gray-400 group-hover:text-ios-purple mb-2 transition-colors" />
              <span className="text-sm text-gray-500">
                {cvFile ? cvFile.name : (lang === 'vi' ? 'Tải lên CV (định dạng .txt)' : 'Upload CV (.txt)')}
              </span>
            </label>
          </div>

          <button
            onClick={handleScoreCV}
            disabled={loading || !cvFile}
            className="w-full py-3 bg-ios-purple hover:bg-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : (lang === 'vi' ? 'Đánh Giá Bằng AI' : 'Score with AI')}
          </button>

          {cvResult && (
            <div className="mt-6 animate-fade-in flex-1 overflow-y-auto">
              <div className="flex items-end justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-300 font-medium text-sm">{lang === 'vi' ? 'Độ phù hợp' : 'Match Score'}</span>
                <span className={`text-4xl font-bold tracking-tight ${
                  (cvResult.score || 0) >= 75 ? 'text-ios-green' : (cvResult.score || 0) >= 50 ? 'text-ios-orange' : 'text-ios-red'
                }`}>
                  {cvResult.score}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-6">
                <div 
                  className={`h-3 rounded-full transition-all duration-1000 ${
                    (cvResult.score || 0) >= 75 ? 'bg-ios-green' : (cvResult.score || 0) >= 50 ? 'bg-ios-orange' : 'bg-ios-red'
                  }`} 
                  style={{ width: `${cvResult.score}%` }}
                ></div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h5 className="text-xs font-bold text-gray-500 uppercase mb-2">{lang === 'vi' ? 'Nhận xét' : 'Analysis'}</h5>
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{cvResult.analysis}"</p>
                </div>
                
                {cvResult.skillsMatch && cvResult.skillsMatch.length > 0 && (
                   <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
                      <h5 className="text-xs font-bold text-gray-500 uppercase mb-2">{lang === 'vi' ? 'Kỹ năng phù hợp' : 'Skills Matched'}</h5>
                      <div className="flex flex-wrap gap-1.5">
                         {cvResult.skillsMatch.map((s, i) => (
                           <span key={i} className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-md font-medium">
                             {s}
                           </span>
                         ))}
                      </div>
                   </div>
                )}
                
                <div className="flex justify-end pt-2">
                   <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${
                     cvResult.status === 'pass' ? 'bg-green-100 text-green-700 border border-green-200' :
                     cvResult.status === 'fail' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                   }`}>
                     {cvResult.status}
                   </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruitmentAgent;
