import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const LIMIT = 10;

const History = () => {
  const [emails, setEmails]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]     = useState(0);
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetchHistory = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/emails/history?page=${p}&limit=${LIMIT}`);
      setEmails(data.emails);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(page); }, [page, fetchHistory]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    setDeleting(id);
    try {
      await axios.delete(`/api/emails/${id}`);
      fetchHistory(page);
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  const statusBadge = (s) => <span className={`badge badge-${s}`}>{s}</span>;
  const formatDate  = (d) => new Date(d).toLocaleString('en-IN', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📋 Email History</h1>
        <p className="page-subtitle">{total} campaign{total !== 1 ? 's' : ''} sent</p>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <span className="spinner spinner-dark" style={{ width: '2rem', height: '2rem' }}></span>
          </div>
        ) : emails.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <div className="empty-title">No email history</div>
            <p>Your sent campaigns will appear here.</p>
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Subject</th>
                    <th>Recipients</th>
                    <th>Status</th>
                    <th>Success / Fail</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {emails.map((e, i) => (
                    <tr key={e._id}>
                      <td style={{ color: 'var(--gray-400)', fontSize: '.8rem' }}>{(page - 1) * LIMIT + i + 1}</td>
                      <td>
                        <button
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600, fontSize: '.875rem', textAlign: 'left' }}
                          onClick={() => setSelected(e)}
                        >
                          {e.subject}
                        </button>
                      </td>
                      <td>{e.recipients.length}</td>
                      <td>{statusBadge(e.status)}</td>
                      <td>
                        <span style={{ color: 'var(--success)', fontWeight: 600 }}>{e.successCount}</span>
                        {' / '}
                        <span style={{ color: 'var(--danger)', fontWeight: 600 }}>{e.failCount}</span>
                      </td>
                      <td style={{ fontSize: '.8rem', color: 'var(--gray-500)' }}>{formatDate(e.createdAt)}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          disabled={deleting === e._id}
                          onClick={() => handleDelete(e._id)}
                        >
                          {deleting === e._id ? <span className="spinner"></span> : '🗑️'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'center', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(page - 1)}>← Prev</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setPage(p)}
                  >{p}</button>
                ))}
                <button className="btn btn-ghost btn-sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">📧 Email Details</h2>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <div className="form-label">Subject</div>
                <div style={{ fontWeight: 600, fontSize: '1rem' }}>{selected.subject}</div>
              </div>
              <div>
                <div className="form-label">Status</div>
                {statusBadge(selected.status)}
              </div>
              <div>
                <div className="form-label">Sent At</div>
                <div style={{ fontSize: '.875rem' }}>{formatDate(selected.createdAt)}</div>
              </div>
              <div>
                <div className="form-label">Recipients ({selected.recipients.length})</div>
                <div className="recipient-list" style={{ marginTop: '.3rem' }}>
                  {selected.recipients.map((r) => (
                    <span key={r} className={`tag ${selected.failedEmails.includes(r) ? '' : ''}`}
                      style={{ background: selected.failedEmails.includes(r) ? 'var(--danger-light)' : 'var(--success-light)',
                               color: selected.failedEmails.includes(r) ? '#991b1b' : '#065f46' }}>
                      {r}
                    </span>
                  ))}
                </div>
              </div>
              {selected.failedEmails?.length > 0 && (
                <div>
                  <div className="form-label">Failed Emails</div>
                  <div className="recipient-list" style={{ marginTop: '.3rem' }}>
                    {selected.failedEmails.map((r) => (
                      <span key={r} className="tag" style={{ background: 'var(--danger-light)', color: '#991b1b' }}>{r}</span>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <div className="form-label">Body</div>
                <div style={{ border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-sm)', padding: '1rem', background: 'var(--gray-50)', fontSize: '.875rem' }}
                  dangerouslySetInnerHTML={{ __html: selected.body }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
