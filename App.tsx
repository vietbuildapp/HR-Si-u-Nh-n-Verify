
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileEdit, 
  MessageSquare, 
  Settings, 
  Moon, 
  Sun,
  Activity,
  Globe,
  LogOut,
  Loader2,
  User
} from 'lucide-react';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth } from './firebase';
import Dashboard from './components/Dashboard';
import RecruitmentAgent from './components/RecruitmentAgent';
import JobPostAgent from './components/JobPostAgent';
import ChatbotAgent from './components/ChatbotAgent';
import OnboardingAgent from './components/OnboardingAgent';
import ToolsAgent from './components/ToolsAgent';
import ProfileAgent from './components/ProfileAgent';
import Auth from './components/Auth';
import { AgentType, Language, Theme } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeView, setActiveView] = useState<AgentType>(AgentType.DASHBOARD);
  const [theme, setTheme] = useState<Theme>('light');
  const [lang, setLang] = useState<Language>('vi');

  // Listen to Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Only set the user if they are verified. 
      // Unverified users are handled in Auth.tsx or treated as logged out here.
      if (currentUser && currentUser.emailVerified) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Toggle Dark Mode
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const navItems = [
    { id: AgentType.DASHBOARD, label: lang === 'vi' ? 'Tổng quan' : 'Dashboard', icon: LayoutDashboard },
    { id: AgentType.RECRUITMENT, label: lang === 'vi' ? 'Tuyển dụng & Hồ sơ' : 'Recruitment', icon: Users },
    { id: AgentType.JOB_POST, label: lang === 'vi' ? 'Đăng tin tuyển dụng' : 'Job Posts', icon: FileEdit },
    { id: AgentType.TOOLS, label: lang === 'vi' ? 'Công cụ AI Lab' : 'AI Tools Lab', icon: Globe },
    { id: AgentType.ONBOARDING, label: lang === 'vi' ? 'Quy trình hội nhập' : 'Onboarding', icon: Activity },
    { id: AgentType.CHATBOT, label: lang === 'vi' ? 'Trợ lý Ảo HR' : 'HR Assistant', icon: MessageSquare },
    { id: AgentType.PROFILE, label: lang === 'vi' ? 'Hồ sơ của tôi' : 'My Profile', icon: User },
  ];

  const renderContent = () => {
    switch (activeView) {
      case AgentType.DASHBOARD: return <Dashboard onNavigate={setActiveView} lang={lang} />;
      case AgentType.RECRUITMENT: return <RecruitmentAgent lang={lang} />;
      case AgentType.JOB_POST: return <JobPostAgent lang={lang} />;
      case AgentType.CHATBOT: return <ChatbotAgent lang={lang} />;
      case AgentType.ONBOARDING: return <OnboardingAgent lang={lang} />;
      case AgentType.TOOLS: return <ToolsAgent lang={lang} />;
      case AgentType.PROFILE: return <ProfileAgent lang={lang} />;
      default: return <Dashboard onNavigate={setActiveView} lang={lang} />;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ios-bg dark:bg-slate-900">
        <Loader2 className="animate-spin text-ios-blue" size={48} />
      </div>
    );
  }

  // If no user or user is not verified, show Auth
  if (!user) {
    return <Auth onLogin={() => {}} />;
  }

  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 glass-panel border-r border-white/20 dark:border-gray-700/50 h-screen sticky top-0 z-50">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-ios-blue to-ios-purple bg-clip-text text-transparent">
            HR Pro 2025
          </h1>
          <p className="text-xs text-gray-500 mt-1">Ultimate AI Ecosystem</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm ${
                activeView === item.id 
                  ? 'bg-ios-blue text-white shadow-lg shadow-blue-500/30' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Theme</span>
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-yellow-400 transition-colors"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
          <div className="flex items-center justify-between px-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Lang</span>
            <button 
              onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
              className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-600 dark:text-white uppercase"
            >
              {lang}
            </button>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 mt-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors text-sm font-medium"
          >
             <LogOut size={16} />
             {lang === 'vi' ? 'Đăng xuất' : 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-x-hidden">
        {/* Background Gradients */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
           <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-[100px] animate-pulse"></div>
           <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px]"></div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden glass-panel p-4 sticky top-0 z-50 flex justify-between items-center shadow-sm">
           <span className="font-bold text-lg bg-gradient-to-r from-ios-blue to-ios-purple bg-clip-text text-transparent">HR Pro 2025</span>
           <div className="flex gap-2">
             <button onClick={toggleTheme} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                {theme === 'light' ? <Moon size={16}/> : <Sun size={16}/>}
             </button>
             <button onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-bold uppercase">
               {lang}
             </button>
             <button onClick={handleLogout} className="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full">
               <LogOut size={16}/>
             </button>
           </div>
        </div>

        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-[calc(100vh-80px)]">
           {renderContent()}
        </div>

        {/* Mobile Bottom Nav */}
        <div className="md:hidden fixed bottom-0 left-0 w-full glass-panel border-t border-gray-200 dark:border-gray-700 flex justify-around p-2 z-50 pb-safe">
           {navItems.slice(0, 5).map((item) => (
             <button
               key={item.id}
               onClick={() => setActiveView(item.id)}
               className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
                 activeView === item.id ? 'text-ios-blue' : 'text-gray-400'
               }`}
             >
               <item.icon size={24} />
               <span className="text-[10px]">{item.label}</span>
             </button>
           ))}
             {/* Add Profile Icon to Mobile Nav specifically */}
             <button
               key="profile-mob"
               onClick={() => setActiveView(AgentType.PROFILE)}
               className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
                 activeView === AgentType.PROFILE ? 'text-ios-blue' : 'text-gray-400'
               }`}
             >
               <User size={24} />
               <span className="text-[10px]">{lang === 'vi' ? 'Hồ sơ' : 'Profile'}</span>
             </button>
        </div>
      </main>
    </div>
  );
};

export default App;
