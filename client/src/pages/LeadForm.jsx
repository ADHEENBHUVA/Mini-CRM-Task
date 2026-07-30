import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Briefcase, User, Mail, Phone, Building, Users } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const LeadForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        source: 'Website',
        status: 'New',
        priority: 'Medium',
        expectedBudget: '',
        assignedEmployee: ''
    });
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [empSearch, setEmpSearch] = useState('');
    const [showEmpDropdown, setShowEmpDropdown] = useState(false);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/employees', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setEmployees(res.data);
            } catch (err) {
                console.error('Failed to fetch employees', err);
            }
        };
        fetchEmployees();

        if (isEditMode) {
            const fetchLead = async () => {
                setLoading(true);
                try {
                    const token = localStorage.getItem('token');
                    const res = await axios.get(`http://localhost:5000/api/leads/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const lead = res.data.lead;
                    setFormData({
                        name: lead.contactPerson || '',
                        email: lead.email || '',
                        phone: lead.phone || '',
                        company: lead.companyName || '',
                        source: lead.leadSource || 'Website',
                        status: lead.status || 'New',
                        priority: lead.priority || 'Medium',
                        expectedBudget: lead.expectedBudget || '',
                        assignedEmployee: lead.assignedEmployee ? (lead.assignedEmployee._id || lead.assignedEmployee) : ''
                    });
                    if (lead.assignedEmployee && lead.assignedEmployee.name) {
                        setEmpSearch(lead.assignedEmployee.name);
                    }
                } catch (error) {
                    toast.error('Failed to load lead details');
                } finally {
                    setLoading(false);
                }
            };
            fetchLead();
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
        try {
            const token = localStorage.getItem('token');
            const data = {
                contactPerson: formData.name,
                email: formData.email,
                phone: formData.phone,
                companyName: formData.company,
                leadSource: formData.source,
                status: formData.status,
                priority: formData.priority,
                assignedEmployee: formData.assignedEmployee || undefined,
                expectedBudget: Number(formData.expectedBudget) || 1000
            };

            if (isEditMode) {
                await axios.put(`http://localhost:5000/api/leads/${id}`, data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Lead updated securely!');
            } else {
                await axios.post('http://localhost:5000/api/leads', data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Lead created safely!');
            }
            navigate('/leads');
        } catch (error) {
            console.error('Error creating lead', error);
            toast.error(`Failed API Error: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto flex flex-col gap-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-[#1E293B]">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#1E293B] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#2A374C] transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{isEditMode ? 'Edit Lead Details' : 'Create New Lead'}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{isEditMode ? 'Update existing lead lifecycle parameters.' : 'Fill in the details below to add a prospective client.'}</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-[#1E293B] rounded-[2rem] p-6 sm:p-10 shadow-xl shadow-slate-200/50 dark:shadow-[0_10px_50px_rgba(0,0,0,0.5)] transition-colors relative overflow-hidden">
                {/* Decorative Background Blob */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 relative z-10">
                    {/* Basic Info Section */}
                    <div className="space-y-6 bg-slate-50/50 dark:bg-[#0F1523]/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/60">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl">
                                <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-extrabold text-slate-800 dark:text-white">Client Details</h3>
                        </div>

                        <div className="group">
                            <label className="block text-[13px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-2 ml-1">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-[#151D2C] border-2 border-transparent ring-1 ring-slate-200 dark:ring-[#2A374C] rounded-2xl text-slate-900 dark:text-white focus:ring-transparent focus:border-indigo-500 outline-none transition-all shadow-sm hover:ring-indigo-200 dark:hover:ring-indigo-500/30" placeholder="John Doe" />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-[13px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-2 ml-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-[#151D2C] border-2 border-transparent ring-1 ring-slate-200 dark:ring-[#2A374C] rounded-2xl text-slate-900 dark:text-white focus:ring-transparent focus:border-indigo-500 outline-none transition-all shadow-sm hover:ring-indigo-200 dark:hover:ring-indigo-500/30" placeholder="john@example.com" />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-[13px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-2 ml-1">Phone Number</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <input required type="text" name="phone" value={formData.phone} onChange={handleChange} pattern="\d{10}" title="Phone number must be exactly 10 digits" maxLength="10" className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-[#151D2C] border-2 border-transparent ring-1 ring-slate-200 dark:ring-[#2A374C] rounded-2xl text-slate-900 dark:text-white focus:ring-transparent focus:border-indigo-500 outline-none transition-all shadow-sm hover:ring-indigo-200 dark:hover:ring-indigo-500/30" placeholder="10 Digits (e.g. 5550000000)" />
                            </div>
                        </div>
                    </div>

                    {/* Business Info Section */}
                    <div className="space-y-6 bg-slate-50/50 dark:bg-[#0F1523]/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/60">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 bg-blue-100 dark:bg-blue-500/20 rounded-xl">
                                <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-xl font-extrabold text-slate-800 dark:text-white">Business Details</h3>
                        </div>

                        <div className="group">
                            <label className="block text-[13px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-2 ml-1">Company Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Briefcase className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input required type="text" name="company" value={formData.company} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-[#151D2C] border-2 border-transparent ring-1 ring-slate-200 dark:ring-[#2A374C] rounded-2xl text-slate-900 dark:text-white focus:ring-transparent focus:border-blue-500 outline-none transition-all shadow-sm hover:ring-blue-200 dark:hover:ring-blue-500/30" placeholder="Acme Corp" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="group">
                                <label className="block text-[13px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-2 ml-1">Budget (₹)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-slate-400 font-extrabold group-focus-within:text-blue-500 transition-colors">₹</span>
                                    </div>
                                    <input required type="number" name="expectedBudget" value={formData.expectedBudget} onChange={handleChange} className="w-full pl-9 pr-4 py-3.5 bg-white dark:bg-[#151D2C] border-2 border-transparent ring-1 ring-slate-200 dark:ring-[#2A374C] rounded-2xl text-slate-900 dark:text-white focus:ring-transparent focus:border-blue-500 outline-none transition-all shadow-sm hover:ring-blue-200 dark:hover:ring-blue-500/30 font-semibold" placeholder="5000" />
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-[13px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-2 ml-1">Source</label>
                                <div className="relative">
                                    <select name="source" value={formData.source} onChange={handleChange} className="w-full pl-4 pr-10 py-3.5 bg-white dark:bg-[#151D2C] border-2 border-transparent ring-1 ring-slate-200 dark:ring-[#2A374C] rounded-2xl text-slate-900 dark:text-white focus:ring-transparent focus:border-blue-500 outline-none transition-all shadow-sm hover:ring-blue-200 dark:hover:ring-blue-500/30 font-semibold appearance-none">
                                        <option>Website</option>
                                        <option>Referral</option>
                                        <option>Cold Call</option>
                                        <option>Social Media</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="group">
                                <label className="block text-[13px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-2 ml-1">Status</label>
                                <div className="relative">
                                    <select name="status" value={formData.status} onChange={handleChange} className="w-full pl-4 pr-10 py-3.5 bg-white dark:bg-[#151D2C] border-2 border-transparent ring-1 ring-slate-200 dark:ring-[#2A374C] rounded-2xl text-slate-900 dark:text-white focus:ring-transparent focus:border-blue-500 outline-none transition-all shadow-sm hover:ring-blue-200 dark:hover:ring-blue-500/30 font-semibold appearance-none">
                                        <option>New</option>
                                        <option>Contacted</option>
                                        <option>Qualified</option>
                                        <option>Proposal Sent</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-[13px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-2 ml-1">Priority</label>
                                <div className="relative">
                                    <select name="priority" value={formData.priority} onChange={handleChange} className="w-full pl-4 pr-10 py-3.5 bg-white dark:bg-[#151D2C] border-2 border-transparent ring-1 ring-slate-200 dark:ring-[#2A374C] rounded-2xl text-slate-900 dark:text-white focus:ring-transparent focus:border-blue-500 outline-none transition-all shadow-sm hover:ring-blue-200 dark:hover:ring-blue-500/30 font-semibold appearance-none">
                                        <option value="High">High 🔴</option>
                                        <option value="Medium">Medium 🟡</option>
                                        <option value="Low">Low 🟢</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-20 group">
                            <label className="block text-[13px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-2 ml-1">Assign Employee</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Users className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    value={empSearch}
                                    onChange={(e) => {
                                        setEmpSearch(e.target.value);
                                        if (formData.assignedEmployee) setFormData({ ...formData, assignedEmployee: '' });
                                        setShowEmpDropdown(true);
                                    }}
                                    onFocus={() => setShowEmpDropdown(true)}
                                    className="w-full pl-12 pr-10 py-3.5 bg-white dark:bg-[#151D2C] border-2 border-transparent ring-1 ring-slate-200 dark:ring-[#2A374C] rounded-2xl text-slate-900 dark:text-white focus:ring-transparent focus:border-blue-500 outline-none transition-all shadow-sm hover:ring-blue-200 dark:hover:ring-blue-500/30 placeholder:font-normal font-semibold"
                                    placeholder="Type to search employee..."
                                />
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>

                            {showEmpDropdown && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowEmpDropdown(false)}></div>
                                    <div className="absolute z-20 w-full mt-2 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A374C] shadow-2xl rounded-2xl overflow-hidden max-h-48 overflow-y-auto">
                                        <div
                                            className="px-5 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-[#151D2C] text-slate-700 dark:text-slate-300 font-medium border-b border-slate-100 dark:border-[#2A374C] transition-colors"
                                            onClick={() => { setFormData({ ...formData, assignedEmployee: '' }); setEmpSearch('-- Unassigned --'); setShowEmpDropdown(false); }}
                                        >
                                            -- Unassigned --
                                        </div>
                                        {employees.filter(e => e.name.toLowerCase().includes(empSearch.replace('-- Unassigned --', '').toLowerCase())).map(emp => (
                                            <div
                                                key={emp._id}
                                                className="px-5 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-[#151D2C] text-slate-700 dark:text-slate-300 font-medium flex justify-between items-center transition-colors"
                                                onClick={() => {
                                                    setFormData({ ...formData, assignedEmployee: emp._id });
                                                    setEmpSearch(emp.name);
                                                    setShowEmpDropdown(false);
                                                }}
                                            >
                                                <span>{emp.name}</span>
                                                <span className="text-[10px] uppercase font-bold tracking-wider bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 px-2 py-1 rounded-md">{emp.role}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex justify-end gap-4 pt-6 border-t border-slate-200 dark:border-[#1E293B] relative z-10">
                    <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E293B] rounded-2xl transition-all">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-2xl font-bold transition-all shadow-[0_8px_20px_rgba(79,70,229,0.3)] dark:shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 flex items-center gap-2">
                        {loading ? 'Saving Layout...' : <><Save className="w-5 h-5" /> Save Lead Instance</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LeadForm;
