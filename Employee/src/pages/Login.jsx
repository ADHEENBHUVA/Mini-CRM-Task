import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                email,
                password
            });

            const { token, user } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070A11] relative overflow-hidden font-sans selection:bg-indigo-500/30 transition-colors duration-500">

            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-300/30 dark:bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none transition-colors"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-300/20 dark:bg-purple-600/20 rounded-full blur-[100px] pointer-events-none transition-colors"></div>

            <div className="bg-white/80 dark:bg-[#0F1523]/80 backdrop-blur-2xl border border-slate-200 dark:border-[#1E293B] p-10 rounded-3xl shadow-xl dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] w-full max-w-lg z-10 relative transition-colors duration-300">

                <div className="flex justify-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <span className="text-2xl font-extrabold text-white tracking-tighter">NB</span>
                    </div>
                </div>

                <div className="text-center mb-10">
                    <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-2 transition-colors">NextBuy CRM</h2>
                    <p className="text-slate-500 dark:text-slate-400">Secure access to your workspace</p>
                </div>

                {error && (
                    <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 p-4 rounded-xl mb-6 text-sm font-medium flex items-center animate-in fade-in zoom-in duration-300">
                        <span className="mr-2">⚠</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-slate-700 dark:text-slate-300 text-sm font-semibold mb-2 transition-colors" htmlFor="email">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            className="w-full px-5 py-3.5 rounded-xl bg-slate-50 dark:bg-[#151D2C] border border-slate-300 dark:border-[#2A374C] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300 shadow-inner dark:shadow-black/20"
                            placeholder="admin@nextbuy.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-slate-700 dark:text-slate-300 text-sm font-semibold transition-colors" htmlFor="password">
                                Password
                            </label>
                            <a href="#" className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">
                                Forgot?
                            </a>
                        </div>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full px-5 py-3.5 pr-12 rounded-xl bg-slate-50 dark:bg-[#151D2C] border border-slate-300 dark:border-[#2A374C] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300 shadow-inner dark:shadow-black/20"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors outline-none focus:outline-none focus:text-indigo-500"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 mt-8 rounded-xl text-white font-bold tracking-wide text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 shadow-[0_4px_15px_rgba(99,102,241,0.2)] dark:shadow-[0_0_20px_rgba(99,102,241,0.3)] ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(99,102,241,0.4)] dark:hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]'
                            }`}
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default Login;
