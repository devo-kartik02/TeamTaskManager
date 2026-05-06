import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { fetchWithAuth } from '../../utils/api';
import { Lock, Mail, ArrowRight, Layers, Users, Zap } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const data = await fetchWithAuth('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      toast.success('Login successful!');
      navigate('/board');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0B0F19] overflow-hidden">
      {/* Left Panel - Visuals & Copy (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-black border-r border-white/5">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-indigo-600/20 blur-[120px]" />
          <div className="absolute bottom-[10%] -right-[20%] w-[60%] h-[60%] rounded-full bg-purple-600/20 blur-[100px]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <img src="/logo.png" alt="TaskMaster Logo" className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-indigo-500/20" />
            <span className="text-2xl font-bold tracking-tight text-white">TaskMaster</span>
          </div>

          <div className="max-w-lg mt-20">
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 leading-[1.1] mb-6">
              Supercharge your team's productivity.
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed mb-10">
              Streamline workflows, manage tasks visually, and collaborate in real-time with our intelligent Kanban engine.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4 text-slate-300">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <Layers className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Visual Workflow</h3>
                  <p className="text-sm text-slate-400">Drag and drop tasks across customizable boards.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-slate-300">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Seamless Collaboration</h3>
                  <p className="text-sm text-slate-400">Assign, co-assign, and track team progress instantly.</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-slate-300">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
                  <Zap className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Real-time Analytics</h3>
                  <p className="text-sm text-slate-400">Monitor velocity and bottlenecks with dynamic charts.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-auto text-sm text-slate-500 font-medium">
          © {new Date().getFullYear()} TaskMaster Inc. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none lg:hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full rounded-full bg-indigo-600/10 blur-[120px]" />
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-12">
            <img src="/logo.png" alt="TaskMaster Logo" className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-indigo-500/20" />
            <span className="text-2xl font-bold tracking-tight text-white">TaskMaster</span>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-slate-400">Log in to manage your team's tasks</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-white shadow-inner"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-300">Password</label>
                <a href="#" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-white shadow-inner"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-semibold text-lg transition-all transform hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25"
            >
              {loading ? 'Logging in...' : 'Sign In'}
              {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
