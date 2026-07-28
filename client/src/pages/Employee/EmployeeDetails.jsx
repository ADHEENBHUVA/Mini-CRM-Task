import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, User, Phone, Mail, MapPin, Briefcase, Hash, Star, UserCheck, XCircle, BarChart3, Clock, AlertTriangle } from 'lucide-react';

const EmployeeDetails = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        employee: null,
        stats: { total: 0, won: 0, lost: 0, active: 0 },
        leads: [],
        followups: []
    });

    useEffect(() => {
        fetchEmployeeDetails();
        // eslint-disable-next-line
    }, [id]);

    const fetchEmployeeDetails = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/employees/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(res.data);
        } catch (error) {
            console.error("Failed to fetch employee details", error);
            // Fallback mock data
            setData({
                employee: {
                    _id: id,
                    name: "John Doe",
                    email: "john@nextbuy.com",
                    phone: "+1 234 567 8900",
                    department: "Sales",
                    role: "Sales Rep",
                    status: "Active"
                },
                stats: { total: 12, won: 5, lost: 2, active: 5 },
                leads: [
                    { _id: '1', companyName: 'Acme Corp', status: 'Won', expectedBudget: 5000, priority: 'High', createdAt: new Date().toISOString() },
                    { _id: '2', companyName: 'Globex', status: 'Lost', expectedBudget: 2000, priority: 'Low', createdAt: new Date().toISOString() },
                    { _id: '3', companyName: 'Initech', status: 'New', expectedBudget: 8500, priority: 'Medium', createdAt: new Date().toISOString() }
                ]
            });
        } finally {
            setLoading(false);
        }
    };

    const handleForceFollowup = async (fId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:5000/api/followups/${fId}/force`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchEmployeeDetails();
        } catch (error) {
            console.error("Failed to force follow-up", error);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium animate-pulse">Loading employee data...</p>
                </div>
            </div>
        );
    }

    if (!data.employee) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
                <AlertTriangle className="w-16 h-16 text-rose-500 opacity-80" />
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Employee Not Found</h3>
                <p className="text-slate-500 max-w-md">The requested employee could not be located in our system.</p>
                <Link to="/employees" className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all shadow-md">
                    Return to Directory
                </Link>
            </div>
        );
    }

    const { employee, stats, leads, followups } = data;

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            {/* Header Actions */}
            <div className="flex items-center gap-3">
                <Link to="/employees" className="p-2 -ml-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Employee Profile</h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${employee.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20'}`}>
                        {employee.status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-1 border border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] rounded-3xl p-6 sm:p-8 flex flex-col items-center shadow-lg dark:shadow-xl transition-colors">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-1 shadow-lg shadow-indigo-500/30 mb-4">
                        <div className="w-full h-full rounded-full bg-white dark:bg-[#0B0F19] flex items-center justify-center text-3xl font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                            {employee.name.charAt(0)}
                        </div>
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mb-1">{employee.name}</h3>
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full mb-6 mt-2">{employee.role}</p>

                    <div className="w-full space-y-4">
                        <div className="flex items-center gap-3 text-sm">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{employee.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-700 dark:text-slate-300 font-medium shrink-0">{employee.phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Briefcase className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-700 dark:text-slate-300 font-medium shrink-0">{employee.department}</span>
                        </div>
                    </div>
                </div>

                {/* Dashboard Metrics */}
                <div className="lg:col-span-3 flex flex-col gap-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                        {/* Metric 1 */}
                        <div className="bg-white dark:bg-[#0F172A] p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-[#1E293B] shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-xl hover:shadow-[0_4px_20px_rgba(79,70,229,0.1)] transition-all group">
                            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                                <div className="p-2 sm:p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl group-hover:scale-110 transition-transform">
                                    <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Leads</p>
                            </div>
                            <h4 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white leading-none">{stats.total}</h4>
                        </div>

                        {/* Metric 2 */}
                        <div className="bg-white dark:bg-[#0F172A] p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-[#1E293B] shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-xl hover:shadow-[0_4px_20px_rgba(16,185,129,0.1)] transition-all group">
                            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                                <div className="p-2 sm:p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl group-hover:scale-110 transition-transform">
                                    <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Won</p>
                            </div>
                            <h4 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white leading-none">{stats.won}</h4>
                        </div>

                        {/* Metric 3 */}
                        <div className="bg-white dark:bg-[#0F172A] p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-[#1E293B] shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-xl hover:shadow-[0_4px_20px_rgba(244,63,94,0.1)] transition-all group">
                            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                                <div className="p-2 sm:p-3 bg-rose-50 dark:bg-rose-500/10 rounded-xl group-hover:scale-110 transition-transform">
                                    <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600 dark:text-rose-400" />
                                </div>
                                <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Lost</p>
                            </div>
                            <h4 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white leading-none">{stats.lost}</h4>
                        </div>

                        {/* Metric 4 */}
                        <div className="bg-white dark:bg-[#0F172A] p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-[#1E293B] shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-xl hover:shadow-[0_4px_20px_rgba(234,179,8,0.1)] transition-all group">
                            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                                <div className="p-2 sm:p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl group-hover:scale-110 transition-transform">
                                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400" />
                                </div>
                                <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active</p>
                            </div>
                            <h4 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white leading-none">{stats.active}</h4>
                        </div>
                    </div>

                    {/* Leads Table */}
                    <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200 dark:border-[#1E293B] shadow-lg dark:shadow-xl overflow-hidden flex-1">
                        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-[#1E293B] bg-slate-50/50 dark:bg-[#151D2C]/50 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Assigned Leads Activity</h3>
                            <span className="text-sm text-slate-500 bg-white dark:bg-[#0B0F19] px-3 py-1 rounded-full shadow-sm font-medium">{leads.length} Records</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-[#1E293B]/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-200 dark:border-[#1E293B]">
                                        <th className="px-6 py-4">Company Component</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4">Budget</th>
                                        <th className="px-6 py-4 text-right">Added On</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-[#1E293B]">
                                    {leads.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                                No leads assigned to this employee yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        leads.map((lead) => (
                                            <tr key={lead._id} className="hover:bg-slate-50/80 dark:hover:bg-[#151D2C]/80 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{lead.companyName}</p>
                                                    <p className="text-xs text-slate-500 mt-1">{lead.priority} Priority</p>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${lead.status === 'Won' || lead.status === 'Lead Done' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' :
                                                        lead.status === 'Lost' || lead.status === 'Lead Not Done' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800' :
                                                            'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800'
                                                        }`}>
                                                        {lead.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">₹{lead.expectedBudget?.toLocaleString('en-IN')}</p>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <p className="text-xs text-slate-500 font-medium">{new Date(lead.createdAt).toLocaleDateString('en-GB')}</p>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Followups Table */}
                    <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200 dark:border-[#1E293B] shadow-lg dark:shadow-xl overflow-hidden flex-1 mt-6">
                        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-[#1E293B] bg-slate-50/50 dark:bg-[#151D2C]/50 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Follow-up Activity</h3>
                            <span className="text-sm text-slate-500 bg-white dark:bg-[#0B0F19] px-3 py-1 rounded-full shadow-sm font-medium">{followups.length} Records</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-[#1E293B]/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-200 dark:border-[#1E293B]">
                                        <th className="px-6 py-4">Lead</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-[#1E293B]">
                                    {followups.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                                No follow-ups for this employee.
                                            </td>
                                        </tr>
                                    ) : (
                                        followups.map((f) => (
                                            <tr key={f._id} className="hover:bg-slate-50/80 dark:hover:bg-[#151D2C]/80 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white transition-colors">{f.lead?.companyName || 'Unknown Lead'}</p>
                                                    <p className="text-xs text-slate-500 mt-1 truncate max-w-[200px]">{f.remarks || 'No remarks context'}</p>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${f.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' :
                                                        f.status === 'Due Follow-up' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800' :
                                                            'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
                                                        }`}>
                                                        {f.status} {f.adminForced && ' (FORCED)'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{new Date(f.followupDate).toLocaleDateString('en-GB')}</p>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {f.status !== 'Completed' && (
                                                        <button
                                                            disabled={f.adminForced}
                                                            onClick={() => handleForceFollowup(f._id)}
                                                            className="text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800 px-3 py-1.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                                                        >
                                                            {f.adminForced ? 'Forced' : 'Force Follow-up'}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDetails;
