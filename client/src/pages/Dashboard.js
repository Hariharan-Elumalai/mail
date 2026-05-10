import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats]       = useState(null);
  const [recent, setRecent]     = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get('/api/emails/history?limit=5');
        const emails = data.emails;
        setRecent(emails);
        const total   = data.total;
        const sent    = emails.filter((e) => e.status === 'sent').length;
        const failed  = emails.filter((e) => e.status === 'failed').length;
        const partial = emails.filter((e) => e.status === 'partial').length;
        const totalRecipients = emails.reduce((a, e) => a + e.recipients.length, 0);
        setStats({ total, sent, failed, partial, totalRecipients });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const statusBadge = (s) => <span className={`badge badge-${s}`}>{s}</span>;
  const formatDate  = (d) => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'2-digit', hour:'2-digit', minute:'2-digit' });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">👋 Welcome, {user?.name?.split(' ')[0]}!</h1>
        <p className="page-subtitle">Here's your email campaign overview</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <span className="spinner spinner-dark" style={{ width: '2rem', height: '2rem' }}></span>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Campaigns</div>
              <div className="stat-value primary">{stats?.total ?? 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Successful</div>
              <div className="stat-value success">{stats?.sent ?? 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Failed</div>
              <div className="stat-value danger">{stats?.failed ?? 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Recipients Reached</div>
              <div className="stat-value">{stats?.totalRecipients ?? 0}</div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-title">⚡ Quick Actions</div>
            <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => navigate('/compose')}>
                ✍️ Compose New Mail
              </button>
              <button className="btn btn-ghost" onClick={() => navigate('/history')}>
                📋 View All History
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-title">🕐 Recent Campaigns</div>
            {recent.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <div className="empty-title">No emails sent yet</div>
                <p>Start by composing your first bulk email.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Recipients</th>
                      <th>Status</th>
                      <th>Sent At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((e) => (
                      <tr key={e._id} style={{ cursor: 'pointer' }} onClick={() => navigate('/history')}>
                        <td><strong>{e.subject}</strong></td>
                        <td>{e.recipients.length} recipient{e.recipients.length !== 1 ? 's' : ''}</td>
                        <td>{statusBadge(e.status)}</td>
                        <td>{formatDate(e.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
