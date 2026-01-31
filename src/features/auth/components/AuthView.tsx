import { useState } from 'react';
import { Mail, Lock, Loader2, ArrowRight, Github } from 'lucide-react';
import { signIn, signUp, signInWithGithub } from '../../../services/supabaseClient';
import { Toaster, toast } from 'react-hot-toast';
import { useAppStore } from '../../../store';
import { MnemoLogo } from '../../../components/MnemoLogo';

const AuthView = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { user, error } = isLogin
                ? await signIn(email, password)
                : await signUp(email, password);

            if (error) {
                toast.error(error.message);
            } else if (user) {
                toast.success(isLogin ? 'Successfully logged in!' : 'Account created! Please check your email.');
            }
        } catch (err) {
            toast.error('An unexpected error occurred.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGithubLogin = async () => {
        setLoading(true);
        try {
            const { error } = await signInWithGithub();
            if (error) toast.error(error.message);
        } catch (err) {
            toast.error('GitHub login failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex h-screen items-center justify-center overflow-hidden bg-slate-900 font-sans">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[100px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-[20%] right-[20%] w-[300px] h-[300px] bg-orange-500/10 rounded-full blur-[80px] animate-bounce-slow"></div>
            </div>

            {/* Mesh Grid Pattern Overlay */}
            <div className="absolute inset-0 z-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}>
            </div>

            <Toaster position="top-center" />

            {/* Main Glass Card */}
            <div className="relative z-10 w-full max-w-sm mx-4 mt-10">
                <div className="backdrop-blur-2xl bg-white/10 border border-white/20 shadow-2xl rounded-[32px] p-8 overflow-hidden relative group">
                    {/* Inner Texture */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 pointer-events-none"></div>

                    {/* Logo Area */}
                    <div className="relative flex flex-col items-center mb-8">
                        <div className="w-20 h-20 mb-4 relative drop-shadow-2xl filter hover:brightness-110 transition-all duration-300">
                            <MnemoLogo className="w-full h-full object-contain" />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight text-center drop-shadow-lg">
                            Mnemo
                        </h1>
                        <p className="text-blue-200/80 font-medium text-sm mt-1 text-center">
                            Master Your Vocabulary
                        </p>
                    </div>

                    {/* Toggle Tabs */}
                    <div className="flex p-1 bg-black/20 backdrop-blur-md rounded-2xl mb-6 border border-white/5">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${isLogin
                                ? 'bg-white shadow-lg text-slate-900 scale-100'
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${!isLogin
                                ? 'bg-white shadow-lg text-slate-900 scale-100'
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            Create Account
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-blue-200 ml-1">Email</label>
                            <div className="relative group/input">
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur opacity-0 group-focus-within/input:opacity-50 transition-opacity duration-300"></div>
                                <div className="relative flex items-center bg-black/30 border border-white/10 rounded-xl focus-within:bg-black/40 focus-within:border-white/30 transition-all overflow-hidden text-white/90">
                                    <div className="pl-4 pr-3 text-white/40">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full py-3 bg-transparent outline-none placeholder:text-white/20 font-medium text-sm"
                                        placeholder="hello@example.com"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-blue-200 ml-1">Password</label>
                            <div className="relative group/input">
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur opacity-0 group-focus-within/input:opacity-50 transition-opacity duration-300"></div>
                                <div className="relative flex items-center bg-black/30 border border-white/10 rounded-xl focus-within:bg-black/40 focus-within:border-white/30 transition-all overflow-hidden text-white/90">
                                    <div className="pl-4 pr-3 text-white/40">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full py-3 bg-transparent outline-none placeholder:text-white/20 font-medium text-sm"
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full group relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(6,182,212,0.5)] hover:shadow-[0_0_25px_-5px_rgba(6,182,212,0.6)] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                        >
                            <div className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? <Loader2 className="animate-spin" size={18} /> : (
                                    <>
                                        <span>{isLogin ? 'Enter Mnemo' : 'Join Now'}</span>
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-xl"></div>
                        </button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-transparent px-2 text-[10px] text-white/30 uppercase tracking-widest font-bold">Or</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGithubLogin}
                        disabled={loading}
                        className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm group"
                    >
                        <Github size={18} className="text-white/80 group-hover:text-white transition-colors" />
                        <span>Continue with GitHub</span>
                    </button>

                    {/* Footer Guest Link */}
                    <div className="mt-8 text-center">
                        <button
                            onClick={() => {
                                useAppStore.getState().actions.loginAsGuest();
                                toast.success('Welcome to Guest Mode');
                            }}
                            className="text-xs text-white/40 hover:text-cyan-300 transition-colors font-medium border-b border-transparent hover:border-cyan-300/50 pb-0.5"
                        >
                            I just want to look around →
                        </button>
                    </div>
                </div>

                {/* Copyright/Version - subtle at bottom */}
                <div className="text-center mt-6 opacity-30">
                    <p className="text-[10px] text-white font-mono tracking-widest">MNEMO v1.0</p>
                </div>
            </div>
        </div>
    );
};

export default AuthView;
