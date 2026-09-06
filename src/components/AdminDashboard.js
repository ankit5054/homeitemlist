import React, { useMemo, useState } from 'react';

const emptyForm = { en: '', hi: '', unit: 'pc' };

const AdminDashboard = ({ items, onItemsChange, onBack, sheetConnected, sheetConfigured, onConnectSheet, onDisconnectSheet }) => {
  const [authenticated, setAuthenticated] = useState(sheetConnected);
  const [loginError, setLoginError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingName, setEditingName] = useState(null);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [connecting, setConnecting] = useState(false);

  const visibleItems = useMemo(() => items.filter(entry => `${entry.item.en} ${entry.item.hi}`.toLowerCase().includes(query.toLowerCase())), [items, query]);

  const submitItem = async event => {
    event.preventDefault();
    if (!sheetConnected) { setSaveMessage('Connect Google Sheets before saving changes.'); return; }
    const en = form.en.trim();
    const hi = form.hi.trim() || en;
    if (!en) return;
    const nextItem = { item: { en, hi }, unit: [{ en: form.unit, hi: ({ kg: 'किलो', g: 'ग्राम', L: 'लीटर', pkt: 'पैकेट', pc: 'पीस', set: 'सेट' })[form.unit] || form.unit }] };
    const next = editingName ? items.map(entry => entry.item.en === editingName ? nextItem : entry) : [...items, nextItem];
    setSaving(true);
    setSaveMessage('');
    try {
      await onItemsChange(next, { action: editingName ? 'update' : 'create', originalName: editingName, item: { en, hi, unit: form.unit } });
      setForm(emptyForm);
      setEditingName(null);
      setSaveMessage('Saved to Google Sheet.');
    } catch (error) {
      setSaveMessage(error.message || 'The item could not be saved.');
    } finally { setSaving(false); }
  };

  const edit = entry => { setEditingName(entry.item.en); setForm({ en: entry.item.en, hi: entry.item.hi, unit: entry.unit[0].en }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const remove = async name => {
    if (!sheetConnected) { setSaveMessage('Connect Google Sheets before deleting items.'); return; }
    if (!window.confirm(`Delete “${name}” from the catalogue?`)) return;
    setSaving(true);
    setSaveMessage('');
    try {
      await onItemsChange(items.filter(entry => entry.item.en !== name), { action: 'delete', name });
      setSaveMessage('Deleted from Google Sheet.');
    } catch (error) { setSaveMessage(error.message || 'The item could not be deleted.'); }
    finally { setSaving(false); }
  };
  const logout = async () => { await onDisconnectSheet(); setAuthenticated(false); };
  const connect = async () => {
    setConnecting(true);
    setLoginError('');
    try { await onConnectSheet(); setAuthenticated(true); }
    catch (error) { setLoginError(error.message || 'Google sign-in failed.'); }
    finally { setConnecting(false); }
  };

  if (!authenticated) return <main className="admin-login-page"><button className="back-link" onClick={onBack}>← Back to shopping</button><section className="admin-login"><span className="google-mark" aria-hidden="true">G</span><p className="eyebrow">Restricted access</p><h1>Admin sign in</h1><p>Continue with an approved Google test-user account to manage the HomeList catalogue.</p>{loginError && <div className="form-error" role="alert">{loginError}</div>}<button className="google-login-button" disabled={connecting || !sheetConfigured} onClick={connect}><span aria-hidden="true">G</span>{connecting ? 'Connecting…' : 'Continue with Google'}</button>{!sheetConfigured && <small className="login-hint">Google OAuth is not configured in the environment.</small>}</section></main>;

  return <main className="admin-page">
    <header className="admin-header"><div><p className="eyebrow">HomeList control room</p><h1>Item catalogue</h1><p>Create, update, and remove shopping items.</p></div><div className="admin-header-actions"><button className="ghost-button" onClick={onBack}>View shop</button><button className="danger-button" onClick={logout}>Sign out</button></div></header>
    <section className="admin-summary"><div><strong>{items.length}</strong><span>Total items</span></div><div><strong>{new Set(items.map(item => item.unit[0].en)).size}</strong><span>Unit types</span></div><div><strong>{sheetConnected ? 'Sheet' : 'Local'}</strong><span>Storage mode</span></div></section>
    {saveMessage && <div className="save-message" role="status">{saveMessage}</div>}
    <div className="admin-layout"><form className="item-form" onSubmit={submitItem}><div className="section-title"><h2>{editingName ? 'Edit item' : 'Add a new item'}</h2><p>English name is used as the unique identifier.</p></div><label>English name<input required placeholder="e.g. Basmati rice" value={form.en} onChange={event => setForm({ ...form, en: event.target.value })} /></label><label>Hindi name<input placeholder="e.g. बासमती चावल" value={form.hi} onChange={event => setForm({ ...form, hi: event.target.value })} /></label><label>Unit<select value={form.unit} onChange={event => setForm({ ...form, unit: event.target.value })}><option value="pc">Piece</option><option value="kg">Kilogram</option><option value="g">Gram</option><option value="L">Litre</option><option value="pkt">Packet</option><option value="set">Set</option></select></label><div className="form-actions"><button className="primary-button" disabled={saving || !sheetConnected} type="submit">{saving ? 'Saving…' : editingName ? 'Save changes' : 'Add item'}</button>{editingName && <button className="ghost-button" type="button" onClick={() => { setEditingName(null); setForm(emptyForm); }}>Cancel</button>}</div></form>
      <section className="catalogue-panel"><div className="catalogue-toolbar"><div className="section-title"><h2>All items</h2><p>{visibleItems.length} entries shown</p></div><input aria-label="Search catalogue" placeholder="Search catalogue" value={query} onChange={event => setQuery(event.target.value)} /></div><div className="admin-table"><div className="admin-table-head"><span>Item</span><span>Hindi</span><span>Unit</span><span>Actions</span></div>{visibleItems.map(entry => <div className="admin-table-row" key={entry.item.en}><strong>{entry.item.en}</strong><span>{entry.item.hi}</span><span className="unit-chip">{entry.unit[0].en}</span><span className="row-actions"><button disabled={saving || !sheetConnected} onClick={() => edit(entry)}>Edit</button><button disabled={saving || !sheetConnected} className="delete-text" onClick={() => remove(entry.item.en)}>Delete</button></span></div>)}</div></section>
    </div>
  </main>;
};

export default AdminDashboard;
