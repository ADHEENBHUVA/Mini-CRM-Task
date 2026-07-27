import React from 'react';
import { Bell, Search, UserCircle, Menu, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = ({ onMenuClick, theme, setTheme }) => {
    const user = JSON.parse(localStorage.getItem('user')) || { name: 'Admin User', role: 'Superadmin' };

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

                    {/* Search Bar */}
                    <div className="flex-1 max-w-xl relative group hidden sm:block">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search Leads..."
                            className="block w-full pl-12 pr-4 py-2 md:py-3 border border-slate-200 dark:border-[#1E293B] rounded-xl md:rounded-2xl leading-5 bg-slate-100 dark:bg-[#151D2C] text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-[#1A2333] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-all duration-300 shadow-inner dark:shadow-black/20"
                        />
                    </div>
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
                    <button className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-[#1E293B] rounded-full transition-all duration-300">
                        <Bell className="w-6 h-6" />
                        <span className="absolute top-[6px] right-[8px] block h-2.5 w-2.5 rounded-full border-2 border-white dark:border-[#0B0F19] bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span>
                    </button>

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
        </header>
    );
};

export default Navbar;
