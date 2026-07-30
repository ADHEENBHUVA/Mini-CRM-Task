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
    const [remarks, setRemarks] = useState('');

    // Employee Assignment for Followups
    const [employees, setEmployees] = useState([]);
    const [empSearch, setEmpSearch] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [showEmpDropdown, setShowEmpDropdown] = useState(false);

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

            await axios.post(`http://localhost:5000/api/leads/${id}/followups`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFollowupDate('');
            setFollowupTime('');
            setNextFollowupDate('');
            setRemarks('');
            fetchLeadData();
        } catch (error) {
            console.error('Failed to schedule followup', error);
        }
    };

    const markFollowupComplete = async (fid) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:5000/api/leads/${id}/followups/${fid}/completed`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchLeadData();
        } catch (error) {
            console.error('Failed to complete followup', error);
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
                    <div className="bg-white dark:bg-[#0B0F19]/80 backdrop-blur-sm p-6 rounded-3xl border border-slate-200 dark:border-[#1E293B] shadow-lg shadow-slate-200/50 dark:shadow-xl transition-colors">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-indigo-500" /> Schedule Activity / Follow-up
                        </h3>
                        <form onSubmit={handleAddFollowup} className="flex flex-col gap-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase tracking-wider">Due Date</label>
                                    <input required type="date" value={followupDate} onChange={(e) => setFollowupDate(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0F1523] border border-slate-200 dark:border-[#2A374C] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase tracking-wider">Due Time</label>
                                    <input type="time" value={followupTime} onChange={(e) => setFollowupTime(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0F1523] border border-slate-200 dark:border-[#2A374C] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase tracking-wider">Next Date (Opt)</label>
                                    <input type="date" value={nextFollowupDate} onChange={(e) => setNextFollowupDate(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0F1523] border border-slate-200 dark:border-[#2A374C] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" />
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

                    {/* Timeline Block */}
                    <div className="bg-white dark:bg-[#0B0F19]/80 backdrop-blur-sm p-6 rounded-3xl border border-slate-200 dark:border-[#1E293B] shadow-lg shadow-slate-200/50 dark:shadow-xl transition-colors">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-indigo-500" /> Pending Objectives
                        </h3>
                        {followups.filter(f => f.status === 'Pending').length === 0 ? (
                            <p className="text-slate-500 dark:text-slate-400 text-sm italic">No pending follow-ups right now.</p>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {followups.map(f => f.status === 'Pending' && (
                                    <div key={f._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-500/5 group transition-colors">
                                        <div>
                                            <p className="font-bold text-indigo-900 dark:text-indigo-300">{f.remarks || 'Standard Lead Follow-up'}</p>
                                            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1 uppercase tracking-wider">{new Date(f.followupDate).toLocaleDateString('en-GB')} {f.followupTime && `- ${f.followupTime}`}</p>
                                        </div>
                                        <button onClick={() => markFollowupComplete(f._id)} className="mt-3 sm:mt-0 flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1E293B] text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 dark:hover:text-white border border-indigo-200 dark:border-indigo-500/30 rounded-lg text-sm font-bold transition-all shadow-sm">
                                            <CheckCircle className="w-4 h-4" /> Mark Done
                                        </button>
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
        </div>
    );
};

export default LeadDetails;
