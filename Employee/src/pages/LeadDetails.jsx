import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Clock, MessageSquare, Calendar, Building, User, Mail, Phone, CheckCircle, ChevronRight, Hash, Award, ThumbsDown } from 'lucide-react';

const LeadDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [lead, setLead] = useState(null);
    const [notes, setNotes] = useState([]);
    const [followups, setFollowups] = useState([]);
    const [winLossComment, setWinLossComment] = useState(null);
    const [loading, setLoading] = useState(true);

    const [noteInput, setNoteInput] = useState('');
    const [followupDate, setFollowupDate] = useState('');
    const [followupTime, setFollowupTime] = useState('');
    const [nextFollowupDate, setNextFollowupDate] = useState('');
    const [nextFollowupTime, setNextFollowupTime] = useState('');
    const [remarks, setRemarks] = useState('');

    // Employee Assignment for Followups
    const [employees, setEmployees] = useState([]);
    const [empSearch, setEmpSearch] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [showEmpDropdown, setShowEmpDropdown] = useState(false);
    const [discussionInputs, setDiscussionInputs] = useState({});

    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [notes]);

    const user = JSON.parse(localStorage.getItem('user')) || {};
    const isAdmin = user.role === 'Admin' || user.role === 'Master Admin' || user.role === 'Superadmin';

    useEffect(() => {
        fetchLeadData();
    }, [id]);

    const fetchLeadData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/leads/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLead(res.data.lead);
            setNotes(res.data.notes);
            setFollowups(res.data.followups);
            setWinLossComment(res.data.winLossComment);

            // Set default employee to assigned one
            if (res.data.lead.assignedEmployee) {
                setSelectedEmployee(res.data.lead.assignedEmployee._id);
                setEmpSearch(res.data.lead.assignedEmployee.name);
            }
        } catch (error) {
            console.error('Failed to fetch lead details', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) {
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
        }
    }, [isAdmin]);

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!noteInput.trim()) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/leads/${id}/notes`, { note: noteInput }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNoteInput('');
            fetchLeadData();
        } catch (error) {
            console.error('Failed to add note', error);
        }
    };

    const handleAddFollowup = async (e) => {
        e.preventDefault();
        if (!followupDate) return;
        try {
            const token = localStorage.getItem('token');
            const payload = { followupDate, remarks };
            if (followupTime) payload.followupTime = followupTime;
            if (isAdmin && selectedEmployee) {
                payload.employeeId = selectedEmployee;
            }
            if (nextFollowupDate) payload.nextFollowupDate = nextFollowupDate;
            if (nextFollowupTime) payload.nextFollowupTime = nextFollowupTime;

            await axios.post(`http://localhost:5000/api/leads/${id}/followups`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFollowupDate('');
            setFollowupTime('');
            setNextFollowupDate('');
            setNextFollowupTime('');
            setRemarks('');
            fetchLeadData();
        } catch (error) {
            console.error('Failed to schedule followup', error);
        }
    };

    const markFollowupComplete = async (fid) => {
        try {
            const token = localStorage.getItem('token');
            const payload = {};
            if (discussionInputs[fid]) {
                payload.customerResponse = discussionInputs[fid];
            }
            await axios.patch(`http://localhost:5000/api/leads/${id}/followups/${fid}/completed`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Clear input after completion
            setDiscussionInputs(prev => { const n = { ...prev }; delete n[fid]; return n; });
            fetchLeadData();
        } catch (error) {
            console.error('Failed to complete followup', error);
        }
    };

    const handleDeleteFollowup = async (fid) => {
        if (!window.confirm('Are you sure you want to delete this follow-up?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/followups/${fid}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchLeadData();
        } catch (error) {
            console.error('Failed to delete followup', error);
        }
    };

    if (loading) return <div className="p-10 font-bold text-center">Loading Lead Architecture...</div>;
    if (!lead) return <div className="p-10 font-bold text-center text-rose-500">Error: Lead Not Found</div>;

    const statusColors = {
        'New': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400',
        'Contacted': 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400',
        'Qualified': 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400',
        'Proposal Sent': 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-400',
        'Won': 'bg-green-500 text-white dark:bg-green-600',
        'Lost': 'bg-slate-200 text-slate-800 dark:bg-slate-600 dark:text-slate-300',
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
            {/* Header Toolbar */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-[#1E293B]">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/leads')} className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#1E293B] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#2A374C] transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-wider">{lead.companyName}</h2>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[lead.status]}`}>
                                {lead.status}
                            </span>
                            {lead.priority && (
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${lead.priority === 'High' ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400' :
                                    lead.priority === 'Medium' ? 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400' :
                                        'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400'
                                    }`}>
                                    {lead.priority}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                            <User className="w-4 h-4" /> {lead.contactPerson}  |  <Phone className="w-4 h-4" /> {lead.phone}  |  <Mail className="w-4 h-4" /> {lead.email}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Assigned To</p>
                    <p className="font-bold text-indigo-600 dark:text-indigo-400">{lead.assignedEmployee?.name || 'Unassigned'}</p>
                </div>
            </div>

            {lead.result !== 'Pending' && winLossComment && (
                <div className={`p-4 rounded-xl border ${lead.result === 'Lead Won' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300' : 'bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 text-rose-800 dark:text-rose-300'}`}>
                    <h4 className="font-bold flex items-center gap-2 mb-1">
                        {lead.result === 'Lead Won' ? <Award className="w-5 h-5" /> : <ThumbsDown className="w-5 h-5" />}
                        {lead.result === 'Lead Won' ? 'Lead Won Remarks' : 'Lead Lost Reason'}
                    </h4>
                    <p className="text-sm font-medium">{winLossComment.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Followups */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Schedule Followup Block */}
                    {(lead.result === 'Pending' && !['Lead Done', 'Lead Not Done', 'Won', 'Lost'].includes(lead.status)) && (
                        <div className="bg-white dark:bg-[#0B0F19]/80 backdrop-blur-sm p-6 rounded-3xl border border-slate-200 dark:border-[#1E293B] shadow-lg shadow-slate-200/50 dark:shadow-xl transition-colors">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-indigo-500" /> Schedule Activity / Follow-up
                            </h3>
                            <form onSubmit={handleAddFollowup} className="flex flex-col gap-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase tracking-wider">Follow-up Date</label>
                                        <input required type="date" value={followupDate} onChange={(e) => setFollowupDate(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0F1523] border border-slate-200 dark:border-[#2A374C] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase tracking-wider">Follow-up Time</label>
                                        <input type="time" value={followupTime} onChange={(e) => setFollowupTime(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0F1523] border border-slate-200 dark:border-[#2A374C] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase tracking-wider">Next Follow-up Date (Opt)</label>
                                        <input type="date" value={nextFollowupDate} onChange={(e) => setNextFollowupDate(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0F1523] border border-slate-200 dark:border-[#2A374C] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase tracking-wider">Next Time (Opt)</label>
                                        <input type="time" value={nextFollowupTime} onChange={(e) => setNextFollowupTime(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0F1523] border border-slate-200 dark:border-[#2A374C] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" />
                                    </div>

                                    {isAdmin && (
                                        <div className="relative">
                                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase tracking-wider">Assign Employee</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <User className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={empSearch}
                                                    onChange={(e) => {
                                                        setEmpSearch(e.target.value);
                                                        if (selectedEmployee) setSelectedEmployee('');
                                                        setShowEmpDropdown(true);
                                                    }}
                                                    onFocus={() => setShowEmpDropdown(true)}
                                                    onBlur={() => setTimeout(() => setShowEmpDropdown(false), 200)}
                                                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-[#0F1523] border border-slate-200 dark:border-[#2A374C] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-colors text-sm"
                                                    placeholder="Search..."
                                                />
                                            </div>
                                            {showEmpDropdown && (
                                                <div className="absolute z-20 w-full mt-2 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A374C] shadow-xl rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                                                    {employees.filter(e => e.name.toLowerCase().includes(empSearch.toLowerCase())).map(emp => (
                                                        <div
                                                            key={emp._id}
                                                            className="px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-[#151D2C] text-slate-700 dark:text-slate-300 font-medium flex justify-between text-sm transition-colors"
                                                            onClick={() => {
                                                                setSelectedEmployee(emp._id);
                                                                setEmpSearch(emp.name);
                                                                setShowEmpDropdown(false);
                                                            }}
                                                        >
                                                            <span>{emp.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase tracking-wider">Objective / Remarks</label>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <input type="text" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="E.g. Call to discuss proposal..." className="flex-1 px-4 py-3 bg-slate-50 dark:bg-[#0F1523] border border-slate-200 dark:border-[#2A374C] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" />
                                        <button type="submit" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold tracking-wide shadow-[0_4px_15px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)] transition-all flex items-center justify-center shrink-0">
                                            Schedule Activity
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Timeline Block */}
                    <div className="bg-white dark:bg-[#0B0F19]/80 backdrop-blur-sm p-6 rounded-3xl border border-slate-200 dark:border-[#1E293B] shadow-lg shadow-slate-200/50 dark:shadow-xl transition-colors">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-indigo-500" /> Pending Objectives
                        </h3>
                        {followups.filter(f => f.status === 'Pending').length === 0 ? (
                            <p className="text-slate-500 dark:text-slate-400 text-sm italic">No pending follow-ups right now.</p>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {followups.map(f => {
                                    if (f.status !== 'Pending') return null;

                                    let isPastDue = false;
                                    if (f.followupDate) {
                                        const now = new Date();
                                        const [year, month, day] = f.followupDate.split('T')[0].split('-');
                                        const [hour, minute] = f.followupTime ? f.followupTime.split(':') : ['23', '59'];
                                        const due = new Date(year, month - 1, day, hour, minute);
                                        isPastDue = now > due;
                                    }

                                    return (
                                        <div key={f._id} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-2xl border group transition-colors ${isPastDue
                                            ? 'border-rose-200 dark:border-rose-500/30 bg-rose-50/50 dark:bg-rose-500/5'
                                            : 'border-indigo-100 dark:border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-500/5'
                                            }`}>
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className={`font-bold ${isPastDue ? 'text-rose-900 dark:text-rose-300' : 'text-indigo-900 dark:text-indigo-300'}`}>
                                                        {f.remarks || 'Standard Lead Follow-up'}
                                                    </p>
                                                    {isPastDue && (
                                                        <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-md">
                                                            Past Due
                                                        </span>
                                                    )}
                                                </div>
                                                <p className={`text-xs font-semibold mt-1 uppercase tracking-wider ${isPastDue ? 'text-rose-600 dark:text-rose-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                                    Follow-up: {new Date(f.followupDate).toLocaleDateString('en-GB')} {f.followupTime && `- ${f.followupTime}`}
                                                    {f.nextFollowupDate && (
                                                        <span className="block mt-0.5 text-[10px] text-slate-500 dark:text-slate-400 normal-case">
                                                            Next: {new Date(f.nextFollowupDate).toLocaleDateString('en-GB')} {f.nextFollowupTime && `- ${f.nextFollowupTime}`}
                                                        </span>
                                                    )}
                                                </p>
                                                <div className="mt-3 relative w-full sm:w-[400px]">
                                                    <textarea
                                                        rows="2"
                                                        value={discussionInputs[f._id] || ''}
                                                        onChange={(e) => setDiscussionInputs({ ...discussionInputs, [f._id]: e.target.value })}
                                                        placeholder="Write discussion notes here..."
                                                        className={`w-full px-3 py-2 text-sm rounded-xl outline-none border transition-colors ${isPastDue
                                                            ? 'bg-rose-50/50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-500/30 text-rose-900 dark:text-rose-100 placeholder:text-rose-400/60 focus:ring-1 focus:ring-rose-500'
                                                            : 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-900 dark:text-indigo-100 placeholder:text-indigo-400/60 focus:ring-1 focus:ring-indigo-500'
                                                            }`}
                                                    ></textarea>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 mt-4 sm:mt-0 w-full sm:w-auto">
                                                <div className="flex items-center gap-2 w-full">
                                                    {user.role === 'Master Admin' && (
                                                        <button onClick={() => handleDeleteFollowup(f._id)} title="Delete Follow-up" className="flex items-center justify-center p-3 sm:p-2 text-rose-500 hover:text-white hover:bg-rose-500 rounded-xl transition-colors border border-transparent hover:border-rose-600">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button onClick={() => markFollowupComplete(f._id)} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 sm:px-4 sm:py-2 text-sm font-bold rounded-xl transition-all shadow-sm ${isPastDue
                                                        ? 'bg-rose-600 text-white hover:bg-rose-500 dark:hover:bg-rose-500/90'
                                                        : 'bg-indigo-600 text-white hover:bg-indigo-500 dark:hover:bg-indigo-500/90'
                                                        }`}>
                                                        <CheckCircle className="w-4 h-4" /> Save & Done
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Completed Follow-ups History Block */}
                    <div className="bg-white dark:bg-[#0B0F19]/80 backdrop-blur-sm p-6 rounded-3xl border border-slate-200 dark:border-[#1E293B] shadow-lg shadow-slate-200/50 dark:shadow-xl transition-colors">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-emerald-500" /> Completed Follow-ups
                        </h3>
                        {followups.filter(f => f.status === 'Completed').length === 0 ? (
                            <p className="text-slate-500 dark:text-slate-400 text-sm italic">No completed follow-ups yet.</p>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {followups.filter(f => f.status === 'Completed').map(f => (
                                    <div key={f._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-500/5 opacity-80 hover:opacity-100 transition-opacity">
                                        <div className="w-full">
                                            <p className="font-bold text-emerald-900 dark:text-emerald-300 flex flex-wrap items-center gap-2">
                                                {f.remarks || 'Standard Lead Follow-up'}
                                                <span className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 shrink-0">
                                                    <CheckCircle className="w-3.5 h-3.5" /> Done
                                                </span>
                                            </p>
                                            <p className="text-xs font-semibold mt-1 uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                                {new Date(f.followupDate).toLocaleDateString('en-GB')} {f.followupTime && `- ${f.followupTime}`}
                                            </p>
                                            {f.customerResponse && (
                                                <div className="mt-4 p-3 bg-white/60 dark:bg-[#1E293B]/60 rounded-xl border border-emerald-100 dark:border-emerald-500/20 text-sm text-emerald-900 dark:text-emerald-100 shadow-sm relative">
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400/50 dark:bg-emerald-500/50 rounded-l-xl"></div>
                                                    <span className="font-extrabold text-emerald-700 dark:text-emerald-400 block mb-1 text-xs uppercase tracking-wider">Discussion Notes:</span>
                                                    {f.customerResponse}
                                                </div>
                                            )}
                                        </div>
                                        {user.role === 'Master Admin' && (
                                            <button onClick={() => handleDeleteFollowup(f._id)} title="Delete Completed Follow-up" className="mt-3 sm:mt-0 flex items-center justify-center p-2 text-slate-400 hover:text-white hover:bg-rose-500 rounded-xl transition-colors border border-transparent hover:border-rose-600 shrink-0">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Internal Notes */}
                <div className="bg-white dark:bg-[#0B0F19]/80 backdrop-blur-sm p-6 rounded-3xl border border-slate-200 dark:border-[#1E293B] shadow-lg shadow-slate-200/50 dark:shadow-xl flex flex-col h-[600px] transition-colors relative overflow-hidden">
                    {/* Subtle aesthetic background flare */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 shrink-0">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg">
                            <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        Internal Notes
                    </h3>

                    <div className="flex-1 overflow-y-auto mb-4 border-t border-slate-100 dark:border-[#1E293B] pt-6 pb-2 pr-4 flex flex-col space-y-5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                        {notes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full opacity-50">
                                <MessageSquare className="w-10 h-10 text-slate-400 mb-3" />
                                <p className="text-slate-500 text-sm font-semibold">No notes found for this lead.</p>
                            </div>
                        ) : (
                            notes.map(note => {
                                const isMe = note.createdBy?.role !== 'Employee' && note.createdBy?.role !== 'Standard';
                                return (
                                    <div key={note._id} className={`max-w-[85%] p-4 transition-all shadow-sm group ${isMe ? 'self-end bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl rounded-br-sm shadow-indigo-500/20' : 'self-start bg-slate-50 dark:bg-[#151D2C] border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl rounded-bl-sm'}`}>
                                        <p className="text-sm leading-relaxed font-medium">{note.note}</p>
                                        <div className={`mt-2 flex justify-between items-center text-[10px] uppercase font-bold tracking-wider ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                                            <span>
                                                {note.createdBy?.role === 'Employee' || note.createdBy?.role === 'Standard' ? 'Employee Note' : 'Admin Note'}
                                            </span>
                                            <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-4">{new Date(note.createdAt).toLocaleDateString('en-GB')} {new Date(note.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleAddNote} className="shrink-0 flex items-center gap-3 bg-slate-50 dark:bg-[#0F1523] p-2 rounded-2xl border border-slate-200 dark:border-[#2A374C] focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
                        <div className="flex-1 pl-3">
                            <input type="text" value={noteInput} onChange={(e) => setNoteInput(e.target.value)} placeholder="Type a quick update..." className="w-full bg-transparent text-slate-900 dark:text-white outline-none text-sm font-medium placeholder:text-slate-400" />
                        </div>
                        <button type="submit" disabled={!noteInput.trim()} className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-[0_4px_15px_rgba(79,70,229,0.3)] disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center shrink-0">
                            <Hash className="w-5 h-5" />
                        </button>
                    </form>
                </div>

            </div>
        </div >
    );
};

export default LeadDetails;
