import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, UserPlus, Lock, Mail, Phone, Briefcase, Building, Save } from 'lucide-react';

const EmployeeForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // For edit mode, we might not require the password field to be populated unless they are changing it
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'Employee',
        department: 'Sales',
        password: '',
        status: 'Active'
    });

    useEffect(() => {
        if (isEditMode) {
            const fetchEmployee = async () => {
                setLoading(true);
                try {
                    const token = localStorage.getItem('token');
                    const res = await axios.get(`http://localhost:5000/api/employees/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    const emp = res.data.employee || res.data;
                    setFormData({
                        name: emp.name || '',
                        email: emp.email || '',
                        phone: emp.phone || '',
                        role: emp.role || 'Employee',
                        department: emp.department || 'Sales',
                        password: '', // default empty for editing
                        status: emp.status || 'Active'
                    });
                } catch (err) {
                    setError('Failed to fetch employee details');
                } finally {
                    setLoading(false);
                }
            };
            fetchEmployee();
        }
    }, [id, isEditMode]);

    const handleChange = (e) => {
        let value = e.target.value;
        if (e.target.name === 'phone') {
            value = value.replace(/\D/g, '').slice(0, 10);
        }
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // If editing and password is empty, don't send it so we don't accidentally blank it
        const payload = { ...formData };
        if (isEditMode && !payload.password) {
            delete payload.password;
        }

        try {
            const token = localStorage.getItem('token');
            if (isEditMode) {
                await axios.put(`http://localhost:5000/api/employees/${id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('http://localhost:5000/api/employees', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            navigate('/employees');
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to save employee');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 bg-white/70 dark:bg-[#0B0F19]/60 backdrop-blur-md p-6 sm:px-8 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-slate-200 dark:border-[#1E293B] transition-colors relative z-10">
                <Link to="/employees" className="p-2 border border-slate-200 dark:border-[#1E293B] rounded-xl hover:bg-slate-100 dark:hover:bg-[#151D2C] text-slate-500 dark:text-slate-400 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">
                        {isEditMode ? 'Edit Employee Details' : 'Create New Employee'}
                    </h2>
                    <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        {isEditMode ? 'Update existing staff directory information.' : 'Add a new staff member to the corporate directory.'}
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 px-6 py-4 rounded-2xl flex items-center gap-3">
                    <Lock className="w-5 h-5" />
                    <span className="font-medium">{error}</span>
                </div>
            )}

            {/* Premium Profile Banner for Edit Mode */}
            {isEditMode && formData.name && (
                <div className="bg-white/90 dark:bg-[#0B0F19]/90 backdrop-blur-md shadow-lg shadow-indigo-500/5 dark:shadow-[0_8px_30px_rgb(0,0,0,0.6)] border border-indigo-100 dark:border-indigo-500/20 rounded-3xl p-6 sm:p-8 flex items-center gap-6 transition-colors overflow-hidden relative">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-500/10 to-purple-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-1 shadow-lg shadow-indigo-500/30 shrink-0 z-10">
                        <div className="w-full h-full rounded-full bg-white dark:bg-[#0B0F19] flex items-center justify-center text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-purple-600 uppercase">
                            {formData.name.charAt(0)}
                        </div>
                    </div>
                    <div className="z-10">
                        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{formData.name}</h3>
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="text-xs sm:text-sm font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/20 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-500/30 uppercase tracking-wider">{formData.role}</span>
                            <span className={`text-xs sm:text-sm font-bold px-3 py-1.5 rounded-lg border uppercase tracking-wider transition-colors ${formData.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20'}`}>
                                {formData.status}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Form */}
            <div className="bg-white dark:bg-[#0B0F19]/80 backdrop-blur-sm shadow-xl shadow-slate-200/50 dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-6 sm:p-10 transition-colors relative z-10">
                <form onSubmit={handleSubmit} className="flex flex-col gap-8 w-full">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Name */}
                        <div className="flex flex-col gap-2 relative group">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Full Name</label>
                            <div className="relative w-full">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <UserPlus className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
                                </div>
                                <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="E.g. John Doe" className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-[#0F1523] border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium" />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex flex-col gap-2 relative group">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
                            <div className="relative w-full">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
                                </div>
                                <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@nextbuy.com" className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-[#0F1523] border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium" />
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="flex flex-col gap-2 relative group md:col-span-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Phone Number</label>
                            <div className="relative w-full">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
                                </div>
                                <input required type="text" name="phone" value={formData.phone} onChange={handleChange} pattern="\d{10}" title="Phone number must be exactly 10 digits" maxLength="10" placeholder="10 Digits Only (e.g. 5550000000)" className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-[#0F1523] border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium" />
                            </div>
                        </div>

                        {/* Role Select */}
                        <div className="flex flex-col gap-2 relative group">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Account Role</label>
                            <div className="relative w-full">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Briefcase className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
                                </div>
                                <select required name="role" value={formData.role} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-[#0F1523] border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium appearance-none">
                                    <option value="Employee">Employee</option>
                                </select>
                            </div>
                        </div>

                        {/* Department Select */}
                        <div className="flex flex-col gap-2 relative group">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Department</label>
                            <div className="relative w-full">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Building className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
                                </div>
                                <select required name="department" value={formData.department} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-[#0F1523] border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium appearance-none">
                                    <option value="Sales">Sales Department</option>
                                </select>
                            </div>
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-2 relative group md:col-span-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                                {isEditMode ? 'New Password (Leave blank to keep current)' : 'Initial Password'}
                            </label>
                            <div className="relative w-full">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
                                </div>
                                <input required={!isEditMode} type="password" name="password" value={formData.password} onChange={handleChange} minLength={formData.password ? "8" : ""} maxLength="16" pattern={formData.password ? "(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,16}" : undefined} title="Password must be 8-16 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character." placeholder={isEditMode ? "Enter to overwrite current password" : "Uppercase, Lowercase, Number & Special Char"} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-[#0F1523] border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium" />
                            </div>
                        </div>

                        {/* Status Toggle (only available in edit mode) */}
                        {isEditMode && (
                            <div className="flex flex-col gap-2 relative group md:col-span-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Account Lifecycle Status</label>
                                <div className="relative w-full">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <div className={`h-3 w-3 rounded-full transition-all duration-300 ${formData.status === 'Active' ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]' : 'bg-slate-400'}`}></div>
                                    </div>
                                    <select required name="status" value={formData.status} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-[#0F1523] border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-bold appearance-none">
                                        <option value="Active">Active - Full System Access</option>
                                        <option value="Inactive">Inactive - Revoked Access</option>
                                    </select>
                                </div>
                            </div>
                        )}

                    </div>

                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                        <button type="submit" disabled={loading} className="w-full md:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_4px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_8px_25px_rgba(79,70,229,0.4)] disabled:opacity-70 disabled:cursor-not-allowed">
                            <Save className="w-5 h-5" />
                            {loading ? 'Saving details...' : isEditMode ? 'Update Employee' : 'Save and Activate Account'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default EmployeeForm;
