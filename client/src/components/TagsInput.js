import React, { useState } from 'react';

const EmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TagsInput = ({ value, onChange, placeholder }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const addTag = (raw) => {
    const emails = raw.split(/[\s,;]+/).map((e) => e.trim()).filter(Boolean);
    const newTags = [];
    const invalid = [];

    for (const e of emails) {
      if (!EmailRegex.test(e))  { invalid.push(e); continue; }
      if (value.includes(e))    continue;
      newTags.push(e);
    }

    if (invalid.length) setError(`Invalid: ${invalid.join(', ')}`);
    else setError('');

    if (newTags.length) onChange([...value, ...newTags]);
    setInput('');
  };

  const removeTag = (email) => onChange(value.filter((e) => e !== email));

  const handleKeyDown = (e) => {
    if (['Enter', ',', ' ', 'Tab'].includes(e.key)) {
      e.preventDefault();
      if (input.trim()) addTag(input);
    }
    if (e.key === 'Backspace' && !input && value.length) {
      removeTag(value[value.length - 1]);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    addTag(e.clipboardData.getData('text'));
  };

  return (
    <>
      <div className="tags-input-wrap" onClick={() => document.getElementById('tag-field').focus()}>
        {value.map((email) => (
          <span key={email} className="tag">
            {email}
            <button type="button" className="tag-remove" onClick={() => removeTag(email)}>×</button>
          </span>
        ))}
        <input
          id="tag-field"
          className="tags-input-field"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={() => { if (input.trim()) addTag(input); }}
          placeholder={value.length === 0 ? (placeholder || 'Type email and press Enter…') : ''}
        />
      </div>
      {error && <div className="form-error">{error}</div>}
    </>
  );
};

export default TagsInput;
