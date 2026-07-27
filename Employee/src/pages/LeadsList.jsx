import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Briefcase, Search, Plus, ExternalLink } from 'lucide-react';

const LeadsList = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeads = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/leads', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setLeads(res.data);
            } catch (error) {
                console.error("Failed fetching leads", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeads();
    }, []);

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/70 dark:bg-[#0B0F19]/60 backdrop-blur-md p-6 sm:px-8 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-slate-200 dark:border-[#1E293B] transition-colors">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">Leads Management</h2>
                    <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1 sm:mt-2 font-medium">Manage pipeline and customer relationships.</p>
                </div>

                <Link to="/leads/new" className="mt-4 sm:mt-0 flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-[0_4px_15px_rgba(79,70,229,0.3)] dark:shadow-[0_0_15px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 justify-center">
                    <Plus className="w-5 h-5" />
                    <span>Create Lead</span>
                </Link>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] shadow-lg shadow-slate-200/50 dark:shadow-xl rounded-3xl overflow-hidden transition-colors">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-[#1E293B]/50 text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-colors border-b border-slate-200 dark:border-[#1E293B]">
                                <th className="px-6 py-4">Client Name</th>
                                <th className="px-6 py-4">Company</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-[#1E293B]">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">Loading leads...</td>
                                </tr>
                            ) : leads.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center">
                                        <Briefcase className="w-12 h-12 mb-3 opacity-20" />
                                        No leads found. Create your first lead to begin!
                                    </td>
                                </tr>
                            ) : (
                                leads.map((lead) => (
                                    <tr key={lead._id} className="hover:bg-slate-50/80 dark:hover:bg-[#151D2C]/80 transition-colors group">
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{lead.contactPerson}</td>
                                        <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">{lead.companyName}</td>
                                        <td className="px-6 py-4 text-indigo-600 dark:text-indigo-400 font-semibold">{lead.status}</td>
                                        <td className="px-6 py-4 text-right">
                                            <Link to={`/leads/${lead._id}`} className="inline-block p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-[#1E293B] rounded-lg transition-colors">
                                                <ExternalLink className="w-5 h-5" />
                                            </Link>
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

export default LeadsList;
