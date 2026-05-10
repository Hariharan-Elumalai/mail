import React, { useState } from 'react';
import axios from 'axios';
import TagsInput from '../components/TagsInput';

const Compose = () => {
  const [form, setForm]     = useState({ subject: '', body: '' });
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState(null);
  const [errors, setErrors]         = useState({});

  const validate = () => {
    const e = {};
    if (!form.subject.trim())    e.subject    = 'Subject is required';
    if (!form.body.trim())       e.body       = 'Email body is required';
    if (recipients.length === 0) e.recipients = 'Add at least one recipient';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setResult(null);
    try {
      const { data } = await axios.post('/api/emails/send', {
        subject:    form.subject,
        body:       form.body,
        recipients,
      });
      setResult({ type: 'success', ...data });
      if (data.status === 'sent') {
        setForm({ subject: '', body: '' });
        setRecipients([]);
      }
    } catch (err) {
      setResult({ type: 'error', message: err.response?.data?.message || 'Failed to send emails' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({ subject: '', body: '' });
    setRecipients([]);
    setResult(null);
    setErrors({});
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">✍️ Compose Bulk Email</h1>
        <p className="page-subtitle">Fill in the details and send to multiple recipients at once</p>
      </div>

      {result && (
        <div className={`alert ${result.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {result.type === 'success' ? (
            <>
              ✅ {result.message}
              {result.failedEmails?.length > 0 && (
                <div style={{ marginTop: '.5rem' }}>
                  <strong>Failed:</strong> {result.failedEmails.join(', ')}
                </div>
              )}
            </>
          ) : (
            <>⚠️ {result.message}</>
          )}
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Recipients *</label>
            <TagsInput
              value={recipients}
              onChange={setRecipients}
              placeholder="Type email & press Enter or paste comma-separated list…"
            />
            {errors.recipients && <div className="form-error">{errors.recipients}</div>}
            <div className="form-hint">
              {recipients.length > 0
                ? `${recipients.length} recipient${recipients.length !== 1 ? 's' : ''} added`
                : 'Press Enter, comma, or space after each email. Paste multiple emails separated by commas.'}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Subject *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter email subject…"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              maxLength={200}
            />
            {errors.subject && <div className="form-error">{errors.subject}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Email Body *</label>
            <textarea
              className="form-control"
              placeholder="Write your email body here. HTML is supported…"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              rows={8}
            />
            {errors.body && <div className="form-error">{errors.body}</div>}
            <div className="form-hint">HTML formatting is supported (e.g., &lt;b&gt;bold&lt;/b&gt;, &lt;a href=""&gt;link&lt;/a&gt;)</div>
          </div>

          {/* Preview */}
          {form.body && (
            <div className="form-group">
              <label className="form-label">📄 Body Preview</label>
              <div
                style={{
                  border: '1.5px solid var(--gray-200)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem',
                  background: 'var(--gray-50)',
                  minHeight: '80px',
                  fontSize: '.9rem',
                }}
                dangerouslySetInnerHTML={{ __html: form.body }}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading
                ? <><span className="spinner"></span> Sending to {recipients.length} recipient{recipients.length !== 1 ? 's' : ''}…</>
                : `📤 Send to ${recipients.length || 0} Recipient${recipients.length !== 1 ? 's' : ''}`}
            </button>
            <button type="button" className="btn btn-ghost" onClick={handleReset} disabled={loading}>
              🗑️ Clear Form
            </button>
          </div>
        </form>
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <div className="card-title">💡 Tips</div>
        <ul style={{ color: 'var(--gray-600)', fontSize: '.875rem', lineHeight: '2', paddingLeft: '1.25rem' }}>
          <li>Use Gmail App Password (not your regular password) in the server .env file.</li>
          <li>Enable "Less secure app access" or use OAuth2 for production.</li>
          <li>HTML is supported in the body — use tags like &lt;b&gt;, &lt;a&gt;, &lt;ul&gt; etc.</li>
          <li>You can paste a comma-separated list of emails directly into the recipients field.</li>
        </ul>
      </div>
    </div>
  );
};

export default Compose;
