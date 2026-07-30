import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Link } from 'react-router-dom';
import { Users, Briefcase, CalendarClock, TrendingUp, CheckCircle, Clock, ChevronDown, Download, FileText, FileSpreadsheet, XCircle } from 'lucide-react';

const COLORS = ['#818CF8', '#34D399', '#FBBF24', '#F472B6', '#A78BFA', '#38BDF8'];

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

                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const parsedUser = JSON.parse(userStr);
                    if (parsedUser.role === 'Admin' || parsedUser.role === 'Master Admin' || parsedUser.role === 'Superadmin') {
                        // Force log out lingering admin session on the employee portal
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                        return;
                    }
                }

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
            doc.text(`Report mathematically generated at: ${new Date().toLocaleString('en-GB')}`, 20, 280);

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
                {/* Action Buttons Removed for Employee Portal */}
            </div>

            {/* KPI Cards */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>

                {/* Total Leads */}
                <Link to="/leads" className="bg-white dark:bg-gradient-to-br dark:from-[#1E293B] dark:to-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-[#334155] shadow-lg shadow-slate-200/50 dark:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 group block">
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
                </Link>

                {/* Today's Follow-ups */}
                <Link to="/followups" className="bg-white dark:bg-gradient-to-br dark:from-[#1E293B] dark:to-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-[#334155] shadow-lg shadow-slate-200/50 dark:shadow-xl hover:shadow-amber-500/10 dark:hover:shadow-amber-500/10 hover:-translate-y-1 transition-all duration-300 group block">
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
                </Link>

                {/* Overdue Follow-ups */}
                <Link to="/followups" className="bg-white dark:bg-gradient-to-br dark:from-[#1E293B] dark:to-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-[#334155] shadow-lg shadow-slate-200/50 dark:shadow-xl hover:shadow-red-500/10 dark:hover:shadow-red-500/10 hover:-translate-y-1 transition-all duration-300 group block">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 font-semibold mb-1">Overdue Follow-ups</p>
                            <h3 className="text-4xl font-bold text-slate-800 dark:text-white group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors">
                                {loading ? '...' : stats.overdueFollowups || 0}
                            </h3>
                        </div>
                        <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-2xl">
                            <Clock className="w-7 h-7 text-red-500 dark:text-red-400" />
                        </div>
                    </div>
                </Link>

                {/* Won Deals */}
                <Link to="/leads" className="bg-white dark:bg-gradient-to-br dark:from-[#1E293B] dark:to-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-[#334155] shadow-lg shadow-slate-200/50 dark:shadow-xl hover:shadow-emerald-500/10 dark:hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 group block">
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
                </Link>

                {/* Pending Leads */}
                <Link to="/leads" className="bg-white dark:bg-gradient-to-br dark:from-[#1E293B] dark:to-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-[#334155] shadow-lg shadow-slate-200/50 dark:shadow-xl hover:shadow-purple-500/10 dark:hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300 group block">
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
                </Link>

                {/* Lost Deals */}
                <Link to="/leads?view=deleted" className="bg-white dark:bg-gradient-to-br dark:from-[#1E293B] dark:to-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-[#334155] shadow-lg shadow-slate-200/50 dark:shadow-xl hover:shadow-rose-500/10 dark:hover:shadow-rose-500/10 hover:-translate-y-1 transition-all duration-300 group block">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 font-semibold mb-1">Lost Deals</p>
                            <h3 className="text-4xl font-bold text-slate-800 dark:text-white group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors">
                                {loading ? '...' : stats.lostDeals}
                            </h3>
                        </div>
                        <div className="p-3 bg-rose-50 dark:bg-rose-500/10 rounded-2xl">
                            <XCircle className="w-7 h-7 text-rose-500 dark:text-rose-400" />
                        </div>
                    </div>
                </Link>

            </div>

            {/* Graphical Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                <div className="lg:col-span-2 bg-white dark:bg-[#0B0F19]/80 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-[#1E293B] shadow-lg shadow-slate-200/50 dark:shadow-xl min-h-[400px] flex flex-col transition-colors z-0">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Monthly Leads Activity (Histogram)</h3>
                    <div className="flex-1 w-full h-full min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart style={{ outline: 'none' }} data={stats.monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dx={-10} allowDecimals={false} />
                                <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }} itemStyle={{ color: '#818CF8' }} />
                                <Bar dataKey="leads" fill="#818CF8" radius={[6, 6, 0, 0]} barSize={45} style={{ cursor: 'pointer' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0B0F19]/80 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-[#1E293B] shadow-lg shadow-slate-200/50 dark:shadow-xl min-h-[400px] flex flex-col transition-colors z-0">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Lead Status Distribution</h3>
                    <div className="flex-1 w-full h-full min-h-[300px] flex items-center justify-center">
                        {stats.statusData && stats.statusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart style={{ outline: 'none' }}>
                                    <Pie
                                        style={{ outline: 'none' }}
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
                                            <Cell
                                                style={{ outline: 'none', cursor: 'pointer' }}
                                                key={`cell-${index}`}
                                                fill={entry.name === 'Lost Deal' ? '#F43F5E' : entry.name === 'Won Deal' ? '#10B981' : entry.name === 'Pending Deals' ? '#8B5CF6' : COLORS[index % COLORS.length]}
                                            />
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

            {/* Follow-up Pop-up Modal Removed */}
        </div>
    );
};

export default Dashboard;
