import React, { useState } from 'react';
import { User, Mail, ShieldAlert, Key, Save, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
    // Assuming we fetch user details from localstorage or context (matching Navbar logic)
    const storedUser = JSON.parse(localStorage.getItem('user')) || {
        name: 'Master Admin',
        email: 'admin@nextbuy.com',
        role: 'Master Admin'
    };
    const isAdmin = storedUser.role === 'Master Admin' || storedUser.role === 'Superadmin' || storedUser.role === 'Admin';

    const [user, setUser] = useState(storedUser);
    const [name, setName] = useState(user.name);

    // Password State
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleProfileUpdate = (e) => {
        e.preventDefault();
        const updatedUser = { ...user, name };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        toast.success('Profile Updated Successfully!');
    };

    const handlePasswordUpdate = (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("Passwords don't match!");
            return;
        }
        toast.success('Password Changed Successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-5xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/70 dark:bg-[#0B0F19]/60 backdrop-blur-md p-6 sm:px-8 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-slate-200 dark:border-[#1E293B] transition-colors">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">My Profile</h2>
                    <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1 sm:mt-2 font-medium">Manage your personal information and security.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1st Box: Profile Details */}
                <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] shadow-lg shadow-slate-200/50 dark:shadow-xl rounded-3xl p-6 sm:p-8 transition-colors">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-[#1E293B]">
                        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Profile Information</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Update your account details</p>
                        </div>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 hover:opacity-80 transition-opacity">Full Name</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <User className={`h-5 w-5 ${!isAdmin ? 'text-slate-400/70 dark:text-slate-600' : 'text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500'} transition-colors`} />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    readOnly={!isAdmin}
                                    disabled={!isAdmin}
                                    onChange={(e) => setName(e.target.value)}
                                    className={`block w-full pl-11 pr-4 py-2.5 rounded-xl border transition-all ${!isAdmin
                                        ? 'bg-slate-50 dark:bg-[#151D2C]/50 border-slate-200 dark:border-[#1E293B] text-slate-500 dark:text-slate-400 cursor-not-allowed shadow-none'
                                        : 'bg-white dark:bg-[#0B0F19] border-slate-200 dark:border-[#1E293B] text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm'
                                        }`}
                                    placeholder="Enter your name"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 hover:opacity-80 transition-opacity">Username / Email (Read-Only)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400/70 dark:text-slate-600" />
                                </div>
                                <input
                                    type="email"
                                    value={user.email}
                                    readOnly
                                    disabled
                                    className="block w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-[#151D2C]/50 border border-slate-200 dark:border-[#1E293B] rounded-xl text-slate-500 dark:text-slate-400 cursor-not-allowed shadow-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 hover:opacity-80 transition-opacity">Role</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <ShieldCheck className="h-5 w-5 text-slate-400/70 dark:text-slate-600" />
                                </div>
                                <input
                                    type="text"
                                    value={user.role}
                                    readOnly
                                    disabled
                                    className="block w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-[#151D2C]/50 border border-slate-200 dark:border-[#1E293B] rounded-xl text-slate-500 dark:text-slate-400 font-medium cursor-not-allowed shadow-none transition-all"
                                />
                            </div>
                        </div>

                        {isAdmin && (
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-[0_4px_15px_rgba(79,70,229,0.3)] dark:shadow-[0_0_15px_rgba(79,70,229,0.4)] hover:-translate-y-0.5"
                                >
                                    <Save className="w-5 h-5" />
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </form>
                </div>

                {/* 2nd Box: Change Password */}
                <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] shadow-lg shadow-slate-200/50 dark:shadow-xl rounded-3xl p-6 sm:p-8 transition-colors flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-[#1E293B]">
                        <div className="p-2.5 bg-rose-50 dark:bg-rose-500/10 rounded-xl text-rose-600 dark:text-rose-400">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Security</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Update your password</p>
                        </div>
                    </div>

                    <form onSubmit={handlePasswordUpdate} className="space-y-5 flex-1 flex flex-col justify-between">
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 hover:opacity-80 transition-opacity">Current Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Key className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-rose-500 transition-colors" />
                                    </div>
                                    <input
                                        type={showOldPassword ? "text" : "password"}
                                        required
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        className="block w-full pl-11 pr-12 py-2.5 bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-[#1E293B] rounded-xl text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm"
                                        placeholder="Enter current password"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 outline-none focus:outline-none"
                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                    >
                                        {showOldPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 hover:opacity-80 transition-opacity">New Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Key className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-rose-500 transition-colors" />
                                    </div>
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="block w-full pl-11 pr-12 py-2.5 bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-[#1E293B] rounded-xl text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm"
                                        placeholder="Enter new password"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 outline-none focus:outline-none"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        {showNewPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 hover:opacity-80 transition-opacity">Confirm New Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Key className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-rose-500 transition-colors" />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full pl-11 pr-12 py-2.5 bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-[#1E293B] rounded-xl text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm"
                                        placeholder="Confirm new password"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 outline-none focus:outline-none"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 mt-auto">
                            <button
                                type="submit"
                                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-[0_4px_15px_rgba(225,29,72,0.3)] dark:shadow-[0_0_15px_rgba(225,29,72,0.4)] hover:-translate-y-0.5"
                            >
                                <Key className="w-5 h-5" />
                                Update Password
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
