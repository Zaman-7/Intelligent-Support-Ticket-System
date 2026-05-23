import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { Clock, BrainCircuit, User, AlertTriangle } from 'lucide-react';

export default function AgentDashboard() {
    const [tickets, setTickets] = useState([]);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        fetchActiveTickets();
    }, []);

    const fetchActiveTickets = async () => {
        try {
            const res = await api.get('/tickets/active');
            setTickets(res.data);
        } catch (err) { console.error('Error fetching tickets'); }
    };

    const getSLATimer = (dateStr) => {
        if (!dateStr) return null;
        const diff = new Date(dateStr) - new Date();
        if (diff < 0) return <span className="text-red-700 font-bold bg-red-100 px-2.5 py-0.5 rounded-md border border-red-200 text-[10px]">BREACHED</span>;
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff / (1000 * 60)) % 60);
        
        return (
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 w-max ${hours < 2 ? 'bg-amber-100 text-amber-700 border-amber-200 animate-pulse' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                <Clock size={10} /> {hours}H {mins}M REMAINING
            </span>
        );
    };

    const TicketCard = ({ t }) => (
        <div 
            onClick={(e) => { e.stopPropagation(); navigate(`/ticket/${t.ticket_id}`); }}
            className="bg-white border border-slate-200 p-5 rounded-2xl cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group overflow-hidden relative shadow-sm"
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex gap-2 items-center">
                    <span className="text-slate-500 font-mono text-xs font-bold leading-none">#{t.ticket_id}</span>
                    <span className={`px-2 py-0.5 text-[0.6rem] uppercase font-bold rounded-md border ${t.priority === 'Critical' ? 'bg-red-50 border-red-200 text-red-700' : t.priority === 'High' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>{t.priority}</span>
                </div>
                {getSLATimer(t.sla_due_date)}
            </div>
            
            <h4 className="text-slate-800 font-bold text-sm mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">{t.subject}</h4>
            
            <div className="flex items-center gap-2 mb-4 bg-slate-50 border border-slate-100 w-max px-2.5 py-1 rounded-md text-xs text-slate-600 font-medium">
                <User size={12}/> {t.customer_name}
            </div>
            
            <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs">
                {t.confidence_score ? (
                    <div className="flex items-center gap-1.5 text-purple-700 font-bold bg-purple-50 px-2 py-1 rounded-md border border-purple-100">
                        <BrainCircuit size={12}/> {(t.confidence_score * 1).toFixed(1)}% Score
                    </div>
                ) : (
                    <div className="text-slate-500 italic">No AI Scan</div>
                )}
            </div>
        </div>
    );

    const openQueue = tickets.filter(t => t.status === 'Open');
    const progressQueue = tickets.filter(t => t.status === 'In Progress');

    return (
        <div className="p-8 max-w-[1600px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-full bg-slate-50">
            <div className="mb-6 shrink-0">
                <h1 className="text-3xl font-bold tracking-tight text-slate-800 mb-2">Workspace Kanban</h1>
                <p className="text-slate-500 font-medium">Review Open queues and process Active escalations.</p>
            </div>

            <div className="flex flex-1 gap-6 overflow-hidden pb-4">
                {/* Swimlane: Open */}
                <div className="flex-1 bg-slate-100 rounded-3xl border border-slate-200 flex flex-col min-w-[350px] shadow-sm">
                    <div className="p-5 border-b border-slate-200 bg-white/50 rounded-t-3xl shrink-0 sticky top-0 z-10 backdrop-blur-sm">
                        <h2 className="text-slate-800 font-bold flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm"></span> Open Queue
                            </span>
                            <span className="bg-slate-200 text-slate-700 text-xs px-3 py-1 rounded-full font-bold">{openQueue.length}</span>
                        </h2>
                    </div>
                    <div className="p-4 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
                        {openQueue.length > 0 ? openQueue.map(t => <TicketCard key={t.ticket_id} t={t} />) : <div className="text-slate-500 text-center font-medium text-sm py-10 border border-slate-200 rounded-2xl border-dashed bg-slate-50">No open tickets.</div>}
                    </div>
                </div>

                {/* Swimlane: In Progress */}
                <div className="flex-1 bg-slate-100 rounded-3xl border border-slate-200 flex flex-col min-w-[350px] shadow-sm">
                    <div className="p-5 border-b border-slate-200 bg-white/50 rounded-t-3xl shrink-0 sticky top-0 z-10 backdrop-blur-sm">
                        <h2 className="text-slate-800 font-bold flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm animate-pulse"></span> In Progress
                            </span>
                            <span className="bg-slate-200 text-slate-700 text-xs px-3 py-1 rounded-full font-bold">{progressQueue.length}</span>
                        </h2>
                    </div>
                    <div className="p-4 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
                        {progressQueue.length > 0 ? progressQueue.map(t => <TicketCard key={t.ticket_id} t={t} />) : <div className="text-slate-500 text-center font-medium text-sm py-10 border border-slate-200 rounded-2xl border-dashed bg-slate-50">No tickets in progress.</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
