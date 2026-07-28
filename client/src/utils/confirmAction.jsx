import React from 'react';
import toast from 'react-hot-toast';
import { AlertTriangle, X } from 'lucide-react';

export const confirmAction = (message) => new Promise((resolve) => {
    toast((t) => (
        <div className="flex flex-col gap-3 min-w-[280px]">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 text-slate-800 dark:text-slate-100">
                    <div className="p-2 bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-full">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <p className="font-semibold">{message}</p>
                </div>
                <button
                    onClick={() => { toast.dismiss(t.id); resolve(false); }}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
            <div className="flex justify-end gap-2 mt-2">
                <button
                    onClick={() => { toast.dismiss(t.id); resolve(false); }}
                    className="px-4 py-2 text-sm font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={() => { toast.dismiss(t.id); resolve(true); }}
                    className="px-4 py-2 text-sm font-medium bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/30 rounded-xl transition-all"
                >
                    Confirm
                </button>
            </div>
        </div>
    ), { duration: Infinity, style: { background: 'var(--toast-bg, #fff)', color: 'var(--toast-color, #000)', borderRadius: '1rem', padding: '1rem' } });
});
