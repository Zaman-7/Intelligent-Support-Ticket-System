import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { User, Mail, Lock, Loader2, CheckCircle } from 'lucide-react';

export default function Profile() {
    const { user } = useAuth();
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/users/profile');
                setFormData({ username: res.data.username, email: res.data.email, password: '' });
            } catch (err) {
                setError('Failed to load profile data.');
            } finally {
                setFetching(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setError(null);
        try {
            await api.put('/users/profile', formData);
            setMessage('Profile updated successfully.');
            setFormData(prev => ({ ...prev, password: '' }));
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating profile.');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-8 text-center text-slate-500 animate-pulse font-medium">Loading profile...</div>;

    return (
        <div className="p-8 max-w-[800px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 bg-slate-50 min-h-[calc(100vh-80px)]">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-800 mb-2">Global Profile</h1>
                <p className="text-slate-500 font-medium">Manage your personal information and security settings.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
                {message && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2 font-medium">
                        <CheckCircle size={18} /> <span>{message}</span>
                    </div>
                )}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Username</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full bg-white border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-white border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 mt-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-1">Change Password</h3>
                        <p className="text-slate-500 text-sm mb-4 font-medium">Leave blank if you do not wish to change your password.</p>
                        
                        <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                                className="w-full bg-white border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
