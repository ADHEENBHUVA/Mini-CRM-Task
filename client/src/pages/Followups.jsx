import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CalendarClock, CheckCircle, Clock } from 'lucide-react';

const Followups = () => {
    const [followups, setFollowups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFollowups();
    }, []);

    const fetchFollowups = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/followups', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFollowups(res.data);
        } catch (error) {
            console.error('Failed to fetch followups', error);
        } finally {
            setLoading(false);
        }
    };

    const markComplete = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/followups/${id}`, { status: 'Completed' }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchFollowups();
        } catch (error) {
            console.error('Failed to update followup', error);
        }
    };

    if (loading) return <div className="p-10 font-bold text-center">Loading Follow-ups...</div>;

    const pending = followups.filter(f => f.status === 'Pending' || f.status === 'Due Follow-up');
    const completed = followups.filter(f => f.status === 'Completed');

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
            <div className="flex items-center justify-between bg-white/70 dark:bg-[#0B0F19]/60 backdrop-blur-md p-6 sm:px-8 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-slate-200 dark:border-[#1E293B]">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Follow-ups Registry</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Never miss another check-in with your clients.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending List */}
                <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] shadow-lg rounded-3xl p-6">
                    <h3 className="text-xl font-bold flex items-center gap-2 mb-6 text-amber-600 dark:text-amber-500">
                        <Clock className="w-5 h-5" /> Due & Upcoming
                    </h3>
                    <div className="space-y-4">
                        {pending.length === 0 ? (
                            <p className="text-slate-400 italic">No pending follow-ups!</p>
                        ) : (
                            pending.map(f => {
                                const isPastDue = new Date(f.followupDate) < new Date();
                                return (
                                    <div key={f._id} className={`p-4 rounded-2xl border transition-all ${isPastDue ? 'bg-rose-50/50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/30' : 'bg-slate-50 border-slate-200 dark:bg-[#151D2C] dark:border-[#2A374C]'}`}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white">{f.lead?.companyName || 'Unknown Lead'}</p>
                                                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{f.remarks}</p>
                                                <p className={`text-xs font-bold mt-2 uppercase tracking-wide ${isPastDue ? 'text-rose-600 dark:text-rose-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                                    {isPastDue ? 'PAST DUE: ' : 'DUE: '} {new Date(f.followupDate).toLocaleString('en-GB')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Completed List */}
                <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] shadow-lg rounded-3xl p-6 opacity-80">
                    <h3 className="text-xl font-bold flex items-center gap-2 mb-6 text-emerald-600 dark:text-emerald-500">
                        <CheckCircle className="w-5 h-5" /> Completed
                    </h3>
                    <div className="space-y-4">
                        {completed.length === 0 ? (
                            <p className="text-slate-400 italic">No completed follow-ups.</p>
                        ) : (
                            completed.map(f => (
                                <div key={f._id} className="p-4 rounded-2xl border bg-slate-50 border-slate-200 dark:bg-[#151D2C] dark:border-[#2A374C] flex justify-between items-center opacity-80 transition-all hover:opacity-100">
                                    <div>
                                        <p className="font-bold text-slate-700 dark:text-slate-300">{f.lead?.companyName || 'Unknown Lead'}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{f.remarks ? f.remarks : 'No remarks attached.'}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                                        <CheckCircle className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase tracking-wide">Done</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Followups;
