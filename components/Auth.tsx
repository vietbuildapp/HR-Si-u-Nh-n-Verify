
import React, { useState } from 'react';
import { Mail, Lock, User, Camera, ArrowRight, Loader2, AlertCircle, CheckCircle, Send, KeyRound, ArrowLeft } from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendEmailVerification, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface AuthProps {
  onLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!email) {
        setError('Please enter your email address.');
        setLoading(false);
        return;
    }

    try {
        await sendPasswordResetEmail(auth, email);
        setResetSuccess(true);
    } catch (err: any) {
        console.error(err);
        if (err.code === 'auth/user-not-found') {
            setError('No user found with this email.');
        } else if (err.code === 'auth/invalid-email') {
            setError('Invalid email address format.');
        } else {
            setError('Failed to send reset link. Try again later.');
        }
    } finally {
        setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Sign In
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;

          // Check if user exists in Firestore, if not add them
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists()) {
              await setDoc(userDocRef, {
                  name: user.displayName || 'User',
                  email: user.email,
                  photoFileName: '',
                  createdAt: new Date().toISOString()
              });
          }
          
          if (!user.emailVerified) {
            // User is not verified
            try {
               await sendEmailVerification(user);
            } catch (emailErr) {
               console.error("Rate limited or error sending verification", emailErr);
            }
            await signOut(auth); // Sign out immediately
            setVerificationPending(true); // Show verification screen
          } else {
             // User is verified, App.tsx will pick up state change
          }

        } catch (err: any) {
          console.error(err.code);
          if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
            setError('Password or Email Incorrect');
          } else if (err.code === 'auth/too-many-requests') {
            setError('Too many attempts. Please try again later.');
          } else {
            setError('Failed to sign in. Please check your connection.');
          }
        }
      } else {
        // Sign Up
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          
          // Update Auth Profile
          if (name) {
             await updateProfile(user, {
                displayName: name,
             });
          }

          // Write to Firestore
          await setDoc(doc(db, "users", user.uid), {
             name: name,
             email: email,
             photoFileName: photoFileName || '',
             // Storing preview as Base64 for display since we don't have Storage yet, 
             // though typically we'd upload to Storage and get a URL.
             photoBase64: photoPreview || '', 
             createdAt: new Date().toISOString()
          });

          // Send verification email
          await sendEmailVerification(user);

          // Do not sign in automatically. Sign out and show verification screen.
          await signOut(auth);
          setVerificationPending(true);

        } catch (err: any) {
          console.error(err.code);
          if (err.code === 'auth/email-already-in-use') {
            setError('User already exists. Sign in?');
          } else if (err.code === 'auth/weak-password') {
             setError('Password should be at least 6 characters.');
          } else {
            setError('Failed to create account.');
          }
        }
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER: Verification Pending Screen ---
  if (verificationPending) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-ios-bg dark:bg-slate-900">
          <div className="glass-panel w-full max-w-md p-8 rounded-3xl shadow-2xl relative z-10 animate-fade-in border border-white/50 dark:border-gray-700 text-center">
             <div className="w-20 h-20 bg-ios-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail size={40} className="text-ios-green animate-pulse" />
             </div>
             <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Verification Sent</h2>
             <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
               We have sent you a verification email to <span className="font-bold text-ios-blue">{email}</span>. <br/>
               Please verify it and log in.
             </p>
             <button 
               onClick={() => {
                   setVerificationPending(false);
                   setIsLogin(true); // Reset to login screen
                   setError('');
               }}
               className="w-full py-3 bg-ios-blue hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all"
             >
               Back to Login
             </button>
          </div>
        </div>
    );
  }

  // --- RENDER: Forgot Password Screen ---
  if (isForgotPassword) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-ios-bg dark:bg-slate-900">
           {/* Background Ambience */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-400/30 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-400/30 rounded-full blur-[100px]"></div>

            <div className="glass-panel w-full max-w-md p-8 rounded-3xl shadow-2xl relative z-10 animate-fade-in border border-white/50 dark:border-gray-700">
                
                {resetSuccess ? (
                    <div className="text-center">
                         <div className="w-20 h-20 bg-ios-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={40} className="text-ios-blue" />
                         </div>
                         <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Reset Link Sent</h2>
                         <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                            We sent you a password change link to <span className="font-bold text-ios-blue">{email}</span>.
                         </p>
                         <button 
                           onClick={() => {
                               setIsForgotPassword(false);
                               setResetSuccess(false);
                               setIsLogin(true);
                               setError('');
                           }}
                           className="w-full py-3 bg-ios-blue hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all"
                         >
                           Sign In
                         </button>
                    </div>
                ) : (
                    <>
                        <button 
                           onClick={() => setIsForgotPassword(false)} 
                           className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors mb-4 flex items-center gap-2 text-sm font-medium"
                        >
                           <ArrowLeft size={16}/> Back
                        </button>
                        
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-ios-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <KeyRound size={32} className="text-ios-orange" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                                Forgot Password?
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                Enter your email to receive a reset link.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-3 bg-red-100 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2 justify-center">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-ios-blue transition-colors" size={20} />
                                <input 
                                type="email" 
                                placeholder="Email Address"
                                className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-ios-blue transition-all dark:text-white"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full py-3 bg-ios-orange hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transition-all flex justify-center items-center gap-2 mt-4"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Get Reset Link'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
      );
  }

  // --- RENDER: Standard Login/Signup Screen ---
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-ios-bg dark:bg-slate-900">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-400/30 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-400/30 rounded-full blur-[100px]"></div>

      <div className="glass-panel w-full max-w-md p-8 rounded-3xl shadow-2xl relative z-10 animate-fade-in border border-white/50 dark:border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-ios-blue to-ios-purple bg-clip-text text-transparent mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {isLogin ? 'Enter your credentials to access HR Pro' : 'Join the ultimate AI HR ecosystem'}
          </p>
        </div>

        {error && (
            <div className="mb-6 p-3 bg-red-100 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2 justify-center">
                <AlertCircle size={16} />
                {error}
                {error === 'User already exists. Sign in?' && (
                    <button onClick={() => { setIsLogin(true); setError(''); }} className="underline font-bold ml-1">
                        Yes
                    </button>
                )}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="flex justify-center mb-6">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden">
                        {photoPreview ? (
                            <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User size={32} className="text-gray-400" />
                        )}
                    </div>
                    <label className="absolute bottom-0 right-0 p-2 bg-ios-blue text-white rounded-full cursor-pointer hover:bg-blue-600 transition-colors shadow-lg">
                        <Camera size={14} />
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                    </label>
                </div>
                <div className="text-center mt-2">
                    {photoFileName && <p className="text-xs text-gray-500">{photoFileName}</p>}
                </div>
            </div>
          )}

          {!isLogin && (
             <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-ios-blue transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Full Name"
                  className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-ios-blue transition-all dark:text-white"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
             </div>
          )}

          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-ios-blue transition-colors" size={20} />
            <input 
              type="email" 
              placeholder="Email Address"
              className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-ios-blue transition-all dark:text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-ios-blue transition-colors" size={20} />
            <input 
              type="password" 
              placeholder="Password"
              className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-ios-blue transition-all dark:text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {isLogin && (
              <div className="flex justify-end">
                  <button 
                    type="button"
                    onClick={() => {
                        setIsForgotPassword(true);
                        setResetSuccess(false);
                        setError('');
                    }}
                    className="text-sm text-ios-blue hover:underline font-medium"
                  >
                      Forgot password?
                  </button>
              </div>
          )}

          {!isLogin && (
             <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-ios-blue transition-colors" size={20} />
                <input 
                  type="password" 
                  placeholder="Repeat Password"
                  className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-ios-blue transition-all dark:text-white"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
             </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-ios-blue to-ios-purple hover:opacity-90 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all flex justify-center items-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={18} />
                </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  onClick={() => { setIsLogin(!isLogin); setError(''); }}
                  className="text-ios-blue font-bold hover:underline"
                >
                    {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
