import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Search, Plus, ExternalLink } from 'lucide-react';

const LeadsList = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

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
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] shadow-sm rounded-3xl p-4 sm:px-6 flex items-center transition-colors">
                <div className="flex items-center gap-3 w-full max-w-sm ring-1 ring-slate-200 dark:ring-slate-700/50 rounded-xl px-4 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500/50 bg-slate-50 dark:bg-[#0F1523] transition-all">
                    <Search className="w-5 h-5 text-slate-400 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search Leads..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent border-none py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-0"
                    />
                </div>
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
                            ) : leads.filter(lead =>
                                lead.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                lead.companyName.toLowerCase().includes(searchQuery.toLowerCase())
                            ).map((lead) => (
                                <tr key={lead._id} onClick={() => navigate(`/leads/${lead._id}`)} className="hover:bg-slate-50/80 dark:hover:bg-[#151D2C]/80 transition-colors group cursor-pointer">
                                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{lead.contactPerson}</td>
                                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">{lead.companyName}</td>
                                    <td className="px-6 py-4 text-indigo-600 dark:text-indigo-400 font-semibold">{lead.status}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Link to={`/leads/${lead._id}`} onClick={(e) => e.stopPropagation()} className="inline-block p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-[#1E293B] rounded-lg transition-colors">
                                            <ExternalLink className="w-5 h-5" />
                                        </Link>
                                    </td>
                                </tr>
                            ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LeadsList;
