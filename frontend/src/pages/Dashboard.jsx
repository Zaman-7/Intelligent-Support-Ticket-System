import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Users, CheckCircle, AlertTriangle, BrainCircuit, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const mockTickets = [
    { id: 101, subject: "Cannot access billing portal", category: "Billing", priority: "high", status: "open", user: "Alice Walker", date: "2 mins ago", aiScore: 92 },
    { id: 102, subject: "Need help upgrading plan", category: "Sales", priority: "medium", status: "in_progress", user: "Bob Jenkins", date: "15 mins ago", aiScore: null },
    { id: 103, subject: "Service outage in region US-West", category: "Technical Support", priority: "urgent", status: "open", user: "Tech Corp", date: "1 hr ago", aiScore: 98 },
    { id: 104, subject: "How to reset password?", category: "General", priority: "low", status: "resolved", user: "Diana Prince", date: "3 hrs ago", aiScore: 75 },
    { id: 105, subject: "Refund request for last month", category: "Billing", priority: "medium", status: "closed", user: "Evan Wright", date: "1 day ago", aiScore: null },
];

export default function Dashboard() {
    const navigate = useNavigate();

    return (
        <div className="page">
            <div className="header-title" style={{ marginBottom: '2rem' }}>Dashboard Overview</div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-info">
                        <span>Open Tickets</span>
                        <h3>1,248</h3>
                        <div style={{ color: 'var(--status-resolved)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', marginTop: '0.5rem' }}>
                            <ArrowUpRight size={16} /> 12% this week
                        </div>
                    </div>
                    <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--status-open)' }}>
                        <Ticket size={24} />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-info">
                        <span>Critical Issues</span>
                        <h3>45</h3>
                        <div style={{ color: 'var(--priority-urgent)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', marginTop: '0.5rem' }}>
                            <AlertTriangle size={16} /> Needs attention
                        </div>
                    </div>
                    <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--priority-urgent)' }}>
                        <AlertTriangle size={24} />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-info">
                        <span>Resolved Today</span>
                        <h3>392</h3>
                        <div style={{ color: 'var(--status-resolved)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', marginTop: '0.5rem' }}>
                            <ArrowUpRight size={16} /> 5% since yesterday
                        </div>
                    </div>
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--status-resolved)' }}>
                        <CheckCircle size={24} />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-info">
                        <span>AI Resolutions</span>
                        <h3>84%</h3>
                        <div style={{ color: 'var(--status-resolved)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', marginTop: '0.5rem' }}>
                            <ArrowUpRight size={16} /> High accuracy
                        </div>
                    </div>
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(236,72,153,0.1))', color: '#ec4899' }}>
                        <BrainCircuit size={24} />
                    </div>
                </div>
            </div>

            <div className="glass-panel">
                <div className="glass-panel-header">
                    <h2 className="glass-panel-title">Recent Tickets</h2>
                    <button className="btn btn-secondary">View All</button>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Ticket ID</th>
                                <th>Subject</th>
                                <th>Category</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockTickets.map(ticket => (
                                <tr key={ticket.id} onClick={() => navigate(`/ticket/${ticket.id}`)} style={{ cursor: 'pointer' }}>
                                    <td style={{ fontWeight: 500 }}>#{ticket.id}</td>
                                    <td>
                                        <div style={{ fontWeight: 500 }}>{ticket.subject}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>By {ticket.user}</div>
                                    </td>
                                    <td>
                                        {ticket.category}
                                        {ticket.aiScore && (
                                            <div className="ai-badge" style={{ marginTop: '0.25rem' }}>
                                                <BrainCircuit size={12} /> {ticket.aiScore}% Match
                                            </div>
                                        )}
                                    </td>
                                    <td><span className={`badge priority-${ticket.priority}`}>{ticket.priority}</span></td>
                                    <td><span className={`badge status-${ticket.status}`}>{ticket.status.replace('_', ' ')}</span></td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{ticket.date}</td>
                                    <td>
                                        <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }}>Open</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
