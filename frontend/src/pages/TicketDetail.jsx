import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { ArrowLeft, Send, Lock, User, Clock, BrainCircuit, MessageSquare, CheckCircle, Lightbulb } from 'lucide-react';

export default function TicketDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [ticket, setTicket] = useState(null);
    const [updates, setUpdates] = useState([]);
    const [reply, setReply] = useState('');
    const [isInternal, setIsInternal] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        fetchTicket();
    }, [id]);

    const fetchTicket = async () => {
        try {
            const res = await api.get(`/tickets/${id}`);
            setTicket(res.data.ticket);
            setUpdates(res.data.updates);
        } catch (err) {
            console.error(err);
            navigate('/');
        }
    };

    const handleSend = async () => {
        if (!reply.trim()) return;
        try {
            await api.post(`/tickets/${id}/updates`, {
                user_id: user.user_id,
                comments: reply,
                is_internal: isAgentOrAdmin ? isInternal : false,
                role: user.role
            });
            setReply('');
            setIsInternal(false);
            fetchTicket();
        } catch (err) {
            console.error(err);
        }
    };

    const handleStatusUpdate = async (status) => {
        try {
            await api.put(`/tickets/${id}/status`, { status });
            if(status === 'Resolved' || status === 'Closed') {
                navigate('/');
            } else {
                fetchTicket();
            }
        } catch (err) { console.error('Error updating status'); }
    };

    const handleGenerateReply = async () => {
        setIsGenerating(true);
        try {
            const res = await api.post(`/tickets/${id}/generate-reply`);
            setReply(res.data.draft);
            setIsInternal(false);
        } catch (err) {
            console.error('Error generating reply');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRequestSLA = async () => {
        try {
            await api.put(`/tickets/${id}/request-sla`);
            fetchTicket();
        } catch (err) {
            console.error('Error requesting SLA extension');
        }
    };

    const isAgentOrAdmin = user?.role === 'Agent' || user?.role === 'Admin';
    const isAgent = user?.role === 'Agent';

    if (!ticket) return <div className="p-8 text-center text-slate-500 animate-pulse font-medium">Loading secure channel...</div>;

    return (
        <div className="p-8 max-w-[1400px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 bg-slate-50 min-h-screen">
            <button
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition-colors font-medium"
                onClick={() => navigate(-1)}
            >
                <ArrowLeft size={18} /> Back to Dashboard
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
                <div className="space-y-8">
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 leading-tight mb-2">{ticket.subject}</h2>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                    <span className="flex items-center gap-1.5 font-medium"><User size={14} className="text-blue-600" /> {ticket.customer_name}</span>
                                    <span className="flex items-center gap-1.5"><Clock size={14} className="text-blue-600" /> {new Date(ticket.created_at).toLocaleString()}</span>
                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-xs text-slate-600 font-bold">#{ticket.ticket_id}</span>
                                    {ticket.agent_name && (
                                        <span className="flex items-center gap-1.5 font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-xs">Assigned: {ticket.agent_name}</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <span className={`px-3 py-1 text-xs font-bold uppercase rounded-lg border ${ticket.status === 'Open' ? 'text-blue-700 bg-blue-50 border-blue-200' : ticket.status === 'In Progress' ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200'}`}>{ticket.status}</span>
                                <span className={`px-3 py-1 text-xs font-bold uppercase rounded-lg border ${ticket.priority === 'Critical' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>{ticket.priority}</span>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 leading-relaxed font-medium">
                            {ticket.description}
                        </div>

                        <div className="mt-8 space-y-6">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                                <MessageSquare size={18} className="text-blue-600" /> Activity Log
                            </h3>

                            <div className="flex flex-col gap-5">
                                {updates.filter(u => (!u.is_internal || isAgentOrAdmin)).map((update) => {
                                    const isSystem = update.comments.startsWith('System');
                                    const isMe = update.user_id === user.user_id && !isSystem;
                                    const isInternalNote = update.is_internal;
                                    const displayName = isSystem ? 'IntelliDesk AI Support' : update.username;

                                    return (
                                        <div key={update.update_id} className={`flex gap-4 max-w-[85%] ${isMe ? 'self-end flex-row-reverse' : 'self-start'}`}>
                                            <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center font-bold text-sm shadow-sm ${isSystem ? 'bg-slate-200 text-slate-700 border border-slate-300' : isInternalNote ? 'bg-amber-100 text-amber-700 border border-amber-200' : isMe ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 border border-slate-300'}`}>
                                                {isSystem ? 'AI' : displayName.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className={`flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <strong className="text-slate-700">{displayName}</strong>
                                                    <span>{new Date(update.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    {isInternalNote && <span className="flex items-center gap-1 text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider"><Lock size={10} /> Internal Note</span>}
                                                </div>
                                                <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${isSystem
                                                        ? 'bg-slate-100 border border-slate-200 text-slate-800 rounded-tl-sm'
                                                        : isInternalNote
                                                            ? 'bg-amber-50 border-l-4 border-amber-400 text-amber-900'
                                                            : isMe
                                                                ? 'bg-blue-600 text-white rounded-tr-sm'
                                                                : 'bg-slate-100 border border-slate-200 text-slate-800 rounded-tl-sm'
                                                    }`}>
                                                    {update.comments}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Ticket disabled messaging */}
                            {ticket.status === 'Closed' ? (
                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500 font-medium mt-8">
                                    <Lock size={16} className="mx-auto mb-2 opacity-50" />
                                    This ticket has been permanently closed and secured by administration.
                                </div>
                            ) : (
                                <div className="mt-8 bg-slate-50 rounded-2xl border border-slate-200 p-2 relative">
                                    {isAgentOrAdmin && (
                                        <div className="flex justify-between items-center mb-2 absolute -top-10 left-0 right-2 w-full px-2">
                                            {isAgent && (
                                                <button onClick={handleGenerateReply} disabled={isGenerating} className={`flex items-center gap-1.5 text-xs text-pink-700 hover:text-pink-800 bg-pink-100 hover:bg-pink-200 px-3 py-1.5 rounded-lg border border-pink-200 transition-all font-bold ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                    <Lightbulb size={12}/> {isGenerating ? 'Generating...' : 'Generate AI Reply'}
                                                </button>
                                            )}
                                            <label className="flex items-center gap-2 text-sm cursor-pointer text-slate-500 hover:text-amber-600 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm ml-auto font-medium">
                                                <input
                                                    type="checkbox"
                                                    checked={isInternal}
                                                    onChange={(e) => setIsInternal(e.target.checked)}
                                                    className="accent-amber-500 w-4 h-4 cursor-pointer"
                                                />
                                                <Lock size={14} className={isInternal ? 'text-amber-600' : ''} /> {isInternal ? <span className="text-amber-600 font-bold">Internal Only</span> : <span>Make Internal Note</span>}
                                            </label>
                                        </div>
                                    )}
                                    <div className="flex gap-2 mt-4">
                                        <textarea
                                            rows={3}
                                            placeholder={isInternal ? "Type an internal note to your team..." : "Type your reply..."}
                                            value={reply}
                                            onChange={(e) => setReply(e.target.value)}
                                            className={`w-full bg-white rounded-xl border border-slate-200 p-4 text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none transition-all shadow-sm ${isInternal ? 'placeholder-amber-400' : 'placeholder-slate-400'}`}
                                        ></textarea>
                                        <button
                                            onClick={handleSend}
                                            className={`flex items-center justify-center shrink-0 w-14 h-auto rounded-xl shadow-sm transition-all ${isInternal ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                                        >
                                            <Send size={20} className="text-white ml-[-2px] mt-[2px]" />
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>

                {isAgentOrAdmin && (
                    <div className="space-y-6">
                        <div className="bg-pink-50 border border-pink-100 rounded-2xl p-6 overflow-hidden relative shadow-sm">
                            <h3 className="relative z-10 flex items-center gap-2 text-pink-700 font-bold text-lg mb-4 border-b border-pink-200 pb-3">
                                <BrainCircuit size={20} /> AI Agent Copilot
                            </h3>

                            <div className="relative z-10 space-y-5">
                                <div>
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-pink-700 mb-2">
                                        <span>Confidence Score</span>
                                        <span className="text-pink-700">{ticket.confidence_score ? (ticket.confidence_score * 1).toFixed(1) : '0'}%</span>
                                    </div>
                                    <div className="w-full bg-pink-100 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-pink-400 to-purple-400 h-2 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${ticket.confidence_score || 0}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="bg-white/60 p-4 rounded-xl border border-pink-100 shadow-sm">
                                    <span className="block text-xs uppercase font-bold text-pink-600 mb-1">Suggested Priority</span>
                                    <p className="text-sm text-pink-900 font-bold">{ticket.suggested_priority || "N/A"}</p>
                                </div>

                                <div className="bg-white/60 p-4 rounded-xl border border-pink-100 shadow-sm">
                                    <span className="block text-xs uppercase font-bold text-pink-600 mb-1">AI Reasoning Engine</span>
                                    <p className="text-sm font-mono text-pink-900 leading-relaxed bg-pink-100/50 p-3 rounded-lg border border-pink-200 mt-2">
                                        {ticket.reasoning || "AI agent has not analyzed this payload yet. Standing by..."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {ticket.status !== 'Closed' && (
                            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mt-6">
                                <h3 className="font-bold text-lg text-slate-800 mb-4 border-b border-slate-100 pb-3">Quick Actions</h3>
                                
                                {isAgentOrAdmin && ticket.status !== 'Resolved' && (ticket.sla_extension_status === 'None' || ticket.sla_extension_status === 'Denied' || !ticket.sla_extension_status) && (
                                    <button onClick={handleRequestSLA} className="w-full py-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 font-bold rounded-xl transition-all shadow-sm flex justify-center items-center gap-2 mb-3">
                                        <Clock size={18} /> Request SLA Extension
                                    </button>
                                )}

                                {isAgentOrAdmin && ticket.status !== 'Resolved' && ticket.sla_extension_status === 'Requested' && (
                                    <div className="w-full py-3 bg-slate-100 border border-slate-200 text-slate-500 font-bold rounded-xl shadow-sm flex justify-center items-center gap-2 mb-3 opacity-70 cursor-not-allowed">
                                        <Clock size={18} /> SLA Extension Pending Approval
                                    </div>
                                )}
                                
                                {isAgent && ticket.status !== 'Resolved' && (
                                    <button onClick={() => handleStatusUpdate('Resolved')} className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold rounded-xl transition-all shadow-sm flex justify-center items-center gap-2 mb-3">
                                        <CheckCircle size={18} /> Mark as Resolved
                                    </button>
                                )}
                                
                                {user.role === 'Admin' && (
                                    <button onClick={() => handleStatusUpdate('Closed')} className="w-full py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold rounded-xl transition-all shadow-sm flex justify-center items-center gap-2">
                                        <Lock size={18} /> Administrative Force Close
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
