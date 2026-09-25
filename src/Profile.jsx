import React, { useEffect, useRef, useState } from 'react';
import { avatars, lessons } from './data.js';

const Button = ({ children, kind = '', ...props }) => <button className={`button ${kind}`} {...props}>{children}</button>;
const Card = ({ title, extra, children }) => <section className="card"><div className="card-head"><h2>{title}</h2>{extra}</div>{children}</section>;

export default function ProfileView({ data, update, money, notify }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(data.name);
  const [avatar, setAvatar] = useState(data.avatar);
  const [selected, setSelected] = useState(null);
  const detailRef = useRef(null);
  useEffect(() => {
    if (!selected) return;
    const before = document.activeElement;
    detailRef.current?.focus();
    const onKey = event => {
      if (event.key === 'Escape') setSelected(null);
      if (event.key === 'Tab') {
        const items = [...detailRef.current.querySelectorAll('button:not([disabled])')];
        if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1)?.focus(); }
        else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0]?.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); before?.focus?.(); };
  }, [selected]);
  const lessonsDone = Object.values(data.lessonProgress || {}).filter(Boolean).length;
  const entries = [
    ['firstSaver', 'First Saver', 'Add savings toward a goal', data.goals.some(g => (g.saved || 0) > 0) ? 1 : 0, 1],
    ['budgetMaster', 'Budget Master', 'Save five monthly budgets', Number(data.budgetCount) || 0, 5],
    ['quizStreak', 'Quiz Streak', 'Answer five questions correctly in a row', Number(data.quizStreak) || 0, 5],
    ['smartSpender', 'Smart Spender', 'Track five expenses', data.expenses.length, 5],
    ['learningStarter', 'Learning Starter', 'Complete your first lesson', lessonsDone, 1],
    ['goalSetter', 'Goal Setter', 'Create your first savings goal', data.goals.length, 1],
    ['marketExplorer', 'Market Explorer', 'Make a virtual market trade', data.tradeHistory.length, 1],
    ['steadyHabit', 'Steady Habit', 'Reach a three day streak', Number(data.streak) || 0, 3]
  ].map(([id, title, description, progress, target]) => ({
    id, title, description, progress: Math.min(Number(progress) || 0, target), target,
    earned: (Number(progress) || 0) >= target
  }));

  const save = () => {
    if (!name.trim()) { notify('Name cannot be blank.'); return; }
    update(s => ({ ...s, name: name.trim(), avatar }));
    setEditing(false);
    notify('Profile updated');
  };

  return <>
    <div className="page-title"><div><span className="eyebrow">YOUR PROGRESS</span><h1>Achievements &amp; profile</h1><p>See what you have learned, celebrate milestones and manage your local profile.</p></div></div>
    <div className="profile-layout">
      <Card title="Learner profile" extra={<Button kind="link" onClick={() => setEditing(!editing)}>{editing ? 'Cancel' : 'Edit profile'}</Button>}>
        <div className="profile-identity"><span className="profile-avatar">{avatars.find(a => a.id === data.avatar)?.emoji || '🚀'}</span><div><h2>{data.name}</h2><p>{avatars.find(a => a.id === data.avatar)?.name || 'Learner'} · Level {data.level || 1}</p></div></div>
        {editing && <div className="profile-edit"><label className="field-label">Display name<input value={name} maxLength="28" onChange={e => setName(e.target.value)} /></label><div className="persona-row">{avatars.map(a => <button type="button" className={`persona-mini ${avatar === a.id ? 'active' : ''}`} onClick={() => setAvatar(a.id)} key={a.id} aria-label={a.name}>{a.emoji}</button>)}</div><Button onClick={save}>Save profile</Button></div>}
        <div className="profile-stat-grid"><div><small>Total XP</small><b>{data.points || 0}</b></div><div><small>Current streak</small><b>{data.streak || 0} days</b></div><div><small>Correct quiz answers</small><b>{data.quizzesCorrect || 0}</b></div><div><small>Lessons complete</small><b>{lessonsDone} / {lessons.length}</b></div><div><small>Virtual wallet</small><b>{money(data.wallet)}</b></div><div><small>Net practice assets</small><b>{money((Number(data.wallet) || 0) + (data.portfolio || []).reduce((n, p) => n + (Number(p.qty) || 0) * (Number(p.avgPrice) || 0), 0))}</b></div></div>
        <div className="level-progress"><div><b>Level {data.level || 1}</b><span>{1000 - (data.points || 0) % 1000} XP to next level</span></div><div className="progress-track"><i style={{ width: `${(data.points || 0) % 1000 / 10}%` }} /></div></div>
      </Card>
      <Card title="Achievements" extra={<span className="soft-tag">{entries.filter(a => a.earned).length}/{entries.length} unlocked</span>}>
        <p className="muted">Every badge is earned through your learning and practice activity.</p>
        <div className="achievement-grid">{entries.map(a => <button type="button" key={a.id} className={`achievement ${a.earned ? 'earned' : ''}`} onClick={() => setSelected(a)} aria-label={`${a.title}, ${a.progress} of ${a.target}`}><span>{a.earned ? '✦' : '◇'}</span><div className="achievement-main"><b>{a.title}</b><small>{a.earned ? 'Unlocked' : a.description}</small><i className="achievement-track"><em style={{ width: `${Math.min(100, a.progress / a.target * 100)}%` }} /></i><small className="achievement-count">{a.progress} / {a.target} {a.earned ? 'complete' : 'progress'}</small></div></button>)}</div>
        <div className="profile-actions"><Button kind="secondary" onClick={() => { update(s => ({ ...s, soundEnabled: !s.soundEnabled })); notify(`Sound ${data.soundEnabled ? 'disabled' : 'enabled'}`); }}>{data.soundEnabled ? 'Sound on' : 'Sound off'}</Button><Button kind="quiet" onClick={() => { if (confirm('Reset all FinTeens progress saved on this device? This cannot be undone.')) { localStorage.removeItem('finteens_data'); location.reload(); } }}>Reset local progress</Button></div>
      </Card>
    </div>
    {selected && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setSelected(null); }}><section ref={detailRef} tabIndex={-1} className="action-modal" role="dialog" aria-modal="true" aria-labelledby="badge-title"><button className="modal-close" onClick={() => setSelected(null)} aria-label="Close dialog">×</button><span className="eyebrow">ACHIEVEMENT</span><h2 id="badge-title">{selected.title}</h2><p className="muted">{selected.description}</p><div className="achievement-detail"><span>{selected.earned ? '✦' : '◇'}</span><b>{selected.earned ? 'Achievement unlocked' : `${selected.progress} of ${selected.target} progress`}</b><i className="achievement-track"><em style={{ width: `${Math.min(100, selected.progress / selected.target * 100)}%` }} /></i><Button kind="secondary" onClick={() => setSelected(null)}>Close</Button></div></section></div>}
  </>;
}
