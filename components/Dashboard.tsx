
import React from 'react';
import { 
  Users, 
  FileText, 
  Send, 
  MessageSquare, 
  TrendingUp, 
  Activity,
  Globe
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AgentType } from '../types';

const data = [
  { name: 'Mon', cvs: 4, hired: 1 },
  { name: 'Tue', cvs: 3, hired: 0 },
  { name: 'Wed', cvs: 7, hired: 2 },
  { name: 'Thu', cvs: 5, hired: 1 },
  { name: 'Fri', cvs: 12, hired: 3 },
  { name: 'Sat', cvs: 6, hired: 1 },
  { name: 'Sun', cvs: 2, hired: 0 },
];

interface DashboardProps {
  onNavigate: (view: AgentType) => void;
  lang: 'vi' | 'en';
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, lang }) => {
  const stats = [
    { title: lang === 'vi' ? 'Hồ sơ đã xử lý' : 'CVs Processed', value: '142', icon: FileText, color: 'text-ios-blue', bg: 'bg-ios-blue/10' },
    { title: lang === 'vi' ? 'Tuyển dụng mới' : 'New Hires', value: '12', icon: Users, color: 'text-ios-green', bg: 'bg-ios-green/10' },
    { title: lang === 'vi' ? 'Hiệu suất AI' : 'AI Efficiency', value: '94%', icon: Activity, color: 'text-ios-purple', bg: 'bg-ios-purple/10' },
    { title: lang === 'vi' ? 'Phỏng vấn' : 'Interviews', value: '28', icon: Send, color: 'text-ios-orange', bg: 'bg-ios-orange/10' },
  ];

  return (
    <div className="space-y-6 animate-fade-in p-2 md:p-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="glass-panel p-5 rounded-3xl flex flex-col items-start justify-between h-32 hover:scale-[1.02] transition-transform duration-300 shadow-lg shadow-gray-200/50 dark:shadow-none">
            <div className={`p-2 rounded-full ${stat.bg} ${stat.color} mb-2`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl shadow-xl dark:shadow-none">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-ios-blue" />
            {lang === 'vi' ? 'Xu Hướng Tuyển Dụng' : 'Recruitment Trend'}
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorCvs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#007AFF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#007AFF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#374151' }}
                />
                <Area type="monotone" dataKey="cvs" stroke="#007AFF" strokeWidth={3} fillOpacity={1} fill="url(#colorCvs)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl shadow-xl dark:shadow-none flex flex-col">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            {lang === 'vi' ? 'Truy cập nhanh' : 'Quick Access'}
          </h3>
          <div className="space-y-3 flex-1">
            <button 
              onClick={() => onNavigate(AgentType.TOOLS)}
              className="w-full text-left p-4 rounded-2xl bg-white/50 dark:bg-slate-700/50 hover:bg-white dark:hover:bg-slate-700 transition-all flex items-center gap-3 group border border-transparent hover:border-pink-500/30"
            >
              <div className="bg-pink-100 dark:bg-pink-900/30 p-2 rounded-xl text-pink-500 group-hover:scale-110 transition-transform">
                <Globe size={18} />
              </div>
              <div>
                <span className="font-semibold text-gray-800 dark:text-white block">{lang === 'vi' ? 'Công cụ AI Lab' : 'AI Tools Lab'}</span>
                <span className="text-xs text-gray-500">{lang === 'vi' ? 'Thị trường, Phỏng vấn, Phân tích' : 'Market, Sentiment, Voice'}</span>
              </div>
            </button>

            <button 
              onClick={() => onNavigate(AgentType.RECRUITMENT)}
              className="w-full text-left p-4 rounded-2xl bg-white/50 dark:bg-slate-700/50 hover:bg-white dark:hover:bg-slate-700 transition-all flex items-center gap-3 group border border-transparent hover:border-ios-blue/30"
            >
              <div className="bg-ios-blue/10 p-2 rounded-xl text-ios-blue group-hover:scale-110 transition-transform">
                <Users size={18} />
              </div>
              <div>
                <span className="font-semibold text-gray-800 dark:text-white block">{lang === 'vi' ? 'Tuyển dụng thông minh' : 'Recruitment AI'}</span>
                <span className="text-xs text-gray-500">{lang === 'vi' ? 'Phân tích JD & Lọc hồ sơ' : 'Analyze JDs & CVs'}</span>
              </div>
            </button>

            <button 
              onClick={() => onNavigate(AgentType.ONBOARDING)}
              className="w-full text-left p-4 rounded-2xl bg-white/50 dark:bg-slate-700/50 hover:bg-white dark:hover:bg-slate-700 transition-all flex items-center gap-3 group border border-transparent hover:border-ios-green/30"
            >
              <div className="bg-ios-green/10 p-2 rounded-xl text-ios-green group-hover:scale-110 transition-transform">
                <Activity size={18} />
              </div>
              <div>
                <span className="font-semibold text-gray-800 dark:text-white block">{lang === 'vi' ? 'Quy trình Hội nhập' : 'Onboarding'}</span>
                <span className="text-xs text-gray-500">{lang === 'vi' ? 'Chào đón nhân sự mới' : 'Welcome new staff'}</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
