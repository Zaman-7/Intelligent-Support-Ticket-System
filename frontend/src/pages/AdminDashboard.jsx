import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { Settings, Users, CheckCircle, BarChart3, Trash2, Edit, Archive, AlertCircle, Check, X } from 'lucide-react';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('analytics');
    const [analytics, setAnalytics] = useState(null);
    const [resolvedTickets, setResolvedTickets] = useState([]);
    const [activeTickets, setActiveTickets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [agents, setAgents] = useState([]);
    const [newCat, setNewCat] = useState({ name: '', desc: '' });
    const [newAgent, setNewAgent] = useState({ username: '', email: '', password: '' });
    const [allTickets, setAllTickets] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            if (activeTab === 'analytics') {
                const res = await api.get('/admin/analytics');
                setAnalytics(res.data);
            } else if (activeTab === 'resolution') {
                const res = await api.get('/admin/resolved-tickets');
                setResolvedTickets(res.data);
            } else if (activeTab === 'active_issues') {
                const [ticketsRes, agentsRes] = await Promise.all([
                    api.get('/admin/active-tickets'),
                    api.get('/admin/agents')
                ]);
                setActiveTickets(ticketsRes.data);
                setAgents(agentsRes.data);
            } else if (activeTab === 'archive') {
                const res = await api.get('/admin/tickets/all');
                setAllTickets(res.data);
            } else if (activeTab === 'system') {
                const [catRes, agentRes] = await Promise.all([
                    api.get('/categories'),
                    api.get('/admin/agents')
                ]);
                setCategories(catRes.data);
                setAgents(agentRes.data);
            }
        } catch (err) { console.error('Error fetching admin data', err); }
    };

    const handleCloseTicket = async (id) => {
        await api.put(`/admin/tickets/${id}/close`);
        fetchData(); // refresh list
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        await api.post('/admin/categories', { category_name: newCat.name, description: newCat.desc });
        setNewCat({ name: '', desc: '' });
        fetchData();
    };

    const handleDeleteCategory = async (id) => {
        await api.delete(`/admin/categories/${id}`);
        fetchData();
    };

    const handleAddAgent = async (e) => {
        e.preventDefault();
        await api.post('/users/agents', newAgent);
        setNewAgent({ username: '', email: '', password: '' });
        fetchData();
    };

    const handleDeleteAgent = async (id) => {
        await api.delete(`/admin/agents/${id}`);
        fetchData();
    };

    const handleAssignTicket = async (ticketId, agentId) => {
        await api.put(`/admin/tickets/${ticketId}/assign`, { agent_id: agentId });
        fetchData();
    };

    const handleApproveSLA = async (e, ticketId) => {
        e.stopPropagation();
        await api.put(`/admin/tickets/${ticketId}/approve-sla`);
        fetchData();
    };

    const handleDenySLA = async (e, ticketId) => {
        e.stopPropagation();
        await api.put(`/admin/tickets/${ticketId}/deny-sla`);
        fetchData();
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 bg-slate-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-800 mb-2">Admin Control Center</h1>
                <p className="text-slate-500 font-medium">Manage queues, system settings, and overview analytics.</p>
            </div>

            <div className="flex gap-4 mb-8">
                <button onClick={() => setActiveTab('analytics')} className={`px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all ${activeTab === 'analytics' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                    <BarChart3 size={18} /> Analytics Dashboard
                </button>
                <button onClick={() => setActiveTab('active_issues')} className={`px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all ${activeTab === 'active_issues' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                    <Edit size={18} /> Active Issues
                </button>
                <button onClick={() => setActiveTab('resolution')} className={`px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all ${activeTab === 'resolution' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                    <CheckCircle size={18} /> Resolution Queue
                </button>
                <button onClick={() => setActiveTab('archive')} className={`px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all ${activeTab === 'archive' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                    <Archive size={18} /> Global Oversight
                </button>
                <button onClick={() => setActiveTab('system')} className={`px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all ${activeTab === 'system' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                    <Settings size={18} /> System Management
                </button>
            </div>

            {activeTab === 'analytics' && analytics && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 flex flex-col items-center justify-center text-center">
                            <span className="text-slate-500 font-bold uppercase tracking-wider mb-2 text-sm">Total Tickets Closed</span>
                            <h2 className="text-6xl font-black text-slate-800">{analytics.totalClosed}</h2>
                        </div>
                        <div className="bg-white border border-purple-100 rounded-2xl shadow-sm p-8 flex flex-col items-center justify-center text-center">
                            <span className="text-purple-600 font-bold uppercase tracking-wider mb-2 text-sm">AI Analysis Accuracy</span>
                            <h2 className="text-6xl font-black text-purple-600">{(analytics.avg_confidence || 0).toFixed(1)}%</h2>
                        </div>
                    </div>
                    
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-200 bg-slate-50"><h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Users size={20} className="text-blue-600" /> Agent Leaderboard</h3></div>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white text-slate-500 text-sm font-medium border-b border-slate-200">
                                    <th className="p-4 pl-6">Agent Name</th>
                                    <th className="p-4">Tickets Resolved</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analytics.leaderboard.map((a, i) => (
                                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="p-4 pl-6 text-slate-800 font-medium">{a.username}</td>
                                        <td className="p-4">
                                            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-bold border border-emerald-200">{a.resolved_count}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'resolution' && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-200 bg-slate-50"><h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><CheckCircle size={20} className="text-emerald-600" /> Awaiting Final Closure</h3></div>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white text-slate-500 text-sm font-medium border-b border-slate-200">
                                <th className="p-4 pl-6">Ticket</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resolvedTickets.map(t => (
                                <tr key={t.ticket_id} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="p-4 pl-6 text-slate-800 font-medium">#{t.ticket_id} - {t.subject}</td>
                                    <td className="p-4 text-slate-600">{t.customer_name}</td>
                                    <td className="p-4 text-slate-600">{t.category_name}</td>
                                    <td className="p-4">
                                        <button onClick={() => handleCloseTicket(t.ticket_id)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                                            Final Close
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {resolvedTickets.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-emerald-600/60 font-medium">Inbox Zero! No resolved tickets waiting.</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'active_issues' && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-200 bg-slate-50"><h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Edit size={20} className="text-blue-600" /> Active Issues & Assignment</h3></div>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white text-slate-500 text-sm font-medium border-b border-slate-200">
                                <th className="p-4 pl-6">Ticket</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Agent Assigned</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeTickets.map(t => (
                                <tr key={t.ticket_id} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="p-4 pl-6 text-slate-800 font-medium">
                                        <div className="flex flex-col items-start gap-1">
                                            <span>#{t.ticket_id} - {t.subject}</span>
                                            {t.sla_extension_status === 'Requested' && (
                                                <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-300 text-amber-800 text-[10px] uppercase font-bold rounded-full animate-pulse shadow-sm mt-1">
                                                    <AlertCircle size={12} /> Agent Requests 24h Extension
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-600">{t.customer_name}</td>
                                    <td className="p-4 text-slate-600">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${t.status === 'Open' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-600 font-medium">{t.agent_name || 'Unassigned'}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <select 
                                                className="bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                                onChange={(e) => handleAssignTicket(t.ticket_id, e.target.value)}
                                                value={t.assigned_agent_id || ''}
                                            >
                                                <option value="">Unassigned</option>
                                                {agents.map(a => <option key={a.user_id} value={a.user_id}>{a.username}</option>)}
                                            </select>
                                            {t.sla_extension_status === 'Requested' && (
                                                <div className="flex items-center gap-2 ml-3 p-2 bg-amber-50 border border-amber-200 rounded-xl shadow-sm">
                                                    <button onClick={(e) => handleApproveSLA(e, t.ticket_id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold rounded-lg transition-colors shadow-sm"><Check size={14} /> Approve +24h</button>
                                                    <button onClick={(e) => handleDenySLA(e, t.ticket_id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white hover:bg-red-700 text-xs font-bold rounded-lg transition-colors shadow-sm"><X size={14} /> Deny</button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {activeTickets.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-slate-500 font-medium">No active tickets found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'archive' && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-200 bg-slate-50"><h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Archive size={20} className="text-slate-600" /> Global Oversight</h3></div>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white text-slate-500 text-sm font-medium border-b border-slate-200">
                                <th className="p-4 pl-6">Ticket</th>
                                <th className="p-4">Customer Name</th>
                                <th className="p-4">Assigned Agent</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Priority</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allTickets.map(t => (
                                <tr key={t.ticket_id} onClick={() => navigate(`/ticket/${t.ticket_id}`)} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                                    <td className="p-4 pl-6 text-slate-800 font-medium">
                                        <div className="flex flex-col items-start gap-1">
                                            <span>#{t.ticket_id} - {t.subject}</span>
                                            {t.sla_extension_status === 'Requested' && (
                                                <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-300 text-amber-800 text-[10px] uppercase font-bold rounded-full animate-pulse shadow-sm mt-1">
                                                    <AlertCircle size={12} /> Agent Requests 24h Extension
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-600">{t.customer_name}</td>
                                    <td className="p-4 text-slate-600">{t.agent_name || 'Unassigned'}</td>
                                    <td className="p-4 text-slate-600">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            t.status === 'Open' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 
                                            t.status === 'In Progress' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                            'bg-slate-100 text-slate-700 border border-slate-200'
                                        }`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            t.priority === 'Critical' ? 'bg-red-50 text-red-700 border border-red-200' : 
                                            'bg-slate-100 text-slate-600 border border-slate-200'
                                        }`}>
                                            {t.priority}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {t.sla_extension_status === 'Requested' && (
                                            <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-xl shadow-sm w-max">
                                                <button onClick={(e) => handleApproveSLA(e, t.ticket_id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold rounded-lg transition-colors shadow-sm"><Check size={14} /> Approve +24h</button>
                                                <button onClick={(e) => handleDenySLA(e, t.ticket_id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white hover:bg-red-700 text-xs font-bold rounded-lg transition-colors shadow-sm"><X size={14} /> Deny</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {allTickets.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-slate-500 font-medium">No tickets found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'system' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                        <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Category Management</h3>
                        <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
                            <input required value={newCat.name} onChange={e=>setNewCat({...newCat, name:e.target.value})} placeholder="Name" className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 w-1/3 focus:outline-none focus:border-blue-400" />
                            <input required value={newCat.desc} onChange={e=>setNewCat({...newCat, desc:e.target.value})} placeholder="Description" className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 flex-1 focus:outline-none focus:border-blue-400" />
                            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium shrink-0 transition-colors">Add</button>
                        </form>
                        <ul className="space-y-2">
                            {categories.map(c => (
                                <li key={c.categories_id} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <div>
                                        <strong className="text-slate-800 block">{c.category_name}</strong>
                                        <span className="text-xs text-slate-500">{c.description}</span>
                                    </div>
                                    <button onClick={() => handleDeleteCategory(c.categories_id)} className="text-red-500 hover:text-red-600 p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={16}/></button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                        <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Agent Registry</h3>
                        <form onSubmit={handleAddAgent} className="flex flex-col gap-3 mb-6">
                            <div className="flex gap-2">
                                <input required value={newAgent.username} onChange={e=>setNewAgent({...newAgent, username:e.target.value})} placeholder="Username" className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 flex-1 focus:outline-none focus:border-blue-400" />
                                <input required value={newAgent.email} onChange={e=>setNewAgent({...newAgent, email:e.target.value})} placeholder="Email" type="email" className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 flex-1 focus:outline-none focus:border-blue-400" />
                            </div>
                            <div className="flex gap-2">
                                <input required value={newAgent.password} onChange={e=>setNewAgent({...newAgent, password:e.target.value})} placeholder="Temporary Password" type="password" className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 flex-1 focus:outline-none focus:border-blue-400" />
                                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-2 font-medium shrink-0 transition-colors">Register Agent</button>
                            </div>
                        </form>
                        <div className="space-y-3">
                            {agents.map(a => (
                                <div key={a.user_id} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold">{a.username.substring(0,1).toUpperCase()}</div>
                                        <div>
                                            <strong className="text-slate-800 block">{a.username}</strong>
                                            <span className="text-xs text-slate-500">{a.email}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteAgent(a.user_id)} className="text-red-500 hover:text-red-600 p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={16}/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
