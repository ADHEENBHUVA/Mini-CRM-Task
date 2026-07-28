import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Link } from 'react-router-dom';
import { Users, Briefcase, CalendarClock, TrendingUp, CheckCircle, Clock, ChevronDown, Download, FileText, FileSpreadsheet, XCircle, Percent } from 'lucide-react';

const COLORS = ['#818CF8', '#34D399', '#FBBF24', '#A78BFA', '#F87171', '#94A3B8'];
const LOSS_COLOR = '#F87171'; // Red for loss
const WON_COLOR = '#34D399'; // Green for win

const Dashboard = () => {
    const user = JSON.parse(localStorage.getItem('user')) || null;
    const isAdmin = user && (user.role === 'Admin' || user.role === 'Master Admin');

    const [stats, setStats] = useState({
        totalLeads: 0, assignedLeads: 0, pendingLeads: 0, todaysLeads: 0,
        wonDeals: 0, lostDeals: 0,
        todaysFollowups: 0, completedFollowups: 0, pendingFollowups: 0, dueFollowups: 0,
        activeEmployees: 0, inactiveEmployees: 0,
        winRate: 0, lossRate: 0, conversionRate: 0,
        statusData: []
    });

    const [chartData, setChartData] = useState({
        wonLost: [],
        sources: [],
        rankings: []
    });

    const [filter, setFilter] = useState('Current Month');
    const [specificDate, setSpecificDate] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(true);
    const [reportMenuOpen, setReportMenuOpen] = useState(false);
    const [showFollowupPopup, setShowFollowupPopup] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const [statsRes, chartsRes] = await Promise.all([
                    axios.get(`http://localhost:5000/api/dashboard/stats?filter=${filter}&specificDate=${specificDate}&startDate=${startDate}&endDate=${endDate}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`http://localhost:5000/api/dashboard/charts?filter=${filter}&specificDate=${specificDate}&startDate=${startDate}&endDate=${endDate}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                if (statsRes.data.ok) {
                    setStats(statsRes.data.data);
                    if (statsRes.data.data.todaysFollowups > 0 && statsRes.data.data.dueFollowups > 0) {
                        setShowFollowupPopup(true);
                    }
                }

                if (chartsRes.data.ok) {
                    setChartData(chartsRes.data.data);
                }
            } catch (error) {
                console.error("Dashboard Engine Error", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [filter, specificDate, startDate, endDate]);

    const handleExport = async (type) => {
        setReportMenuOpen(false);
        // Using standard API endpoints we made in Phase 6
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get(`http://localhost:5000/api/reports/leads?filter=${filter}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const rawLeads = res.data.data || [];

            if (type === 'PDF') {
                const doc = new jsPDF();
                doc.setFillColor(30, 41, 59); // Slate 800
                doc.rect(0, 0, 210, 40, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(24);
                doc.setFont('helvetica', 'bold');
                doc.text('Premium CRM Analytics Report', 20, 25);

                doc.setTextColor(100, 116, 139);
                doc.setFontSize(14);
                doc.text(`Timeframe: ${filter}`, 20, 50);

                doc.setTextColor(99, 102, 241);
                doc.text(`Total Leads:`, 20, 70);
                doc.text(stats.totalLeads.toString(), 70, 70);

                doc.setTextColor(16, 185, 129);
                doc.text(`Win Rate:`, 20, 85);
                doc.text(`${stats.winRate}%`, 70, 85);

                doc.setTextColor(244, 63, 94);
                doc.text(`Missed Followups:`, 20, 100);
                doc.text(stats.dueFollowups.toString(), 70, 100);

                doc.save('CRM_Export.pdf');
                return;
            }

            let content = 'Company,Contact,Phone,Status,Result,Created At\n';
            rawLeads.forEach(l => {
                content += `"${l.companyName}","${l.contactPerson}","${l.phone}","${l.status}","${l.result}","${new Date(l.createdAt).toLocaleDateString()}"\n`;
            });

            const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `CRM_Export_${type}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (err) {
            console.error("Export generation failed", err);
        }
    };

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-500">
            {/* Header / Control Bar */}
            <div className="glass-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center relative z-20">
                <div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">Analytics Engine</h2>
                    <p className="text-slate-400 mt-2 font-medium">Monitoring {isAdmin ? 'global company performance' : 'your personal metrics'}.</p>
                </div>

                <div className="mt-4 md:mt-0 flex flex-wrap gap-4 relative">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="glass-input px-4 py-2 appearance-none pr-8 cursor-pointer text-slate-300 min-w-3xs"
                    >
                        <option value="Today">Today</option>
                        <option value="Yesterday">Yesterday</option>
                        <option value="Current Month">Current Month</option>
                        <option value="All Time">All Time</option>
                        <option value="Specific Date">Specific Date</option>
                        <option value="Custom Range">Custom Range</option>
                    </select>

                    {filter === 'Specific Date' && (
                        <input
                            type="date"
                            value={specificDate}
                            onChange={(e) => setSpecificDate(e.target.value)}
                            className="glass-input px-4 py-2 text-slate-300 placeholder-slate-500 min-w-3xs outline-none"
                        />
                    )}

                    {filter === 'Custom Range' && (
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="glass-input px-4 py-2 text-slate-300 outline-none"
                            />
                            <span className="text-slate-400 font-bold">To</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="glass-input px-4 py-2 text-slate-300 outline-none"
                            />
                        </div>
                    )}

                    <div className="relative">
                        <button
                            onClick={() => setReportMenuOpen(!reportMenuOpen)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600 text-slate-200 rounded-xl font-semibold transition-all duration-300"
                        >
                            Export Data <ChevronDown className={`w-4 h-4 transition-transform ${reportMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {reportMenuOpen && (
                            <div className="absolute top-full mt-2 w-48 right-0 bg-[#0F172A] border border-slate-700 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-50 animate-in zoom-in-95 duration-200">
                                <button onClick={() => handleExport('PDF')} className="flex items-center w-full gap-3 px-4 py-3 text-left hover:bg-slate-800 text-slate-300 transition-colors">
                                    <FileText className="w-4 h-4 text-rose-500" /> Export as PDF
                                </button>
                                <button onClick={() => handleExport('CSV')} className="flex items-center w-full gap-3 px-4 py-3 text-left hover:bg-slate-800 text-slate-300 transition-colors">
                                    <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Export raw CSV
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Premium Dynamic KPI Grid */}
            <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 transition-opacity duration-500 ${loading ? 'opacity-30' : 'opacity-100'}`}>

                {/* Leads Overview */}
                <div className="glass-card p-6 border-t-[3px] border-t-indigo-500 hover:-translate-y-1 group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-400 font-semibold mb-1">Total Leads Iterated</p>
                            <h3 className="text-4xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                                {loading ? '-' : stats.totalLeads}
                            </h3>
                            <p className="text-sm mt-3 text-slate-500 font-medium">
                                <span className="text-slate-300">{stats.todaysLeads}</span> acquired recently
                            </p>
                        </div>
                        <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/30">
                            <Users className="w-6 h-6 text-indigo-400" />
                        </div>
                    </div>
                </div>

                {/* Conversion Rate */}
                <div className="glass-card p-6 border-t-[3px] border-t-emerald-500 hover:-translate-y-1 group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-400 font-semibold mb-1">Win Conversion Rate</p>
                            <h3 className="text-4xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                                {loading ? '-' : stats.winRate}%
                            </h3>
                            <p className="text-sm mt-3 text-slate-500 font-medium">
                                <span className="text-emerald-400">{stats.wonDeals} Deals Won</span>
                            </p>
                        </div>
                        <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/30">
                            <Percent className="w-6 h-6 text-emerald-400" />
                        </div>
                    </div>
                </div>

                {/* Due / Missed Follow-ups */}
                <div className="glass-card p-6 border-t-[3px] border-t-rose-500 hover:-translate-y-1 group relative overflow-hidden">
                    {stats.dueFollowups > 0 && (
                        <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-rose-500/20 blur-2xl rounded-full animate-pulse" />
                    )}
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-400 font-semibold mb-1">Urgent Follow-ups</p>
                            <h3 className="text-4xl font-bold text-white group-hover:text-rose-400 transition-colors">
                                {loading ? '-' : stats.dueFollowups}
                            </h3>
                            <p className="text-sm mt-3 text-slate-500 font-medium">
                                <span className="text-amber-400">{stats.todaysFollowups} Due Today</span>
                            </p>
                        </div>
                        <div className="p-3 bg-rose-500/20 rounded-2xl border border-rose-500/30">
                            <Clock className="w-6 h-6 text-rose-400" />
                        </div>
                    </div>
                </div>

                {/* Completed Follow-ups OR Active Employees */}
                <div className="glass-card p-6 border-t-[3px] border-t-purple-500 hover:-translate-y-1 group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-400 font-semibold mb-1">{isAdmin ? 'Active Staff' : 'Completed Work'}</p>
                            <h3 className="text-4xl font-bold text-white group-hover:text-purple-400 transition-colors">
                                {loading ? '-' : (isAdmin ? stats.activeEmployees : stats.completedFollowups)}
                            </h3>
                            <p className="text-sm mt-3 text-slate-500 font-medium">
                                {isAdmin ? <span className="text-slate-400">{stats.inactiveEmployees} Inactive</span> : <span className="text-purple-400">Task Velocity</span>}
                            </p>
                        </div>
                        <div className="p-3 bg-purple-500/20 rounded-2xl border border-purple-500/30">
                            <Briefcase className="w-6 h-6 text-purple-400" />
                        </div>
                    </div>
                </div>

            </div>

            {/* Advanced Glass Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-2 relative z-0">
                {/* Won vs Lost */}
                <div className="glass-card p-6 flex flex-col min-h-[350px]">
                    <h3 className="text-lg font-bold text-slate-200 mb-4 px-2">Deal Closure Ratio</h3>
                    <div className="flex-1 w-full h-full min-h-[250px] flex items-center justify-center -ml-4">
                        {chartData.wonLost.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData.wonLost}
                                        cx="50%" cy="50%"
                                        innerRadius={70} outerRadius={90}
                                        paddingAngle={5} dataKey="value" stroke="none"
                                    >
                                        {chartData.wonLost.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.name === 'Lead Won' ? WON_COLOR : LOSS_COLOR} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-slate-500 italic">No closure data for this period.</p>
                        )}
                    </div>
                </div>

                {/* Status Distribution */}
                <div className="glass-card p-6 flex flex-col min-h-[350px]">
                    <h3 className="text-lg font-bold text-slate-200 mb-4 px-2">Lead Pipeline Status</h3>
                    <div className="flex-1 w-full h-full min-h-[250px]">
                        {stats.statusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.statusData} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} width={100} />
                                    <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }} />
                                    <Bar dataKey="value" fill="#818CF8" barSize={12} radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-slate-500 italic flex h-full items-center justify-center">Pipeline is empty.</p>
                        )}
                    </div>
                </div>

                {/* Employee Rankings (Admin only) or Source Chart */}
                {isAdmin ? (
                    <div className="glass-card p-6 flex flex-col min-h-[350px]">
                        <h3 className="text-lg font-bold text-slate-200 mb-4 px-2">Top Performers (Won Deals)</h3>
                        <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scroll">
                            {chartData.rankings.length > 0 ? chartData.rankings.map((emp, i) => (
                                <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs ring-1 ring-indigo-500/50">
                                            #{i + 1}
                                        </div>
                                        <span className="text-slate-300 font-medium">{emp.name}</span>
                                    </div>
                                    <span className="text-emerald-400 font-bold">{emp.value} Deals</span>
                                </div>
                            )) : (
                                <p className="text-slate-500 italic flex h-full items-center justify-center">No performace data yet.</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="glass-card p-6 flex flex-col min-h-[350px]">
                        <h3 className="text-lg font-bold text-slate-200 mb-4 px-2">Acquisition Sources</h3>
                        <div className="flex-1 w-full h-full min-h-[250px] flex items-center justify-center">
                            {chartData.sources.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData.sources} cx="50%" cy="50%"
                                            innerRadius={0} outerRadius={80} dataKey="value" stroke="#0F172A" strokeWidth={2}
                                        >
                                            {chartData.sources.map((entry, index) => (
                                                <Cell key={`cell2-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-slate-500 italic">No sources tracking yet.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Glass Follow-up Modal */}
            {showFollowupPopup && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[#0F172A]/90 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-700/50 max-w-sm w-full p-8 text-center animate-in zoom-in-95 duration-300 relative">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 to-amber-500 rounded-t-3xl" />
                        <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-rose-500/50">
                            <Clock className="w-8 h-8 text-rose-400 animate-pulse" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Attention Required</h3>
                        <p className="text-slate-400 mb-8 font-medium">
                            You have <span className="font-bold text-rose-400">{stats.dueFollowups}</span> follow-up(s) critically due and <span className="text-amber-400">{stats.todaysFollowups}</span> scheduled for today.
                        </p>
                        <div className="space-y-3">
                            <Link to="/leads?filter=followup" onClick={() => setShowFollowupPopup(false)} className="w-full flex justify-center py-3.5 px-4 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-rose-500/25">
                                Review immediately
                            </Link>
                            <button onClick={() => setShowFollowupPopup(false)} className="w-full flex justify-center py-3.5 px-4 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 rounded-xl font-semibold transition-all">
                                Acknowledge
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
