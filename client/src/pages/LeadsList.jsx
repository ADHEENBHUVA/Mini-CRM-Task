import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, Search, Plus, ExternalLink, User, Eye, Edit2, Trash2, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { confirmAction } from '../utils/confirmAction';

const LeadsList = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [viewMode, setViewMode] = useState('Active');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get('view') === 'deleted') {
            setViewMode('Deleted');
        } else {
            setViewMode('Active');
        }
    }, [location.search]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                // Fetch both leads and employees simultaneously
                const [resLeads, resEmp] = await Promise.all([
                    axios.get(`http://localhost:5000/api/leads?viewDeleted=${viewMode === 'Deleted'}`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('http://localhost:5000/api/employees', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] }))
                ]);

                setLeads(resLeads.data);
                setEmployees(resEmp.data);
            } catch (error) {
                console.error("Failed fetching data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [viewMode]);

    const handleDelete = async (id, permanent = false) => {
        const confirmed = await confirmAction(`Are you absolutely sure you want to ${permanent ? 'permanently ' : ''}delete this lead?`);
        if (!confirmed) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/leads/${id}${permanent ? '?permanent=true' : ''}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLeads(leads.filter(lead => lead._id !== id));
            toast.success(permanent ? 'Lead permanently deleted' : 'Lead deleted');
        } catch (error) {
            toast.error('Failed to delete lead');
        }
    };

    const handleRestore = async (id) => {
        const confirmed = await confirmAction('Are you absolutely sure you want to restore this lead?');
        if (!confirmed) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/leads/${id}/restore`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLeads(leads.filter(lead => lead._id !== id));
            toast.success('Lead restored');
        } catch (error) {
            toast.error('Failed to restore lead');
        }
    };

    const filteredLeads = leads.filter(lead => {
        if (!selectedEmployee) return true;
        const empId = typeof lead.assignedEmployee === 'object' ? lead.assignedEmployee?._id : lead.assignedEmployee;
        return empId === selectedEmployee;
    });

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

            {/* Filter Bar */}
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] shadow-sm rounded-3xl p-4 sm:px-6 flex flex-col sm:flex-row items-center gap-4 transition-colors">
                <select
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value)}
                    className="w-full sm:w-48 bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                >
                    <option value="Active">Active Leads</option>
                    <option value="Deleted">Deleted Leads</option>
                </select>

                <div className="flex items-center gap-3 w-full max-w-sm ring-1 ring-slate-200 dark:ring-slate-700/50 rounded-xl px-4 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500/50 bg-slate-50 dark:bg-[#0F1523] transition-all">
                    <User className="w-5 h-5 text-slate-400 shrink-0" />
                    <select
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                        className="w-full bg-transparent border-none py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-0 appearance-none"
                    >
                        <option value="">All Assigned Employees</option>
                        {employees.map(emp => (
                            <option key={emp._id} value={emp._id}>{emp.name}</option>
                        ))}
                    </select>
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
                                <th className="px-6 py-4">Assigned To</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-[#1E293B]">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">Loading leads...</td>
                                </tr>
                            ) : filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center">
                                        <Briefcase className="w-12 h-12 mb-3 opacity-20" />
                                        No leads found. Create your first lead to begin!
                                    </td>
                                </tr>

                            ) : (
                                filteredLeads.map((lead) => (
                                    <tr key={lead._id} onClick={() => navigate(`/leads/${lead._id}`)} className="hover:bg-slate-50/80 dark:hover:bg-[#151D2C]/80 transition-colors group cursor-pointer">
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{lead.contactPerson}</td>
                                        <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">{lead.companyName}</td>
                                        <td className="px-6 py-4 text-indigo-600 dark:text-indigo-400 font-semibold">{lead.status}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            {lead.assignedEmployee ? lead.assignedEmployee.name : <span className="text-slate-400 italic">Unassigned</span>}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                                                {viewMode === 'Active' ? (
                                                    <>
                                                        <Link to={`/leads/${lead._id}`} onClick={(e) => e.stopPropagation()} className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all" title="View Details">
                                                            <Eye className="w-[18px] h-[18px]" strokeWidth={2.2} />
                                                        </Link>
                                                        <Link to={`/leads/${lead._id}/edit`} onClick={(e) => e.stopPropagation()} className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-all" title="Edit">
                                                            <Edit2 className="w-[18px] h-[18px]" strokeWidth={2.2} />
                                                        </Link>
                                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(lead._id); }} className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all" title="Delete">
                                                            <Trash2 className="w-[18px] h-[18px]" strokeWidth={2.2} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={(e) => { e.stopPropagation(); handleRestore(lead._id); }} className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-all" title="Restore">
                                                            <RefreshCcw className="w-[18px] h-[18px]" strokeWidth={2.2} />
                                                        </button>
                                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(lead._id, true); }} className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all" title="Delete Permanently">
                                                            <Trash2 className="w-[18px] h-[18px]" strokeWidth={2.2} />
                                                        </button>
                                                    </>
                                                )}
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

export default LeadsList;
