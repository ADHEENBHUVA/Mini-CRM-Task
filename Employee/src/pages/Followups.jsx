import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, Calendar, AlertCircle, Trash2 } from 'lucide-react';

const Followups = () => {
    const [followups, setFollowups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All Followups');
    const user = JSON.parse(localStorage.getItem('user')) || {};

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

    const handleDeleteFollowup = async (fid) => {
        if (!window.confirm('Are you sure you want to delete this follow-up?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/followups/${fid}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchFollowups();
        } catch (error) {
            console.error('Failed to delete followup', error);
        }
    };

    if (loading) return <div className="p-10 font-bold text-center">Loading Follow-ups...</div>;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const filteredFollowups = followups.filter(f => {
        if (activeTab === 'All Followups') return true;

        if (!f.followupDate) return false;

        const fDate = new Date(f.followupDate);
        fDate.setHours(0, 0, 0, 0);

        if (activeTab === 'Today Follow-ups') {
            return fDate.getTime() === today.getTime();
        }

        if (activeTab === 'Overdue Follow-ups') {
            return fDate < today && f.status !== 'Completed';
        }

        if (activeTab === 'Upcoming Follow-ups') {
            return fDate >= tomorrow && f.status !== 'Completed';
        }

        return true;
    });

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
            {/* Header Content */}
            <div className="flex flex-col gap-1 bg-white dark:bg-[#0B0F19]/60 backdrop-blur-md p-8 rounded-[1.5rem] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-[#E5E7EB] dark:border-[#1E293B]">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-[28px] font-extrabold text-[#111827] dark:text-white tracking-tight">Follow-ups Registry</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 font-medium">Never miss another check-in with your clients. Manage and track all your follow-ups.</p>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-4 px-1 overflow-x-auto no-scrollbar">
                {['All Followups', 'Today Follow-ups', 'Overdue Follow-ups', 'Upcoming Follow-ups'].map(tab => {
                    const isActive = activeTab === tab;
                    let TabIcon = Calendar;
                    if (tab === 'Today Follow-ups') TabIcon = Clock;
                    if (tab === 'Overdue Follow-ups') TabIcon = AlertCircle;

                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all shadow-sm whitespace-nowrap
                                ${isActive
                                    ? 'bg-white dark:bg-[#1E293B] border-indigo-100 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
                                    : 'bg-[#FAFAFA] dark:bg-[#0F1523] border-slate-200 dark:border-[#2A374C] text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-[#151D2C] hover:border-slate-300 dark:hover:border-slate-100'
                                }`}
                        >
                            <TabIcon className="w-4 h-4" />
                            {tab}
                        </button>
                    )
                })}
            </div>

            {/* List Content */}
            <div className="bg-white dark:bg-[#0F1523] rounded-[1.5rem] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-[#E5E7EB] dark:border-[#1E293B] p-4 sm:p-6 overflow-hidden mt-2">
                <div className="space-y-4">
                    {filteredFollowups.length === 0 ? (
                        <div className="p-16 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center gap-3">
                            <Calendar className="w-10 h-10 opacity-30" />
                            <p className="font-medium text-lg">No records found for that filter.</p>
                        </div>
                    ) : (
                        filteredFollowups.map(f => {
                            let fTime = new Date(f.followupDate);
                            if (f.followupTime) {
                                const [hrs, mins] = f.followupTime.split(':');
                                fTime.setHours(parseInt(hrs, 10), parseInt(mins, 10));
                            } else {
                                fTime.setHours(23, 59, 59);
                            }
                            const isPastDue = fTime < new Date() && f.status !== 'Completed';
                            const isDone = f.status === 'Completed';

                            const todayStr = new Date().toDateString();
                            const isDueToday = !isPastDue && !isDone && fTime.toDateString() === todayStr;

                            return (
                                <div key={f._id} className={`p-5 rounded-2xl border transition-all hover:shadow-md ${isDone ? 'bg-slate-50 border-slate-200 dark:bg-[#151D2C] dark:border-[#2A374C]' : isPastDue ? 'bg-rose-50/50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/30' : isDueToday ? 'bg-amber-50/50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30' : 'bg-white border-slate-200 dark:bg-[#151D2C] dark:border-[#2A374C]'}`}>
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <Link to={`/leads/${f.lead?._id}`} className="inline-block hover:underline hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                                    <p className="font-extrabold text-[#111827] dark:text-white text-lg">{f.lead?.companyName || 'Unknown Lead'}</p>
                                                </Link>
                                                {isDone && (
                                                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-[10px] font-bold rounded-md uppercase tracking-wider">Completed</span>
                                                )}
                                                {isPastDue && (
                                                    <span className="px-2.5 py-0.5 bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 text-[10px] font-bold rounded-md uppercase tracking-wider">Overdue</span>
                                                )}
                                                {isDueToday && (
                                                    <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 text-[10px] font-bold rounded-md uppercase tracking-wider">Due Today</span>
                                                )}
                                            </div>

                                            <div className="mt-2.5 text-[13px] text-slate-600 dark:text-slate-300 font-medium">
                                                <span className="font-bold text-slate-800 dark:text-slate-200 mr-2">Remarks:</span>
                                                {f.remarks || 'No remarks attached.'}
                                            </div>

                                            <div className="mt-3 flex items-center gap-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(f.followupDate).toLocaleDateString('en-GB')}
                                                </div>
                                                {f.followupTime && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {f.followupTime}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 items-center justify-end w-full md:w-auto gap-3">
                                            {user.role === 'Master Admin' && (
                                                <button onClick={() => handleDeleteFollowup(f._id)} title="Delete Follow-up" className="px-4 py-2 text-rose-500 hover:text-white hover:bg-rose-500 rounded-xl transition-colors border border-transparent hover:border-rose-600">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                            <Link to={`/leads/${f.lead?._id}`} className="px-5 py-2.5 border border-slate-200 dark:border-[#2A374C] hover:border-indigo-200 dark:hover:border-indigo-500/50 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-transparent text-slate-700 dark:text-slate-300 rounded-xl text-xs uppercase tracking-widest font-bold transition-all">
                                                View Details
                                            </Link>

                                            {!isDone && (
                                                <button onClick={() => markComplete(f._id)} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs uppercase tracking-widest font-bold transition-all shadow-[0_4px_15px_rgba(79,70,229,0.3)]">
                                                    <CheckCircle className="w-4 h-4" /> Mark Done
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default Followups;
