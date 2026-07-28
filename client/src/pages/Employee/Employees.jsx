import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { UserPlus, Search, Edit2, Trash2, Mail, ShieldAlert, Eye, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { confirmAction } from '../../utils/confirmAction';

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('Active'); // Active or Deleted

    useEffect(() => {
        fetchEmployees();
    }, [viewMode]);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            // Attempt to load from API
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/employees?viewDeleted=${viewMode === 'Deleted'}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEmployees(res.data);
        } catch (error) {
            console.error("Failed to fetch from DB", error);
            // Fallback mock data since the database is currently in Offline Mode
            setEmployees([
                { _id: '1', name: 'John Doe', email: 'john@nextbuy.com', role: 'Sales Rep', department: 'Sales', status: 'Active' },
                { _id: '2', name: 'Jane Smith', email: 'jane@nextbuy.com', role: 'Manager', department: 'Support', status: 'Active' },
                { _id: '3', name: 'Mike Ross', email: 'mike@nextbuy.com', role: 'Sales Rep', department: 'Sales', status: 'Inactive' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id) => {
        const confirmed = await confirmAction('Are you sure you want to delete this employee?');
        if (!confirmed) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/employees/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Employee deleted');
            fetchEmployees();
        } catch (error) {
            toast.error('Failed to delete employee');
        }
    };

    const handleRestore = async (id) => {
        const confirmed = await confirmAction('Are you sure you want to restore this employee?');
        if (!confirmed) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/employees/${id}/restore`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Employee restored');
            fetchEmployees();
        } catch (error) {
            toast.error('Failed to restore employee');
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/70 dark:bg-[#0B0F19]/60 backdrop-blur-md p-6 sm:px-8 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-slate-200 dark:border-[#1E293B] transition-colors">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">Staff Directory</h2>
                    <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1 sm:mt-2 font-medium">Manage corporate access and team roles.</p>
                </div>

                <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <select
                        value={viewMode}
                        onChange={(e) => setViewMode(e.target.value)}
                        className="w-full sm:w-48 bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    >
                        <option value="Active">Active Employees</option>
                        <option value="Deleted">Deleted Employees</option>
                    </select>

                    <Link to="/employees/new" className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-[0_4px_15px_rgba(79,70,229,0.3)] dark:shadow-[0_0_15px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 w-full sm:w-auto justify-center">
                        <UserPlus className="w-5 h-5" />
                        <span>Add Employee</span>
                    </Link>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] shadow-lg shadow-slate-200/50 dark:shadow-xl rounded-3xl overflow-hidden transition-colors">

                {/* Search / Filters Bar */}
                <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-[#1E293B] flex justify-between items-center bg-slate-50/50 dark:bg-[#151D2C]/50 transition-colors">
                    <div className="relative w-full max-w-sm group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-11 pr-4 py-2.5 border border-slate-200 dark:border-[#1E293B] rounded-xl leading-5 bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-all duration-300 shadow-sm dark:shadow-inner"
                        />
                    </div>
                </div>

                {/* Actual Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-[#1E293B]/50 text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-colors border-b border-slate-200 dark:border-[#1E293B]">
                                <th className="px-6 py-4">Employee Details</th>
                                <th className="px-6 py-4">Role & Dept</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-[#1E293B]">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                        Loading employees...
                                    </td>
                                </tr>
                            ) : filteredEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center">
                                        <ShieldAlert className="w-12 h-12 mb-3 opacity-20" />
                                        No employees found matching {searchTerm}
                                    </td>
                                </tr>
                            ) : (
                                filteredEmployees.map((emp) => (
                                    <tr key={emp._id} className="hover:bg-slate-50/80 dark:hover:bg-[#151D2C]/80 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 dark:from-indigo-500/30 dark:to-purple-500/30 flex items-center justify-center border border-indigo-200/50 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400 font-bold uppercase">
                                                    {emp.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{emp.name}</p>
                                                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-0.5 gap-1">
                                                        <Mail className="w-3 h-3" /> {emp.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{emp.role}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-500">{emp.department}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${emp.status === 'Active'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                                                : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20'
                                                }`}>
                                                {emp.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                                                <Link to={`/employees/${emp._id}`} className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all" title="View Details">
                                                    <Eye className="w-[18px] h-[18px]" strokeWidth={2.2} />
                                                </Link>
                                                {viewMode === 'Active' ? (
                                                    <>
                                                        <Link to={`/employees/${emp._id}/edit`} className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-all" title="Edit">
                                                            <Edit2 className="w-[18px] h-[18px]" strokeWidth={2.2} />
                                                        </Link>
                                                        <button onClick={() => handleDelete(emp._id)} className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all" title="Delete">
                                                            <Trash2 className="w-[18px] h-[18px]" strokeWidth={2.2} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button onClick={() => handleRestore(emp._id)} className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-all" title="Restore">
                                                        <RefreshCcw className="w-[18px] h-[18px]" strokeWidth={2.2} />
                                                    </button>
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

export default Employees;
