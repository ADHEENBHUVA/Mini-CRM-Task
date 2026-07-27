import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const DashboardLayout = () => {
    const token = localStorage.getItem('token');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Theme State
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [theme]);

    // Auth Guard
    if (!token) {
        return <Navigate to="/login" />;
    }

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-[#070A11] overflow-hidden font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} theme={theme} />

            <div className="flex-1 flex flex-col relative z-0 w-full transition-all duration-300 md:ml-64">
                <Navbar onMenuClick={() => setIsSidebarOpen(true)} theme={theme} setTheme={setTheme} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto w-full p-4 md:p-8 pb-24">
                    <Outlet />
                </main>

                {/* Background ambient glow effect */}
                <div className="fixed top-0 right-0 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-indigo-200/40 dark:bg-indigo-600/5 rounded-full blur-[80px] md:blur-[120px] pointer-events-none -z-10 translate-x-1/3 -translate-y-1/3 transition-colors duration-1000"></div>
                <div className="fixed bottom-0 left-0 md:left-64 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-purple-200/30 dark:bg-purple-600/5 rounded-full blur-[60px] md:blur-[100px] pointer-events-none -z-10 -translate-x-1/4 translate-y-1/4 transition-colors duration-1000"></div>
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm z-10 md:hidden transition-colors"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default DashboardLayout;
