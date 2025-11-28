
import React, { useEffect, useState } from 'react';
import { User, Mail, Calendar, Save, Trash2, Loader2, Camera } from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';

interface ProfileAgentProps {
  lang: 'vi' | 'en';
}

const ProfileAgent: React.FC<ProfileAgentProps> = ({ lang }) => {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    if (!auth.currentUser) return;
    try {
      const docRef = doc(db, "users", auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfileData(data);
        setEditName(data.name || '');
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!auth.currentUser) return;
    setUpdating(true);
    try {
      const docRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(docRef, {
        name: editName
      });
      setMsg(lang === 'vi' ? 'Cập nhật thành công!' : 'Profile updated successfully!');
      setTimeout(() => setMsg(''), 3000);
      fetchProfile();
    } catch (error) {
      console.error("Error updating:", error);
      setMsg(lang === 'vi' ? 'Lỗi cập nhật.' : 'Update failed.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!auth.currentUser) return;
    const confirmMsg = lang === 'vi' 
      ? 'Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.' 
      : 'Are you sure you want to delete your account? This cannot be undone.';
    
    if (window.confirm(confirmMsg)) {
        setUpdating(true);
        try {
            const uid = auth.currentUser.uid;
            // Delete Firestore Data
            await deleteDoc(doc(db, "users", uid));
            // Delete Auth User
            await deleteUser(auth.currentUser);
            // App.tsx handles the auth state change and redirects to Login
        } catch (error) {
            console.error("Error deleting account:", error);
            setMsg(lang === 'vi' ? 'Lỗi: Cần đăng nhập lại để xóa.' : 'Error: Requires recent login.');
            setUpdating(false);
        }
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-ios-blue"/></div>;

  return (
    <div className="animate-slide-up max-w-2xl mx-auto p-4">
       <div className="glass-panel p-8 rounded-3xl shadow-xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-ios-blue/20 to-ios-purple/20"></div>
           
           <div className="relative flex flex-col items-center -mt-4 mb-6">
              <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 overflow-hidden shadow-lg flex items-center justify-center">
                  {profileData?.photoBase64 ? (
                      <img src={profileData.photoBase64} alt="Profile" className="w-full h-full object-cover"/>
                  ) : (
                      <User size={64} className="text-gray-400"/>
                  )}
              </div>
              <h2 className="text-2xl font-bold mt-4 text-gray-800 dark:text-white">{profileData?.name || 'User'}</h2>
              <p className="text-gray-500 text-sm">{profileData?.email}</p>
              {profileData?.photoFileName && (
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Camera size={10} /> {profileData.photoFileName}
                  </p>
              )}
           </div>

           <div className="space-y-6">
               <div className="grid grid-cols-1 gap-4">
                   <div>
                       <label className="block text-sm font-medium text-gray-500 mb-1">{lang === 'vi' ? 'Họ và tên' : 'Full Name'}</label>
                       <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-ios-blue transition-all">
                           <User size={18} className="text-gray-400"/>
                           <input 
                              type="text" 
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="bg-transparent outline-none w-full text-gray-800 dark:text-white"
                           />
                       </div>
                   </div>

                   <div>
                       <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                       <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 opacity-70 cursor-not-allowed">
                           <Mail size={18} className="text-gray-400"/>
                           <span className="text-gray-600 dark:text-gray-400">{profileData?.email}</span>
                       </div>
                   </div>

                   <div>
                       <label className="block text-sm font-medium text-gray-500 mb-1">{lang === 'vi' ? 'Ngày tham gia' : 'Joined Date'}</label>
                       <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 opacity-70">
                           <Calendar size={18} className="text-gray-400"/>
                           <span className="text-gray-600 dark:text-gray-400">
                               {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'N/A'}
                           </span>
                       </div>
                   </div>
               </div>

               {msg && (
                   <div className={`p-3 rounded-xl text-center text-sm font-medium ${msg.includes('Lỗi') || msg.includes('Error') ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                       {msg}
                   </div>
               )}

               <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                   <button 
                      onClick={handleUpdate}
                      disabled={updating}
                      className="flex-1 py-3 bg-ios-blue hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all flex justify-center items-center gap-2"
                   >
                       {updating ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                       {lang === 'vi' ? 'Lưu thay đổi' : 'Save Changes'}
                   </button>
                   
                   <button 
                      onClick={handleDeleteAccount}
                      disabled={updating}
                      className="px-4 py-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-bold rounded-xl transition-all flex justify-center items-center"
                      title={lang === 'vi' ? 'Xóa tài khoản' : 'Delete Account'}
                   >
                       <Trash2 size={18} />
                   </button>
               </div>
           </div>
       </div>
    </div>
  );
};

export default ProfileAgent;
