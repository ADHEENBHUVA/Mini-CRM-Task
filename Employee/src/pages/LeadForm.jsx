import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Briefcase, User, Mail, Phone, Building, Users } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const LeadForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        source: 'Website',
        status: 'New',
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
    }, []);

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
            await axios.post('http://localhost:5000/api/leads', {
                contactPerson: formData.name,
                email: formData.email,
                phone: formData.phone,
                companyName: formData.company,
                leadSource: formData.source,
                status: formData.status,
                assignedEmployee: formData.assignedEmployee || undefined,
                expectedBudget: Number(formData.expectedBudget) || 1000
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Lead created safely!');
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
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create New Lead</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Fill in the details below to add a prospective client.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-[#0F1523] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-6 sm:p-10 shadow-lg shadow-slate-200/50 dark:shadow-xl transition-colors">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Basic Info Section */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-[#1E293B] pb-2">Client Details</h3>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-400" />
                                </div>
                                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#151D2C] border border-slate-200 dark:border-[#2A374C] rounded-xl text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-colors" placeholder="John Doe" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400" />
                                </div>
                                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#151D2C] border border-slate-200 dark:border-[#2A374C] rounded-xl text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-colors" placeholder="john@example.com" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-slate-400" />
                                </div>
                                <input required type="text" name="phone" value={formData.phone} onChange={handleChange} pattern="\d{10}" title="Phone number must be exactly 10 digits" maxLength="10" className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#151D2C] border border-slate-200 dark:border-[#2A374C] rounded-xl text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-colors" placeholder="10 Digits Only (e.g. 5550000000)" />
                            </div>
                        </div>
                    </div>

                    {/* Business Info Section */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-[#1E293B] pb-2">Business Details</h3>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Company Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Building className="h-5 w-5 text-slate-400" />
                                </div>
                                <input required type="text" name="company" value={formData.company} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#151D2C] border border-slate-200 dark:border-[#2A374C] rounded-xl text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-colors" placeholder="Acme Corp" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Expected Budget (₹)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-slate-400 font-bold">₹</span>
                                </div>
                                <input required type="number" name="expectedBudget" value={formData.expectedBudget} onChange={handleChange} className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-[#151D2C] border border-slate-200 dark:border-[#2A374C] rounded-xl text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-colors" placeholder="5000" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Lead Source</label>
                            <select name="source" value={formData.source} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-[#151D2C] border border-slate-200 dark:border-[#2A374C] rounded-xl text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-colors appearance-none">
                                <option>Website</option>
                                <option>Referral</option>
                                <option>Cold Call</option>
                                <option>Social Media</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Lead Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-[#151D2C] border border-slate-200 dark:border-[#2A374C] rounded-xl text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-colors appearance-none">
                                <option>New</option>
                                <option>Contacted</option>
                                <option>Qualified</option>
                                <option>Proposal Sent</option>
                            </select>
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Assign Employee</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Users className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 dropdown" />
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
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#151D2C] border border-slate-200 dark:border-[#2A374C] rounded-xl text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
                                    placeholder="Type to search employee..."
                                />
                            </div>

                            {showEmpDropdown && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowEmpDropdown(false)}></div>
                                    <div className="absolute z-20 w-full mt-2 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A374C] shadow-xl rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                                        <div
                                            className="px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-[#151D2C] text-slate-700 dark:text-slate-300 font-medium border-b border-slate-100 dark:border-[#2A374C]"
                                            onClick={() => { setFormData({ ...formData, assignedEmployee: '' }); setEmpSearch('-- Unassigned --'); setShowEmpDropdown(false); }}
                                        >
                                            -- Unassigned --
                                        </div>
                                        {employees.filter(e => e.name.toLowerCase().includes(empSearch.replace('-- Unassigned --', '').toLowerCase())).map(emp => (
                                            <div
                                                key={emp._id}
                                                className="px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-[#151D2C] text-slate-700 dark:text-slate-300 font-medium flex justify-between"
                                                onClick={() => {
                                                    setFormData({ ...formData, assignedEmployee: emp._id });
                                                    setEmpSearch(emp.name);
                                                    setShowEmpDropdown(false);
                                                }}
                                            >
                                                <span>{emp.name}</span>
                                                <span className="text-xs bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 px-2 py-1 rounded-md">{emp.role}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-[#1E293B]">
                    <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E293B] rounded-xl transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all shadow-[0_4px_15px_rgba(79,70,229,0.3)] dark:shadow-[0_0_15px_rgba(79,70,229,0.4)] flex items-center gap-2">
                        {loading ? 'Saving...' : <><Save className="w-4 h-4" /> Save Lead</>}
                    </button>
                </div>
            </form >
        </div >
    );
};

export default LeadForm;
