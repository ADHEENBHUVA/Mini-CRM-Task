import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Clock, MessageSquare, Calendar, Building, User, Mail, Phone, CheckCircle, ChevronRight, Hash, Award, ThumbsDown, X } from 'lucide-react';

const LeadDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [lead, setLead] = useState(null);
    const [notes, setNotes] = useState([]);
    const [followups, setFollowups] = useState([]);
    const [loading, setLoading] = useState(true);

    const [noteInput, setNoteInput] = useState('');
    const [followupDate, setFollowupDate] = useState('');
    const [remarks, setRemarks] = useState('');

    const [showResultModal, setShowResultModal] = useState(false);
    const [resultType, setResultType] = useState(''); // 'Lead Won' or 'Lead Loss'
    const [resultComment, setResultComment] = useState('');

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
        } catch (error) {
            console.error('Failed to fetch lead details', error);
        } finally {
            setLoading(false);
        }
    };

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
            await axios.post(`http://localhost:5000/api/leads/${id}/followups`, { followupDate, remarks }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFollowupDate('');
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

    const handleResultSubmit = async (e) => {
        e.preventDefault();
        // Comment mandatory for Loss
        if (resultType === 'Lead Loss' && !resultComment.trim()) return;

        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:5000/api/leads/${id}/result`, {
                result: resultType,
                comment: resultComment
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowResultModal(false);
            setResultComment('');
            fetchLeadData();
        } catch (error) {
            console.error('Failed to update lead result', error);
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
                    {lead.result === 'Pending' && (
                        <div className="flex gap-2 mt-3">
                            <button onClick={() => { setResultType('Lead Won'); setShowResultModal(true); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-lg transition-colors shadow-sm">
                                <Award className="w-4 h-4" /> Lead Done
                            </button>
                            <button onClick={() => { setResultType('Lead Loss'); setShowResultModal(true); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold rounded-lg transition-colors shadow-sm">
                                <ThumbsDown className="w-4 h-4" /> Not Done
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Followups */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Schedule Followup Block */}
                    <div className="bg-white dark:bg-[#0B0F19]/80 backdrop-blur-sm p-6 rounded-3xl border border-slate-200 dark:border-[#1E293B] shadow-lg shadow-slate-200/50 dark:shadow-xl transition-colors">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-indigo-500" /> Schedule Activity / Follow-up
                        </h3>
                        <form onSubmit={handleAddFollowup} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-1">
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase">Date</label>
                                <input required type="datetime-local" value={followupDate} onChange={(e) => setFollowupDate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0F1523] border border-slate-200 dark:border-[#2A374C] rounded-xl text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase">Objective / Remarks</label>
                                <div className="flex gap-2">
                                    <input type="text" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="E.g. Call to discuss proposal..." className="flex-1 px-4 py-3 bg-slate-50 dark:bg-[#0F1523] border border-slate-200 dark:border-[#2A374C] rounded-xl text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none" />
                                    <button type="submit" className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-[0_4px_15px_rgba(79,70,229,0.3)] transition-all flex items-center justify-center shrink-0">
                                        Schedule
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
                                            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1 uppercase tracking-wider">{new Date(f.followupDate).toLocaleString()}</p>
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
                <div className="bg-white dark:bg-[#0B0F19]/80 backdrop-blur-sm p-6 rounded-3xl border border-slate-200 dark:border-[#1E293B] shadow-lg shadow-slate-200/50 dark:shadow-xl flex flex-col h-[600px] transition-colors">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 shrink-0">
                        <MessageSquare className="w-5 h-5 text-amber-500" /> Internal Notes
                    </h3>

                    <div className="flex-1 overflow-y-auto mb-4 border-y border-slate-100 dark:border-[#1E293B] py-4 pr-2 space-y-4">
                        {notes.length === 0 ? (
                            <p className="text-slate-400 text-sm italic text-center mt-10">No notes found for this lead.</p>
                        ) : (
                            notes.map(note => (
                                <div key={note._id} className="bg-slate-50 dark:bg-[#151D2C] p-4 rounded-2xl border border-slate-200 dark:border-[#2A374C]">
                                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{note.note}</p>
                                    <div className="mt-3 flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-900 dark:text-white">Admin Note</span>
                                        <span className="text-slate-400 uppercase tracking-widest text-[10px]">{new Date(note.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <form onSubmit={handleAddNote} className="shrink-0 flex gap-2">
                        <input type="text" value={noteInput} onChange={(e) => setNoteInput(e.target.value)} placeholder="Log a quick update..." className="flex-1 px-4 py-3 bg-slate-50 dark:bg-[#0F1523] border border-slate-200 dark:border-[#2A374C] rounded-xl text-slate-900 dark:text-white focus:ring-1 focus:ring-amber-500 outline-none text-sm font-medium" />
                        <button type="submit" disabled={!noteInput.trim()} className="p-3 bg-amber-500 hover:bg-amber-400 text-white rounded-xl shadow-[0_4px_15px_rgba(245,158,11,0.3)] disabled:opacity-50 transition-all flex items-center justify-center shrink-0">
                            <Hash className="w-5 h-5" />
                        </button>
                    </form>
                </div>

            </div>

            {/* Result Modal */}
            {showResultModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#0F172A] w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-[#1E293B] overflow-hidden">
                        <div className="p-4 border-b border-slate-100 dark:border-[#1E293B] flex justify-between items-center bg-slate-50 dark:bg-[#151D2C]">
                            <h3 className="font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                                {resultType === 'Lead Won' ? <Award className="w-5 h-5 text-emerald-500" /> : <ThumbsDown className="w-5 h-5 text-rose-500" />}
                                {resultType === 'Lead Won' ? 'Mark Lead as Done (Won)' : 'Mark Lead as Not Done (Lost)'}
                            </h3>
                            <button onClick={() => setShowResultModal(false)} className="text-slate-400 hover:text-slate-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleResultSubmit} className="p-5 flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Reason / Comments {resultType === 'Lead Loss' && <span className="text-rose-500">*</span>}
                                </label>
                                <textarea
                                    value={resultComment}
                                    onChange={(e) => setResultComment(e.target.value)}
                                    placeholder={resultType === 'Lead Loss' ? "Explain why this lead was lost..." : "Any closing remarks? (Optional)"}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#2A374C] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none h-24"
                                    required={resultType === 'Lead Loss'}
                                ></textarea>
                            </div>
                            <div className="flex justify-end gap-3 mt-2">
                                <button type="button" onClick={() => setShowResultModal(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-[#1E293B] rounded-lg font-semibold transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={resultType === 'Lead Loss' && !resultComment.trim()} className={`px-5 py-2 text-white font-bold rounded-lg transition-colors shadow-sm ${resultType === 'Lead Won' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30' : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30'}`}>
                                    Confirm {resultType === 'Lead Won' ? 'Win' : 'Loss'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeadDetails;
