
import React, { useState } from 'react';
import { Share2, Copy, Check, Linkedin, Facebook, Twitter, Loader2, Image as ImageIcon, Sparkles, Video } from 'lucide-react';
import { generateJobPost, generateJobImage, generateRecruitmentVideo } from '../services/gemini';

interface JobPostAgentProps {
  lang: 'vi' | 'en';
}

const JobPostAgent: React.FC<JobPostAgentProps> = ({ lang }) => {
  const [jdText, setJdText] = useState('');
  const [platform, setPlatform] = useState('LinkedIn');
  const [tone, setTone] = useState('Professional');
  const [generatedContent, setGeneratedContent] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [activeMedia, setActiveMedia] = useState<'image' | 'video'>('image');
  const [loading, setLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!jdText) return;
    setLoading(true);
    const result = await generateJobPost(jdText, platform, tone, lang);
    setGeneratedContent(result || '');
    setLoading(false);
  };

  const handleGenerateImage = async () => {
    // Extract a simple title or just use text
    const title = jdText.slice(0, 50) + "..."; 
    setActiveMedia('image');
    setImgLoading(true);
    const imgData = await generateJobImage(title);
    setGeneratedImage(imgData);
    setImgLoading(false);
  }

  const handleGenerateVideo = async () => {
    const title = jdText.slice(0, 50) + "...";
    setActiveMedia('video');
    setVideoLoading(true);
    const videoUrl = await generateRecruitmentVideo(title, lang);
    setGeneratedVideo(videoUrl);
    setVideoLoading(false);
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const platforms = [
    { name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' },
    { name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
    { name: 'Twitter', icon: Twitter, color: 'text-sky-500' },
  ];

  return (
    <div className="animate-slide-up max-w-5xl mx-auto p-2 md:p-4">
      <div className="glass-panel p-6 md:p-8 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-ios-indigo p-2 rounded-xl text-white shadow-lg shadow-indigo-500/30">
            <Share2 size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {lang === 'vi' ? 'Tạo Tin Tuyển Dụng' : 'Job Post Generator'}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                {lang === 'vi' ? 'Mô tả công việc / Thông tin chính' : 'Job Description / Key Info'}
              </label>
              <textarea
                className="w-full h-32 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-ios-indigo outline-none resize-none transition-all text-sm"
                placeholder={lang === 'vi' ? 'Nhập tóm tắt công việc tại đây...' : 'Enter job summary...'}
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
              />
            </div>

            <div className="flex gap-4">
               <div className="flex-1">
                 <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{lang === 'vi' ? 'Nền tảng' : 'Platform'}</label>
                 <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl">
                   {platforms.map((p) => (
                     <button
                       key={p.name}
                       onClick={() => setPlatform(p.name)}
                       className={`flex-1 flex justify-center py-2 rounded-lg transition-all ${
                         platform === p.name ? 'bg-white dark:bg-gray-700 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-gray-700/50'
                       }`}
                     >
                       <p.icon size={18} className={platform === p.name ? p.color : 'text-gray-400'} />
                     </button>
                   ))}
                 </div>
               </div>
               <div className="flex-1">
                 <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{lang === 'vi' ? 'Giọng văn' : 'Tone'}</label>
                 <select 
                   value={tone}
                   onChange={(e) => setTone(e.target.value)}
                   className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-ios-indigo text-sm"
                 >
                   <option value="Professional">{lang === 'vi' ? 'Chuyên nghiệp' : 'Professional'}</option>
                   <option value="Casual & Fun">{lang === 'vi' ? 'Trẻ trung & Vui vẻ' : 'Casual & Fun'}</option>
                   <option value="Urgent">{lang === 'vi' ? 'Gấp gáp' : 'Urgent'}</option>
                   <option value="Executive">{lang === 'vi' ? 'Cao cấp / C-Level' : 'Executive'}</option>
                 </select>
               </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleGenerate}
                disabled={loading || !jdText}
                className="flex-1 py-3 bg-ios-indigo hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : (lang === 'vi' ? 'Viết nội dung' : 'Write Copy')}
              </button>
              
              <div className="flex gap-2">
                  <button
                    onClick={handleGenerateImage}
                    disabled={imgLoading || !jdText}
                    className={`px-4 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-ios-indigo border border-ios-indigo/20 font-bold rounded-xl transition-all flex justify-center items-center gap-2 ${activeMedia === 'image' ? 'ring-2 ring-ios-indigo' : ''}`}
                    title="Generate Image"
                  >
                    {imgLoading ? <Loader2 className="animate-spin" /> : <ImageIcon size={20} />}
                  </button>
                  <button
                    onClick={handleGenerateVideo}
                    disabled={videoLoading || !jdText}
                    className={`px-4 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-pink-500 border border-pink-500/20 font-bold rounded-xl transition-all flex justify-center items-center gap-2 ${activeMedia === 'video' ? 'ring-2 ring-pink-500' : ''}`}
                    title="Generate Video (Veo)"
                  >
                    {videoLoading ? <Loader2 className="animate-spin" /> : <Video size={20} />}
                  </button>
              </div>
            </div>
            
            <p className="text-[10px] text-gray-400 italic text-center">
                * Video generation powered by Google Veo.
            </p>
          </div>

          {/* Preview Section */}
          <div className="relative h-full min-h-[450px]">
             <div className="absolute inset-0 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
               <div className="p-3 border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm flex justify-between items-center sticky top-0 z-10">
                 <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    {lang === 'vi' ? 'Xem trước' : 'Preview'} ({platform}) <Sparkles size={10} className="text-yellow-500"/>
                 </span>
                 {generatedContent && (
                   <button 
                    onClick={handleCopy}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-ios-indigo"
                    title="Copy"
                   >
                     {copied ? <Check size={16} /> : <Copy size={16} />}
                   </button>
                 )}
               </div>
               
               <div className="flex-1 overflow-y-auto font-sans">
                  {/* Media Preview Area */}
                  <div className="w-full bg-gray-200 dark:bg-gray-800 aspect-video relative flex items-center justify-center overflow-hidden">
                    {activeMedia === 'image' && (
                        imgLoading ? (
                            <div className="flex flex-col items-center text-gray-500 gap-2">
                               <Loader2 className="animate-spin text-ios-indigo" size={32} />
                               <span className="text-xs">{lang === 'vi' ? 'Đang tạo ảnh AI...' : 'Generating AI Image...'}</span>
                            </div>
                        ) : generatedImage ? (
                            <img src={generatedImage} alt="Generated Job Post" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-gray-400 flex flex-col items-center gap-2">
                               <ImageIcon size={32} opacity={0.5}/>
                               <span className="text-xs">{lang === 'vi' ? 'Chưa có ảnh minh họa' : 'Image placeholder'}</span>
                            </div>
                        )
                    )}

                    {activeMedia === 'video' && (
                        videoLoading ? (
                            <div className="flex flex-col items-center text-pink-500 gap-2 p-6 text-center">
                               <Loader2 className="animate-spin" size={32} />
                               <span className="text-xs font-bold">{lang === 'vi' ? 'Đang tạo video Veo...' : 'Generating Veo Video...'}</span>
                               <span className="text-[10px] text-gray-400 max-w-[200px]">{lang === 'vi' ? 'Quá trình này có thể mất 1-2 phút.' : 'This usually takes 1-2 minutes.'}</span>
                            </div>
                        ) : generatedVideo ? (
                            <video controls autoPlay loop className="w-full h-full object-cover">
                                <source src={generatedVideo} type="video/mp4" />
                            </video>
                        ) : (
                            <div className="text-gray-400 flex flex-col items-center gap-2">
                               <Video size={32} opacity={0.5}/>
                               <span className="text-xs">{lang === 'vi' ? 'Chưa có video' : 'Video placeholder'}</span>
                            </div>
                        )
                    )}
                  </div>

                  <div className="p-4 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                    {generatedContent || <span className="text-gray-400 italic">{lang === 'vi' ? 'Nội dung sẽ hiện ở đây...' : 'Content will appear here...'}</span>}
                  </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobPostAgent;
