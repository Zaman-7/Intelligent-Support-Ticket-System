import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { PlusCircle, HelpCircle, Clock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CustomerDashboard() {
    const { user } = useAuth();
    const [categories, setCategories] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [newTicket, setNewTicket] = useState({ categories_id: '', subject: '', description: '' });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCategories();
        if (user?.user_id) fetchTickets();
    }, [user]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
            if (res.data.length > 0) setNewTicket(prev => ({ ...prev, categories_id: res.data[0].categories_id }));
        } catch (err) { console.error('Error fetching categories'); }
    };

    const fetchTickets = async () => {
        try {
            const res = await api.get(`/tickets/user/${user.user_id}`);
            setTickets(res.data);
        } catch (err) { console.error('Error fetching tickets'); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/tickets', { ...newTicket, user_id: user.user_id });
            setNewTicket({ categories_id: categories[0]?.categories_id || '', subject: '', description: '' });
            setShowForm(false);
            showToast("Your request was sent successfully! We're analyzing it right now.", "success");
            fetchTickets();
        } catch (err) { 
            console.error('Error creating ticket');
            showToast("Oops, something went wrong. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    const statusColors = {
        'Open': 'text-blue-700 bg-blue-50 border-blue-200',
        'In Progress': 'text-amber-700 bg-amber-50 border-amber-200',
        'Resolved': 'text-emerald-700 bg-emerald-50 border-emerald-200',
        'Closed': 'text-slate-700 bg-slate-50 border-slate-200'
    };

    const priorityColors = {
        'Low': 'border-emerald-200 text-emerald-700 bg-emerald-50',
        'Medium': 'border-amber-200 text-amber-700 bg-amber-50',
        'High': 'border-red-200 text-red-700 bg-red-50',
        'Critical': 'border-red-600 text-red-700 bg-red-100 font-bold'
    };

    return (
        <div className="p-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-24 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg border animate-in slide-in-from-right-8 ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    {toast.type === 'success' ? <CheckCircle2 className="text-emerald-500" size={20} /> : <AlertCircle className="text-red-500" size={20} />}
                    <p className="font-medium">{toast.message}</p>
                </div>
            )}

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800 m-0">Hi there! How can we help you today?</h1>
                    <p className="text-slate-500 mt-2">Let us know what you need, and we'll get it sorted out.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-md shadow-blue-200 hover:shadow-lg transition-all flex items-center gap-2"
                >
                    <PlusCircle size={18} /> {showForm ? 'Cancel Request' : 'New Request'}
                </button>
            </div>

            {showForm && (
                <div className="glass-panel p-8 mb-8 animate-in slide-in-from-top-4 relative overflow-hidden bg-white/80">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 blur-[80px] rounded-full z-0"></div>
                    <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
                        <h2 className="text-xl font-semibold mb-4 text-slate-800">Tell us what's happening</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">What does this relate to?</label>
                                <select
                                    value={newTicket.categories_id}
                                    onChange={(e) => setNewTicket({ ...newTicket, categories_id: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all appearance-none"
                                    required
                                >
                                    {categories.map(cat => (
                                        <option key={cat.categories_id} value={cat.categories_id}>
                                            {cat.category_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">A short summary</label>
                                <input
                                    type="text"
                                    value={newTicket.subject}
                                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                                    placeholder="e.g. Cannot connect to the VPN"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-600 mb-2">The details</label>
                                <textarea
                                    rows={4}
                                    value={newTicket.description}
                                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                                    placeholder="Please provide any relevant details, error messages, or steps you've already tried..."
                                    required
                                ></textarea>
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-md transition-all flex items-center gap-2 disabled:opacity-70"
                            >
                                {loading ? <><Loader2 className="animate-spin" size={18} /> Submitting...</> : 'Send Request'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="glass-panel overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm font-medium">
                                <th className="p-4 pl-6">ID</th>
                                <th className="p-4">Subject</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Priority</th>
                                <th className="p-4">Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                <HelpCircle size={32} className="text-slate-400" />
                                            </div>
                                            <p className="text-lg font-medium text-slate-700">No active requests</p>
                                            <p className="text-sm mt-1">If you need anything, just open a new request above.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : tickets.map(ticket => (
                                <tr
                                    key={ticket.ticket_id}
                                    onClick={() => navigate(`/ticket/${ticket.ticket_id}`)}
                                    className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors group"
                                >
                                    <td className="p-4 pl-6 font-medium text-slate-500">#{ticket.ticket_id}</td>
                                    <td className="p-4 text-slate-800 font-medium group-hover:text-blue-600 transition-colors">{ticket.subject}</td>
                                    <td className="p-4 text-slate-600">{ticket.category_name}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${statusColors[ticket.status]}`}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 text-xs font-semibold uppercase border rounded-md ${priorityColors[ticket.priority]}`}>
                                            {ticket.priority}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-500 text-sm flex items-center gap-1.5 mt-2"><Clock size={14} className="text-slate-400" /> {new Date(ticket.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
