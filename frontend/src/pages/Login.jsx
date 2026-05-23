import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Mail, ArrowRight, User, Lock, Loader2, ArrowLeft } from 'lucide-react';

export default function Login({ isStaff = false }) {
    const [isSignUp, setIsSignUp] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { login, signup, logout } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            let loggedInUser;
            if (isSignUp && !isStaff) {
                loggedInUser = await signup(username, email, password);
            } else {
                loggedInUser = await login(email, password);
            }

            if (isStaff && loggedInUser.role === 'Customer') {
                logout();
                setError("Access Denied: Staff credentials required.");
                setLoading(false);
                return;
            } else if (!isStaff && (loggedInUser.role === 'Agent' || loggedInUser.role === 'Admin')) {
                logout();
                setError("Access Denied: Please use the Staff Portal.");
                setLoading(false);
                return;
            }

            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl shadow-xl w-full max-w-md p-10 relative overflow-hidden transition-all duration-500">
                
                {/* Decorative calming glow */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-100/50 blur-[50px] rounded-full"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-50/50 blur-[50px] rounded-full"></div>

                <div className="absolute top-6 left-6 z-20">
                    <Link to="/login" className="text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-1 text-sm font-medium">
                        <ArrowLeft size={16} /> Back
                    </Link>
                </div>

                <div className="flex flex-col items-center mb-8 relative z-10 mt-4">
                    <div className={`w-14 h-14 rounded-2xl ${isStaff ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-500'} flex items-center justify-center mb-6 shadow-sm`}>
                        <Activity size={28} />
                    </div>
                    <h1 className="text-2xl font-semibold text-slate-800 m-0 text-center">
                        {isStaff ? "Staff Portal Login" : (isSignUp ? "Let's get started" : "Customer Portal Login")}
                    </h1>
                    <p className="text-slate-500 mt-2 text-center text-sm">
                        {isStaff ? "Secure access for Agents and Administrators." : (isSignUp ? "Create an account to track your support requests." : "Sign in to view and manage your support tickets.")}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm relative z-10 flex items-center gap-2">
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                    {isSignUp && !isStaff && (
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1.5">How should we call you?</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Your full name"
                                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-300"
                                    required={isSignUp && !isStaff}
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1.5">Email address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-300"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1.5">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-300"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center items-center gap-2 ${isStaff ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'} text-white font-medium py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 mt-2 disabled:opacity-70`}
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : (
                            <>{isSignUp && !isStaff ? 'Create Account' : 'Sign In'} <ArrowRight size={18} /></>
                        )}
                    </button>
                </form>

                {!isStaff && (
                    <div className="mt-6 text-center text-sm text-slate-500 relative z-10 pt-4">
                        <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(null); }} className="hover:text-blue-600 font-medium transition-colors">
                            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
