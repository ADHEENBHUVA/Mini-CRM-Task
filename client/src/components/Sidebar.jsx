import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, Briefcase, CalendarClock, User, LogOut, X } from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const navItems = [
        { label: 'Dashboard', icon: Home, path: '/' },
        { label: 'Employees', icon: Users, path: '/employees' },
        { label: 'Leads', icon: Briefcase, path: '/leads' },
        { label: 'Followups', icon: CalendarClock, path: '/followups' },
        { label: 'Profile', icon: User, path: '/profile' },
    ];

    return (
        <aside className={`w-64 bg-white dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 flex flex-col h-screen fixed left-0 top-0 border-r border-slate-200 dark:border-[#1E293B] shadow-[4px_0_24px_rgba(0,0,0,0.05)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.5)] z-20 transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-6 flex justify-between items-center bg-white dark:bg-[#0B0F19] transition-colors">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <span className="font-extrabold text-white">N</span>
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-none transition-colors">
                            NextBuy
                        </h1>
                        <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1 mt-0.5">CRM System</p>
                    </div>
                </div>

                <button
                    onClick={() => setIsOpen(false)}
                    className="md:hidden p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            <nav className="flex-1 px-4 mt-2 md:mt-6 space-y-2 relative overflow-y-auto pb-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.label}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group overflow-hidden ${isActive
                                ? 'bg-indigo-50 dark:bg-[#1E293B] text-indigo-700 dark:text-white shadow-sm dark:shadow-none border border-indigo-200 dark:border-slate-700/50'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#151D2C] hover:text-slate-900 dark:hover:text-white'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)]"></div>
                                )}
                                <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'text-indigo-500 dark:text-indigo-400' : 'group-hover:scale-110 group-hover:text-indigo-500 dark:group-hover:text-indigo-400'}`} />
                                <span className="font-medium tracking-wide">{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#0B0F19]/80 backdrop-blur-md transition-colors">
                <button
                    onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl transition-all duration-300"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
