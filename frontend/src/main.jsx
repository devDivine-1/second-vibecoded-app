import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUpRight, Check, CheckCircle2, Circle, ClipboardList, LoaderCircle, Plus, RefreshCw, Sparkles, Trash2 } from 'lucide-react';
import './styles.css';

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(detail || `Request failed (${response.status})`);
  }
  if (response.status === 204) return null;
  return response.json();
}

function normalizeTask(task) {
  return {
    ...task,
    id: String(task.id),
    title: task.title ?? task.name ?? '',
    completed: Boolean(task.completed ?? task.is_completed ?? false),
  };
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  async function loadTasks() {
    setLoading(true);
    setError('');
    try {
      const data = await request('/api/tasks');
      setTasks((Array.isArray(data) ? data : data.tasks || []).map(normalizeTask));
    } catch (err) {
      setError(`We couldn't load your tasks. ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadTasks(); }, []);

  const activeCount = tasks.filter((task) => !task.completed).length;
  const completedCount = tasks.length - activeCount;
  const visibleTasks = useMemo(() => tasks.filter((task) => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  }), [tasks, filter]);

  async function addTask(event) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle || saving) return;
    setSaving(true);
    setError('');
    try {
      const created = await request('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ title: cleanTitle }),
      });
      setTasks((current) => [normalizeTask(created), ...current]);
      setTitle('');
    } catch (err) {
      setError(`Couldn't add that task. ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(task) {
    setBusyId(task.id);
    setError('');
    try {
      const updated = await request(`/api/tasks/${encodeURIComponent(task.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ completed: !task.completed }),
      });
      const normalized = normalizeTask(updated || { ...task, completed: !task.completed });
      setTasks((current) => current.map((item) => item.id === task.id ? normalized : item));
    } catch (err) {
      setError(`Couldn't update that task. ${err.message}`);
    } finally {
      setBusyId(null);
    }
  }

  async function deleteTask(task) {
    setBusyId(task.id);
    setError('');
    try {
      await request(`/api/tasks/${encodeURIComponent(task.id)}`, { method: 'DELETE' });
      setTasks((current) => current.filter((item) => item.id !== task.id));
    } catch (err) {
      setError(`Couldn't delete that task. ${err.message}`);
    } finally {
      setBusyId(null);
    }
  }

  const today = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Daymark home">
          <span className="brand-mark"><Check size={18} strokeWidth={3} /></span>
          <span>daymark<span className="brand-period">.</span></span>
        </a>
        <span className="top-date">{today}</span>
        <a className="top-link" href="#tasks">My workspace <ArrowUpRight size={15} /></a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={14} /> A little clarity goes a long way</div>
          <h1>Make room for<br /><span>what matters.</span></h1>
          <p>One thoughtful step at a time. Keep your priorities close and your mind clear.</p>
        </div>
        <div className="hero-card" aria-label={`${activeCount} tasks remaining`}>
          <div className="hero-card-top"><span>YOUR MOMENTUM</span><span className="pulse-dot" /></div>
          <div className="momentum-number">{String(activeCount).padStart(2, '0')}<span> / {String(tasks.length).padStart(2, '0')}</span></div>
          <div className="progress-track"><span style={{ width: `${tasks.length ? (completedCount / tasks.length) * 100 : 0}%` }} /></div>
          <div className="momentum-caption">{tasks.length ? `${completedCount} of ${tasks.length} complete` : 'Your day starts here'}</div>
          <div className="card-decoration"><CheckCircle2 size={74} strokeWidth={1} /></div>
        </div>
      </section>

      <section className="workspace" id="tasks">
        <div className="section-heading">
          <div>
            <div className="eyebrow muted"><span className="section-spark">✳</span> YOUR LIST</div>
            <h2>Today’s focus</h2>
          </div>
          <button className="icon-button refresh-button" onClick={loadTasks} aria-label="Refresh tasks" title="Refresh tasks"><RefreshCw size={16} /></button>
        </div>

        <form className="add-form" onSubmit={addTask}>
          <span className="add-icon"><Plus size={19} /></span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Add a task to your list…" aria-label="New task title" maxLength={200} />
          <button className="add-button" type="submit" disabled={!title.trim() || saving}>{saving ? <LoaderCircle className="spin" size={17} /> : <>Add task <span>↗</span></>}</button>
        </form>

        {error && <div className="error-banner" role="alert">{error}<button onClick={() => setError('')} aria-label="Dismiss error">×</button></div>}

        <div className="list-toolbar">
          <div className="filter-tabs" role="tablist" aria-label="Filter tasks">
            {[['all', 'All tasks'], ['active', 'To do'], ['completed', 'Completed']].map(([key, label]) => (
              <button key={key} role="tab" aria-selected={filter === key} className={filter === key ? 'filter-tab selected' : 'filter-tab'} onClick={() => setFilter(key)}>{label}<span>{key === 'all' ? tasks.length : key === 'active' ? activeCount : completedCount}</span></button>
            ))}
          </div>
          <div className="list-count"><ClipboardList size={15} /> {activeCount} left</div>
        </div>

        <div className="task-list" aria-live="polite">
          {loading ? (
            <div className="empty-state"><LoaderCircle className="spin empty-icon" size={26} /><p>Gathering your list…</p></div>
          ) : visibleTasks.length ? visibleTasks.map((task, index) => (
            <article className={`task-row ${task.completed ? 'is-complete' : ''}`} key={task.id} style={{ '--row-index': index }}>
              <button className="task-check" onClick={() => toggleTask(task)} disabled={busyId === task.id} aria-label={task.completed ? `Mark ${task.title} incomplete` : `Complete ${task.title}`}>
                {busyId === task.id ? <LoaderCircle className="spin" size={18} /> : task.completed ? <span className="checked"><Check size={14} strokeWidth={3} /></span> : <Circle size={20} strokeWidth={1.7} />}
              </button>
              <span className="task-title">{task.title}</span>
              <span className="task-status">{task.completed ? 'Done' : 'In progress'}</span>
              <button className="delete-button" onClick={() => deleteTask(task)} disabled={busyId === task.id} aria-label={`Delete ${task.title}`} title="Delete task"><Trash2 size={16} /></button>
            </article>
          )) : (
            <div className="empty-state">
              <span className="empty-icon-wrap"><CheckCircle2 size={27} /></span>
              <p>{filter === 'completed' ? 'No completed tasks yet.' : filter === 'active' ? 'You’re all caught up.' : 'A fresh page. What would you like to get done?'}</p>
              <span className="empty-subtitle">{filter === 'all' ? 'Add your first task above and build a little momentum.' : 'Try another view or add a new task above.'}</span>
            </div>
          )}
        </div>
        <footer className="workspace-footer"><span>Small steps add up.</span><span>Made for a more focused day <span className="footer-star">✳</span></span></footer>
      </section>
      <div className="page-bottom" />
    </main>
  );
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
