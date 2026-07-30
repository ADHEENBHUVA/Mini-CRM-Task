import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Trash2, RotateCcw, Target, Users, Calendar, XCircle, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const Trash = () => {
    const [activeTab, setActiveTab] = useState('Leads');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const token = localStorage.getItem('token');

    // Make sure only admins can be here? Admin-only filter is done by the routes if we set it in App.jsx.
    // For now we assume the layout gives us valid token. We will just fetch.

    useEffect(() => {
        fetchTrashData();
    }, [activeTab]);

    const fetchTrashData = async () => {
        setLoading(true);
        try {
            let endpoint = '';
            let params = { isDeleted: 'true', viewDeleted: 'true' }; // viewDeleted for leads, isDeleted for followups

            if (activeTab === 'Leads') {
                endpoint = '/api/leads';
            } else if (activeTab === 'Employees') {
                endpoint = '/api/employees';
            } else if (activeTab === 'Follow-ups') {
                endpoint = '/api/followups';
            }

            const res = await axios.get(`http://localhost:5000${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` },
                params: params
            });

            // For followups, they are already filtered by isDeleted natively if we set it right. Wait, the controller used req.query.isDeleted === 'true'. So it works.
            setItems(res.data);
        } catch (error) {
            console.error(error);
            toast.error(`Failed to load ${activeTab} trash`);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (id) => {
        try {
            let endpoint = '';
            if (activeTab === 'Leads') endpoint = `/api/leads/${id}/restore`;
            else if (activeTab === 'Employees') endpoint = `/api/employees/${id}/restore`;
            else if (activeTab === 'Follow-ups') endpoint = `/api/followups/${id}/restore`;

            await axios.patch(`http://localhost:5000${endpoint}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success(`${activeTab.slice(0, -1)} restored successfully`);
            setItems(items.filter(item => item._id !== id));
        } catch (error) {
            toast.error('Failed to restore item');
        }
    };

    const handleHardDelete = async (id) => {
        if (!window.confirm('Are you absolutely sure? This action cannot be undone.')) return;

        try {
            let endpoint = '';
            if (activeTab === 'Leads') endpoint = `/api/leads/${id}?permanent=true`;
            else if (activeTab === 'Employees') endpoint = `/api/employees/${id}?hard=true`; // Check employee API
            else if (activeTab === 'Follow-ups') endpoint = `/api/followups/${id}?hard=true`;

            await axios.delete(`http://localhost:5000${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success(`${activeTab.slice(0, -1)} permanently deleted`);
            setItems(items.filter(item => item._id !== id));
        } catch (error) {
            toast.error('Failed to delete permanently');
        }
    };

    const tabs = ['Leads', 'Employees', 'Follow-ups'];

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
            {/* Header Content */}
            <div className="relative overflow-hidden bg-white dark:bg-[#0B0F19]/80 backdrop-blur-md p-8 sm:p-10 rounded-[2rem] shadow-xl shadow-rose-500/5 dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-rose-100 dark:border-rose-500/20 transition-colors">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-rose-500/10 to-red-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
                <div className="flex justify-between items-center relative z-10">
                    <div>
                        <h1 className="text-[28px] sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                            <Trash2 className="w-8 h-8 sm:w-10 sm:h-10 text-rose-500" />
                            System Trash
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-2 font-medium max-w-xl">
                            Manage and completely restore records that were previously deleted. Items permanently deleted here cannot be recovered.
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 px-1">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl border text-sm font-bold transition-all duration-300 shadow-sm outline-none
                            ${activeTab === tab
                                ? 'bg-white dark:bg-[#1E293B] border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 shadow-[0_4px_15px_rgba(244,63,94,0.1)] -translate-y-0.5'
                                : 'bg-slate-50 dark:bg-[#0F1523] border-slate-200 dark:border-[#2A374C] text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-[#151D2C] hover:border-slate-300 dark:hover:border-slate-100 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                    >
                        {tab === 'Leads' && <Target className="w-4 h-4" />}
                        {tab === 'Employees' && <Users className="w-4 h-4" />}
                        {tab === 'Follow-ups' && <Calendar className="w-4 h-4" />}
                        {tab}
                    </button>
                ))}
            </div>

            {/* Table List */}
            <div className="bg-white dark:bg-[#0F172A] rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-[#1E293B] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-[#1E293B] text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-slate-50/80 dark:bg-[#0B0F19]/50">
                                {activeTab === 'Leads' && (
                                    <>
                                        <th className="px-8 py-5">Company Name</th>
                                        <th className="px-8 py-5">Contact Person</th>
                                        <th className="px-8 py-5">Email</th>
                                        <th className="px-8 py-5">Status</th>
                                        <th className="px-8 py-5">Phone</th>
                                        <th className="px-8 py-5 text-center">Action</th>
                                    </>
                                )}
                                {activeTab === 'Employees' && (
                                    <>
                                        <th className="px-8 py-5">Name</th>
                                        <th className="px-8 py-5">Department</th>
                                        <th className="px-8 py-5">Email</th>
                                        <th className="px-8 py-5">Status</th>
                                        <th className="px-8 py-5">Role</th>
                                        <th className="px-8 py-5 text-center">Action</th>
                                    </>
                                )}
                                {activeTab === 'Follow-ups' && (
                                    <>
                                        <th className="px-8 py-5">Lead Name</th>
                                        <th className="px-8 py-5">Remarks</th>
                                        <th className="px-8 py-5">Status</th>
                                        <th className="px-8 py-5">Date Added</th>
                                        <th className="px-8 py-5 text-center">Action</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-20 text-center">
                                        <div className="w-8 h-8 border-4 border-slate-100 dark:border-slate-800 border-t-[#5B5CE7] rounded-full animate-spin mx-auto"></div>
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-24 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center">
                                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-800">
                                            <Trash2 className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                                        </div>
                                        <p className="font-bold text-lg text-slate-600 dark:text-slate-300">Trash is completely empty</p>
                                        <p className="text-sm mt-1">No deleted items to show here right now.</p>
                                    </td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item._id} className="border-b border-slate-50/80 dark:border-slate-800/80 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        {activeTab === 'Leads' && (
                                            <>
                                                <td className="px-8 py-4 text-[13px] font-bold text-[#111827] dark:text-slate-200">{item.companyName}</td>
                                                <td className="px-8 py-4 text-[13px] font-semibold text-slate-600 dark:text-slate-400">{item.contactPerson}</td>
                                                <td className="px-8 py-4 text-[13px] font-semibold text-slate-600 dark:text-slate-400">{item.email}</td>
                                                <td className="px-8 py-4 text-[13px] font-bold text-rose-500 dark:text-rose-400">Deleted</td>
                                                <td className="px-8 py-4 text-[13px] font-semibold text-slate-600 dark:text-slate-400">{item.phone}</td>
                                            </>
                                        )}
                                        {activeTab === 'Employees' && (
                                            <>
                                                <td className="px-8 py-4 text-[13px] font-bold text-[#111827] dark:text-slate-200">{item.name}</td>
                                                <td className="px-8 py-4 text-[13px] font-semibold text-slate-600 dark:text-slate-400">{item.department}</td>
                                                <td className="px-8 py-4 text-[13px] font-semibold text-slate-600 dark:text-slate-400">{item.email}</td>
                                                <td className="px-8 py-4 text-[13px] font-bold text-rose-500 dark:text-rose-400">Deleted</td>
                                                <td className="px-8 py-4 text-[13px] font-semibold text-slate-600 dark:text-slate-400">{item.role}</td>
                                            </>
                                        )}
                                        {activeTab === 'Follow-ups' && (
                                            <>
                                                <td className="px-8 py-4 text-[13px] font-bold text-[#111827] dark:text-slate-200">{item.lead?.companyName || 'Unknown Lead'}</td>
                                                <td className="px-8 py-4 text-[13px] font-semibold text-slate-600 dark:text-slate-400 max-w-[200px] truncate">{item.remarks || 'Standard'}</td>
                                                <td className="px-8 py-4 text-[13px] font-bold text-rose-500 dark:text-rose-400">Deleted</td>
                                                <td className="px-8 py-4">
                                                    <div className="text-[12px] font-bold text-[#111827] dark:text-slate-200 uppercase tracking-wider">{new Date(item.followupDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                                    {item.followupTime && <div className="text-[11px] font-bold text-[#5B5CE7] dark:text-indigo-400 mt-0.5 uppercase tracking-widest">{item.followupTime}</div>}
                                                </td>
                                            </>
                                        )}
                                        <td className="px-8 py-5 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => handleRestore(item._id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold transition-colors border border-emerald-100/50 dark:border-emerald-500/20 shadow-sm" title="Restore">
                                                    <RotateCcw className="w-3.5 h-3.5" strokeWidth={2.5} /> Restore
                                                </button>
                                                <button onClick={() => handleHardDelete(item._id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-bold transition-colors border border-rose-100/50 dark:border-rose-500/20 shadow-sm" title="Delete Forever">
                                                    <XCircle className="w-3.5 h-3.5" strokeWidth={2.5} /> Purge
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Trash;
