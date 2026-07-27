import React from 'react';
import { Users, Briefcase, CalendarClock, TrendingUp, CheckCircle, Clock } from 'lucide-react';

const Dashboard = () => {
    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/70 dark:bg-[#0B0F19]/60 backdrop-blur-md p-8 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-slate-200 dark:border-[#1E293B] transition-colors">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">Dashboard Overview</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Welcome back to NextBuy CRM. Here is your daily summary.</p>
                </div>
                <div className="mt-4 md:mt-0 flex gap-4">
                    <button className="px-6 py-2.5 bg-slate-100 dark:bg-[#1E293B] hover:bg-slate-200 dark:hover:bg-[#2A374C] text-slate-700 dark:text-slate-200 rounded-xl font-semibold transition-all duration-300 border border-slate-300 dark:border-slate-700/50 shadow-sm dark:shadow-md">
                        Generate Report
                    </button>
                    <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-[0_4px_15px_rgba(79,70,229,0.3)] dark:shadow-[0_0_15px_rgba(79,70,229,0.4)] hover:shadow-[0_6px_25px_rgba(79,70,229,0.4)] dark:hover:shadow-[0_0_25px_rgba(79,70,229,0.6)]">
                        + New Lead
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

                {/* Total Leads */}
                <div className="bg-white dark:bg-gradient-to-br dark:from-[#1E293B] dark:to-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-[#334155] shadow-lg shadow-slate-200/50 dark:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 font-semibold mb-1">Total Leads</p>
                            <h3 className="text-4xl font-bold text-slate-800 dark:text-white group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">1,245</h3>
                        </div>
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl">
                            <Users className="w-7 h-7 text-indigo-500 dark:text-indigo-400" />
                        </div>
                    </div>
                </div>

                {/* Today's Follow-ups */}
                <div className="bg-white dark:bg-gradient-to-br dark:from-[#1E293B] dark:to-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-[#334155] shadow-lg shadow-slate-200/50 dark:shadow-xl hover:shadow-amber-500/10 dark:hover:shadow-amber-500/10 hover:-translate-y-1 transition-all duration-300 group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 font-semibold mb-1">Today's Follow-ups</p>
                            <h3 className="text-4xl font-bold text-slate-800 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">24</h3>
                        </div>
                        <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-2xl">
                            <Clock className="w-7 h-7 text-amber-500 dark:text-amber-400" />
                        </div>
                    </div>
                </div>

                {/* Won Deals */}
                <div className="bg-white dark:bg-gradient-to-br dark:from-[#1E293B] dark:to-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-[#334155] shadow-lg shadow-slate-200/50 dark:shadow-xl hover:shadow-emerald-500/10 dark:hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 font-semibold mb-1">Won Deals</p>
                            <h3 className="text-4xl font-bold text-slate-800 dark:text-white group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">156</h3>
                        </div>
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl">
                            <CheckCircle className="w-7 h-7 text-emerald-500 dark:text-emerald-400" />
                        </div>
                    </div>
                </div>

                {/* Pending Leads */}
                <div className="bg-white dark:bg-gradient-to-br dark:from-[#1E293B] dark:to-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-[#334155] shadow-lg shadow-slate-200/50 dark:shadow-xl hover:shadow-purple-500/10 dark:hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300 group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 font-semibold mb-1">Pending Leads</p>
                            <h3 className="text-4xl font-bold text-slate-800 dark:text-white group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors">342</h3>
                        </div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-2xl">
                            <TrendingUp className="w-7 h-7 text-purple-500 dark:text-purple-400" />
                        </div>
                    </div>
                </div>

            </div>

            {/* Placeholder for Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                <div className="lg:col-span-2 bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-sm p-6 rounded-3xl border border-slate-200 dark:border-[#1E293B] shadow-lg shadow-slate-200/50 dark:shadow-xl min-h-[400px] flex flex-col justify-center items-center transition-colors">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 self-start">Monthly Leads Activity</h3>
                    <div className="text-slate-400 dark:text-slate-500 flex flex-col items-center gap-4">
                        <TrendingUp className="w-16 h-16 text-slate-300 dark:text-slate-700" />
                        <p>Chart Component Integration Pending</p>
                    </div>
                </div>
                <div className="bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-sm p-6 rounded-3xl border border-slate-200 dark:border-[#1E293B] shadow-lg shadow-slate-200/50 dark:shadow-xl min-h-[400px] flex flex-col justify-center items-center transition-colors">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 self-start">Lead Status</h3>
                    <div className="text-slate-400 dark:text-slate-500 flex flex-col items-center gap-4">
                        <CalendarClock className="w-16 h-16 text-slate-300 dark:text-slate-700" />
                        <p>Donut Chart Pending</p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
