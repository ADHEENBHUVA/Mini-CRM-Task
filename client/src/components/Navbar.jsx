import React, { useState, useEffect } from 'react';
import { Bell, Search, UserCircle, Menu, Sun, Moon, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Navbar = ({ onMenuClick, theme, setTheme }) => {
    const user = JSON.parse(localStorage.getItem('user')) || { name: 'Admin User', role: 'Superadmin' };

    const [dueFollowups, setDueFollowups] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const res = await axios.get('http://localhost:5000/api/followups/due', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data) setDueFollowups(res.data.count);
            } catch (error) {
                console.error("Failed fetching notifications");
            }
        };
        fetchNotifications();
        // Poll every 30 seconds for live updates
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <header className="h-16 md:h-20 bg-white/70 dark:bg-[#0B0F19]/90 backdrop-blur-xl border-b border-slate-200 dark:border-[#1E293B] sticky top-0 z-10 transition-colors duration-300">
            <div className="flex h-full items-center justify-between px-4 md:px-8">

                <div className="flex items-center gap-3">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={onMenuClick}
                        className="p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white md:hidden rounded-lg hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-3 md:gap-6 ml-4">
                    {/* Theme Toggle */}
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="p-2 relative text-slate-500 dark:text-slate-400 outline-none hover:text-slate-900 dark:hover:text-white transition-colors hover:bg-slate-100 dark:hover:bg-[#1E293B] rounded-xl"
                        aria-label="Toggle Dark Mode"
                    >
                        {theme === 'dark' ? <Sun className="w-5 h-5 md:w-6 md:h-6" /> : <Moon className="w-5 h-5 md:w-6 md:h-6" />}
                    </button>

                    {/* Notification Bell */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-[#1E293B] rounded-full transition-all duration-300"
                        >
                            <Bell className="w-6 h-6" />
                            {dueFollowups > 0 && (
                                <span className="absolute top-[6px] right-[8px] block h-2.5 w-2.5 rounded-full border-2 border-white dark:border-[#0B0F19] bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse"></span>
                            )}
                        </button>

                        {/* Dropdown Menu */}
                        {showNotifications && (
                            <div className="absolute top-full mt-3 right-0 w-72 bg-white dark:bg-[#0F1523] border border-slate-200 dark:border-[#1E293B] rounded-xl shadow-xl dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden z-20 animate-in zoom-in-95 duration-200">
                                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                    <h3 className="font-bold text-slate-800 dark:text-white">Notifications</h3>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {dueFollowups > 0 ? (
                                        <Link to="/leads?filter=followup" onClick={() => setShowNotifications(false)} className="px-4 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors flex items-start gap-3 border-b border-slate-100 dark:border-slate-800 break-words">
                                            <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Follow-ups Required</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">You have {dueFollowups} leads requiring immediate attention.</p>
                                                <span className="text-[10px] uppercase font-bold text-rose-500 mt-2 block">Action Needed</span>
                                            </div>
                                        </Link>
                                    ) : (
                                        <div className="px-4 py-6 text-center text-slate-500 dark:text-slate-400">
                                            <p className="text-sm">You're all caught up!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User Profile */}
                    <Link to="/profile" className="flex items-center gap-4 cursor-pointer group p-1.5 pr-3 hover:bg-slate-100 dark:hover:bg-[#1E293B] rounded-full transition-all duration-300">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40">
                            <div className="w-full h-full rounded-full bg-slate-50 dark:bg-[#151D2C] flex items-center justify-center text-sm font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-widest">
                                {(() => {
                                    const name = user.name || user.email || 'Admin';
                                    const parts = name.trim().split(/\s+/);
                                    if (parts.length > 1) {
                                        return (parts[0][0] + parts[1][0]).substring(0, 2);
                                    }
                                    return name.substring(0, 2);
                                })()}
                            </div>
                        </div>
                        <div className="hidden sm:block text-left">
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors">{user.name || user.email || 'Admin User'}</p>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{user.role || 'Administrator'}</p>
                        </div>
                    </Link>
                </div>

            </div>
        </header >
    );
};

export default Navbar;
