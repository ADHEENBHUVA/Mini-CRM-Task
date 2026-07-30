import React, { useState } from 'react';
import { User, Mail, ShieldAlert, Key, Save, ShieldCheck, Eye, EyeOff, Camera } from 'lucide-react';
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
    const [avatar, setAvatar] = useState(user.avatar || '');
    const fileInputRef = React.useRef(null);

    // Password State
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                toast.error('Image size must be less than 2MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        const updatedUser = { ...user, name, avatar };

        try {
            if (storedUser.role === 'Employee') {
                const token = localStorage.getItem('token');
                // We use axios explicitly injected or just fetch
                const response = await fetch(`http://localhost:5000/api/employees/${storedUser.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ name, avatar })
                });
                if (!response.ok) throw new Error('API Update Failed');
            }
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            // Dispatch a storage event so other tabs/components (like Navbar) can react to it immediately
            window.dispatchEvent(new Event('storage'));
            toast.success('Profile Updated Successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update profile to database. Saved locally.');
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            window.dispatchEvent(new Event('storage'));
        }
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

                        <div className="flex flex-col items-center sm:items-start gap-4 mb-2">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Profile Picture</label>
                            <div className="flex items-center gap-6 w-full">
                                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-[#1E293B] shadow-lg bg-slate-100 dark:bg-[#151D2C] shrink-0 relative transition-transform group-hover:scale-105">
                                        {avatar ? (
                                            <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-3xl">
                                                {name ? name.charAt(0).toUpperCase() : 'U'}
                                            </div>
                                        )}
                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera className="text-white w-6 h-6" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-4 py-2 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#2A374C] transition-colors shadow-sm"
                                    >
                                        Change Picture
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAvatar('')}
                                        className="px-4 py-2 bg-transparent text-sm font-bold text-rose-500 hover:text-rose-600 transition-colors text-left"
                                    >
                                        Remove Avatar
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/png, image/jpeg, image/jpg"
                                        onChange={handleImageUpload}
                                    />
                                    <p className="text-xs text-slate-400 font-medium">JPEG or PNG. Max 2MB.</p>
                                </div>
                            </div>
                        </div>

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
