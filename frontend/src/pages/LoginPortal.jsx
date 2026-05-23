import React from 'react';
import { Link } from 'react-router-dom';
import { User, ShieldCheck, Activity } from 'lucide-react';

export default function LoginPortal() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl shadow-xl w-full max-w-2xl p-10 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-100/50 blur-[50px] rounded-full"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-50/50 blur-[50px] rounded-full"></div>

                <div className="flex flex-col items-center mb-10 relative z-10 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 text-blue-600 shadow-sm">
                        <Activity size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 m-0">Welcome to IntelliDesk</h1>
                    <p className="text-slate-500 mt-3 text-base max-w-sm">Please select your portal to continue to the intelligent support system.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    <Link to="/login/customer" className="group bg-white border border-slate-200 p-8 rounded-2xl hover:border-blue-400 hover:shadow-lg hover:shadow-blue-100 transition-all duration-300 flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <User size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Customer Portal</h2>
                        <p className="text-slate-500 text-sm">Submit support tickets, track resolutions, and get AI-assisted help.</p>
                    </Link>

                    <Link to="/login/staff" className="group bg-white border border-slate-200 p-8 rounded-2xl hover:border-purple-400 hover:shadow-lg hover:shadow-purple-100 transition-all duration-300 flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <ShieldCheck size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Staff Portal</h2>
                        <p className="text-slate-500 text-sm">Access the agent dashboard, manage queues, and view analytics.</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
