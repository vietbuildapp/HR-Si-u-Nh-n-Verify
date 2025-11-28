
import React, { useState } from 'react';
import { UserPlus, Calendar, List, CheckSquare, Loader2, Mail } from 'lucide-react';
import { generateOnboardingPlan, generateWelcomeEmail } from '../services/gemini';
import { OnboardingTask } from '../types';

interface OnboardingAgentProps {
  lang: 'vi' | 'en';
}

const OnboardingAgent: React.FC<OnboardingAgentProps> = ({ lang }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<OnboardingTask[]>([]);
  const [activeTab, setActiveTab] = useState<'checklist' | 'email'>('checklist');
  const [welcomeEmail, setWelcomeEmail] = useState('');

  const handleGenerate = async () => {
    if (!name || !role) return;
    setLoading(true);
    
    if (activeTab === 'checklist') {
        const result = await generateOnboardingPlan(role, name, lang);
        // @ts-ignore
        const newTasks = result.map((t: any, idx: number) => ({
          ...t,
          id: idx.toString(),
          status: 'pending'
        }));
        setTasks(newTasks);
    } else {
        const email = await generateWelcomeEmail(role, name, lang);
        setWelcomeEmail(email);
    }
    
    setLoading(false);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t
    ));
  };

  return (
    <div className="animate-slide-up max-w-5xl mx-auto p-2 md:p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 glass-panel p-6 rounded-3xl shadow-lg h-fit">
        <div className="flex items-center gap-3 mb-6">
           <div className="bg-ios-green p-2 rounded-xl text-white shadow-lg shadow-green-500/30">
             <UserPlus size={24} />
           </div>
           <h3 className="font-bold text-gray-800 dark:text-white">{lang === 'vi' ? 'Thông tin nhân sự' : 'New Hire Info'}</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">{lang === 'vi' ? 'Họ tên nhân viên' : 'Full Name'}</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-ios-green outline-none transition-all"
              placeholder={lang === 'vi' ? 'Ví dụ: Nguyễn Văn A' : 'Ex: Nguyen Van A'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">{lang === 'vi' ? 'Vị trí / Chức danh' : 'Position / Role'}</label>
            <input 
              type="text" 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-ios-green outline-none transition-all"
              placeholder={lang === 'vi' ? 'Ví dụ: Nhân viên Kinh doanh' : 'Ex: Sales Executive'}
            />
          </div>
          
          <div className="pt-2">
             <label className="block text-sm font-medium text-gray-500 mb-2">{lang === 'vi' ? 'Chọn tác vụ' : 'Select Task'}</label>
             <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                <button 
                  onClick={() => setActiveTab('checklist')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'checklist' ? 'bg-white dark:bg-gray-700 shadow-sm text-ios-green' : 'text-gray-400'}`}
                >
                    Checklist
                </button>
                <button 
                  onClick={() => setActiveTab('email')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'email' ? 'bg-white dark:bg-gray-700 shadow-sm text-ios-green' : 'text-gray-400'}`}
                >
                    Email
                </button>
             </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !name || !role}
            className="w-full py-3 bg-ios-green hover:bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 transition-all flex justify-center items-center gap-2 mt-2 disabled:opacity-50"
          >
             {loading ? <Loader2 className="animate-spin" /> : (lang === 'vi' ? 'Tạo Kế Hoạch AI' : 'Generate AI')}
          </button>
        </div>
      </div>

      <div className="md:col-span-2 glass-panel p-6 rounded-3xl shadow-lg min-h-[400px]">
        {activeTab === 'checklist' ? (
            <>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                  <List size={20} className="text-ios-green" />
                  {lang === 'vi' ? 'Danh sách công việc (Checklist)' : 'Onboarding Checklist'}
                </h3>

                {tasks.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                    <CheckSquare size={48} className="mb-2 opacity-50" />
                    <p>{lang === 'vi' ? 'Chưa có dữ liệu. Hãy nhập thông tin bên trái.' : 'No tasks generated yet. Fill info on the left.'}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                     {tasks.map((task) => (
                       <div 
                         key={task.id} 
                         onClick={() => toggleTask(task.id)}
                         className={`p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition-all border ${
                           task.status === 'completed' 
                             ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                             : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:shadow-md'
                         }`}
                       >
                         <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                           task.status === 'completed' ? 'bg-ios-green border-ios-green' : 'border-gray-300 dark:border-gray-500'
                         }`}>
                           {task.status === 'completed' && <CheckSquare size={14} className="text-white" />}
                         </div>
                         <div className="flex-1">
                           <p className={`font-medium ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-800 dark:text-white'}`}>
                             {task.task}
                           </p>
                           <div className="flex gap-3 text-xs text-gray-500 mt-1">
                             <span className="flex items-center gap-1"><Calendar size={12}/> {task.dueDate}</span>
                             <span>Assignee: {task.assignee}</span>
                           </div>
                         </div>
                       </div>
                     ))}
                  </div>
                )}
            </>
        ) : (
            <>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                  <Mail size={20} className="text-ios-green" />
                  {lang === 'vi' ? 'Email Chào Mừng' : 'Welcome Email'}
                </h3>
                <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 min-h-[300px]">
                    {welcomeEmail ? (
                        <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 font-sans">
                            {welcomeEmail}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                           <Mail size={48} className="mb-2 opacity-50" />
                           <p>{lang === 'vi' ? 'Nhấn nút tạo để viết email mẫu' : 'Press Generate to draft email'}</p>
                        </div>
                    )}
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default OnboardingAgent;
