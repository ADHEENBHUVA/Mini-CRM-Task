import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Link } from 'react-router-dom';
import { Users, Briefcase, CalendarClock, TrendingUp, CheckCircle, Clock, ChevronDown, Download, FileText, FileSpreadsheet } from 'lucide-react';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#64748B'];

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalLeads: 0,
        todaysFollowups: 0,
        wonDeals: 0,
        pendingLeads: 0,
        statusData: [],
        monthlyData: []
    });
    const [loading, setLoading] = useState(true);
    const [reportMenuOpen, setReportMenuOpen] = useState(false);
    const [showFollowupPopup, setShowFollowupPopup] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const res = await axios.get('http://localhost:5000/api/dashboard/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.data.ok) {
                    setStats(res.data.data);
                    if (res.data.data.todaysFollowups > 0) {
                        setShowFollowupPopup(true);
                    }
                }
            } catch (error) {
                console.error("Dashboard DB Offline - using zero fallbacks.");
                // DB is offline, stats remain 0
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleExport = (type) => {
        setReportMenuOpen(false);

        if (type === 'PDF') {
            const doc = new jsPDF();

            // Blue Header Background
            doc.setFillColor(79, 70, 229);
            doc.rect(0, 0, 210, 40, 'F');

            // Header Text
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.text('NextBuy CRM Analytics', 20, 25);

            // Subtitle
            doc.setTextColor(100, 116, 139);
            doc.setFontSize(14);
            doc.text('Live Performance Statistics', 20, 60);

            // Metrics with Theme Colors
            doc.setFontSize(14);
            doc.setFont('helvetica', 'normal');

            doc.setTextColor(99, 102, 241); // Indigo
            doc.text(`Total Lifetime Leads:`, 20, 80);
            doc.setFont('helvetica', 'bold');
            doc.text(stats.totalLeads.toString(), 90, 80);

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(245, 158, 11); // Amber
            doc.text(`Today's Follow-ups:`, 20, 95);
            doc.setFont('helvetica', 'bold');
            doc.text(stats.todaysFollowups.toString(), 90, 95);

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(16, 185, 129); // Emerald
            doc.text(`Total Won Deals:`, 20, 110);
            doc.setFont('helvetica', 'bold');
            doc.text(stats.wonDeals.toString(), 90, 110);

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(168, 85, 247); // Purple
            doc.text(`Pending Leads:`, 20, 125);
            doc.setFont('helvetica', 'bold');
            doc.text(stats.pendingLeads.toString(), 90, 125);

            // Footer
            doc.setTextColor(148, 163, 184);
            doc.setFontSize(10);
            doc.text(`Report mathematically generated at: ${new Date().toLocaleString()}`, 20, 280);

            doc.save('NextBuy_Analytics_Report.pdf');
            return;
        }

        let content = '';
        let filename = '';
        let mimeType = '';

        if (type === 'Excel') {
            // Using a cleverly styled HTML table mapped as .xls to force Microsoft Excel to parse colors natively
            content = `
                <html xmlns:x="urn:schemas-microsoft-com:office:excel">
                    <body>
                        <table style="font-family: Arial, sans-serif; border-collapse: collapse; min-width: 400px; text-align: left;">
                            <tr>
                                <th colspan="2" style="background-color: #4F46E5; color: white; padding: 15px; font-size: 18px; font-weight: bold; border-radius: 8px 8px 0 0;">NextBuy CRM Business Overview</th>
                            </tr>
                            <tr>
                                <td style="padding: 12px; font-weight: bold; color: #334155; border-bottom: 1px solid #E2E8F0;">Total Leads</td>
                                <td style="padding: 12px; font-weight: bold; color: #4F46E5; border-bottom: 1px solid #E2E8F0; font-size: 16px;">${stats.totalLeads}</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px; font-weight: bold; color: #334155; border-bottom: 1px solid #E2E8F0;">Today's Follow-ups</td>
                                <td style="padding: 12px; font-weight: bold; color: #F59E0B; border-bottom: 1px solid #E2E8F0; font-size: 16px;">${stats.todaysFollowups}</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px; font-weight: bold; color: #334155; border-bottom: 1px solid #E2E8F0;">Won Deals</td>
                                <td style="padding: 12px; font-weight: bold; color: #10B981; border-bottom: 1px solid #E2E8F0; font-size: 16px;">${stats.wonDeals}</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px; font-weight: bold; color: #334155;">Pending Leads</td>
                                <td style="padding: 12px; font-weight: bold; color: #A855F7; font-size: 16px;">${stats.pendingLeads}</td>
                            </tr>
                        </table>
                    </body>
                </html>
            `;
            filename = 'nextbuy_premium_report.xls';
            mimeType = 'application/vnd.ms-excel;charset=utf-8;';
        } else if (type === 'CSV') {
            content = `Metric,Value\nTotal Leads,${stats.totalLeads}\nToday's Follow-ups,${stats.todaysFollowups}\nWon Deals,${stats.wonDeals}\nPending Leads,${stats.pendingLeads}`;
            filename = 'nextbuy_raw_data.csv';
            mimeType = 'text/csv;charset=utf-8;';
        }

        const blob = new Blob([content], { type: mimeType });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/70 dark:bg-[#0B0F19]/60 backdrop-blur-md p-8 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-slate-200 dark:border-[#1E293B] transition-colors relative z-10">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">Dashboard Overview</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Welcome back to NextBuy CRM. Here is your daily summary.</p>
                </div>
                <div className="mt-4 md:mt-0 flex gap-4 relative">
                    {/* Generate Report Dropdown Wrapper */}
                    <div className="relative">
                        <button
                            onClick={() => setReportMenuOpen(!reportMenuOpen)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 dark:bg-[#1E293B] hover:bg-slate-200 dark:hover:bg-[#2A374C] text-slate-700 dark:text-slate-200 rounded-xl font-semibold transition-all duration-300 border border-slate-300 dark:border-slate-700/50 shadow-sm dark:shadow-md"
                        >
                            Generate Report <ChevronDown className={`w-4 h-4 transition-transform ${reportMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {reportMenuOpen && (
                            <div className="absolute top-full mt-2 w-48 right-0 bg-white dark:bg-[#0F1523] border border-slate-200 dark:border-[#1E293B] rounded-xl shadow-xl dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
                                <button onClick={() => handleExport('PDF')} className="flex items-center w-full gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-[#1E293B] text-slate-700 dark:text-slate-300 transition-colors">
                                    <FileText className="w-4 h-4 text-rose-500" /> Export as PDF
                                </button>
                                <button onClick={() => handleExport('Excel')} className="flex items-center w-full gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-[#1E293B] text-slate-700 dark:text-slate-300 transition-colors">
                                    <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Export as Excel
                                </button>
                                <button onClick={() => handleExport('CSV')} className="flex items-center w-full gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-[#1E293B] text-slate-700 dark:text-slate-300 transition-colors">
                                    <Download className="w-4 h-4 text-blue-500" /> Export as CSV
                                </button>
                            </div>
                        )}
                    </div>
                    <Link to="/leads/new" className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-[0_4px_15px_rgba(79,70,229,0.3)] dark:shadow-[0_0_15px_rgba(79,70,229,0.4)] hover:shadow-[0_6px_25px_rgba(79,70,229,0.4)] dark:hover:shadow-[0_0_25px_rgba(79,70,229,0.6)]">
                        + New Lead
                    </Link>
                </div>
            </div>

            {/* KPI Cards */}
            <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>

                {/* Total Leads */}
                <div className="bg-white dark:bg-gradient-to-br dark:from-[#1E293B] dark:to-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-[#334155] shadow-lg shadow-slate-200/50 dark:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 font-semibold mb-1">Total Leads</p>
                            <h3 className="text-4xl font-bold text-slate-800 dark:text-white group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                                {loading ? '...' : stats.totalLeads}
                            </h3>
                        </div>
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl">
                            <Users className="w-7 h-7 text-indigo-500 dark:text-indigo-400" />
                        </div>
                    </div>
                </div>

                {/* Today's Follow-ups */}
                <div className="bg-white dark:bg-gradient-to-br dark:from-[#1E293B] dark:to-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-[#334155] shadow-lg shadow-slate-200/50 dark:shadow-xl hover:shadow-amber-500/10 dark:hover:shadow-amber-500/10 hover:-translate-y-1 transition-all duration-300 group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 font-semibold mb-1">Today's Follow-ups</p>
                            <h3 className="text-4xl font-bold text-slate-800 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
                                {loading ? '...' : stats.todaysFollowups}
                            </h3>
                        </div>
                        <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-2xl">
                            <Clock className="w-7 h-7 text-amber-500 dark:text-amber-400" />
                        </div>
                    </div>
                </div>

                {/* Won Deals */}
                <div className="bg-white dark:bg-gradient-to-br dark:from-[#1E293B] dark:to-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-[#334155] shadow-lg shadow-slate-200/50 dark:shadow-xl hover:shadow-emerald-500/10 dark:hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 font-semibold mb-1">Won Deals</p>
                            <h3 className="text-4xl font-bold text-slate-800 dark:text-white group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                                {loading ? '...' : stats.wonDeals}
                            </h3>
                        </div>
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl">
                            <CheckCircle className="w-7 h-7 text-emerald-500 dark:text-emerald-400" />
                        </div>
                    </div>
                </div>

                {/* Pending Leads */}
                <div className="bg-white dark:bg-gradient-to-br dark:from-[#1E293B] dark:to-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-[#334155] shadow-lg shadow-slate-200/50 dark:shadow-xl hover:shadow-purple-500/10 dark:hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300 group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 font-semibold mb-1">Pending Leads</p>
                            <h3 className="text-4xl font-bold text-slate-800 dark:text-white group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors">
                                {loading ? '...' : stats.pendingLeads}
                            </h3>
                        </div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-2xl">
                            <TrendingUp className="w-7 h-7 text-purple-500 dark:text-purple-400" />
                        </div>
                    </div>
                </div>

            </div>

            {/* Graphical Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                <div className="lg:col-span-2 bg-white dark:bg-[#0B0F19]/80 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-[#1E293B] shadow-lg shadow-slate-200/50 dark:shadow-xl min-h-[400px] flex flex-col transition-colors z-0">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Monthly Leads Activity (Histogram)</h3>
                    <div className="flex-1 w-full h-full min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dx={-10} allowDecimals={false} />
                                <RechartsTooltip
                                    cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', backgroundColor: '#1E293B', color: '#fff' }}
                                    itemStyle={{ color: '#818CF8' }}
                                />
                                <Bar dataKey="leads" fill="#4F46E5" radius={[6, 6, 0, 0]} barSize={45} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0B0F19]/80 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-[#1E293B] shadow-lg shadow-slate-200/50 dark:shadow-xl min-h-[400px] flex flex-col transition-colors z-0">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Lead Status Distribution</h3>
                    <div className="flex-1 w-full h-full min-h-[300px] flex items-center justify-center">
                        {stats.statusData && stats.statusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={95}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {stats.statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', backgroundColor: '#1E293B', color: '#fff' }}
                                        itemStyle={{ color: '#38BDF8' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-slate-400 dark:text-slate-500 flex flex-col items-center gap-4">
                                <CalendarClock className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                                <p>No Status Data Yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Follow-up Pop-up Modal */}
            {showFollowupPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-[#0F172A] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#1E293B] max-w-sm w-full p-6 animate-in zoom-in-95 duration-300">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-500/20 rounded-full flex items-center justify-center mb-4">
                                <Clock className="w-8 h-8 text-amber-500 dark:text-amber-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Follow-ups Due</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">
                                You have <span className="font-bold text-indigo-600 dark:text-indigo-400">{stats.todaysFollowups}</span> follow-up(s) scheduled for today.
                            </p>
                            <div className="w-full space-y-3">
                                <Link to="/leads?filter=followup" onClick={() => setShowFollowupPopup(false)} className="w-full flex justify-center py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg">
                                    View Follow-ups
                                </Link>
                                <button onClick={() => setShowFollowupPopup(false)} className="w-full flex justify-center py-3 px-4 bg-slate-100 dark:bg-[#1E293B] hover:bg-slate-200 dark:hover:bg-[#2A374C] text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-all">
                                    Remind me later
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Dashboard;
