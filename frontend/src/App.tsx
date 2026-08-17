import React, { useState, useEffect, useRef, useCallback } from 'react';
import Swal from 'sweetalert2';
import {
  api, getUsername, isLoggedIn, clearAuth, setUnauthorizedCallback,
} from './services/api';
import type { Note, Category } from './services/api';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import {
  BookOpen, Plus, Archive, Trash2, Edit3, X,
  LogOut, FolderPlus, Menu, ArchiveRestore, Tag,
} from 'lucide-react';
import agustinAvatar from './assets/agustindev.jpg';

// ─── Category Multi-Select ────────────────────────────────────────────────────
function CategorySelect({
  categories, selected, onChange,
}: { categories: Category[]; selected: number[]; onChange: (ids: number[]) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const toggle = (id: number) =>
    onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]);

  return (
    <div className="cat-dropdown" ref={ref}>
      <div className={`cat-multi-box ${open ? 'open' : ''}`} onClick={() => setOpen(o => !o)}>
        {selected.length === 0
          ? <span className="cat-placeholder">Select categories…</span>
          : categories.filter(c => selected.includes(c.id)).map(c => (
            <span key={c.id} className="cat-chip">
              {c.name}
              <span className="cat-chip-x" onClick={e => { e.stopPropagation(); toggle(c.id); }}>
                <X size={10} />
              </span>
            </span>
          ))
        }
      </div>
      {open && (
        <div className="cat-list">
          {categories.length === 0
            ? <div className="cat-list-empty">No categories yet</div>
            : categories.map(c => (
              <div
                key={c.id}
                className={`cat-list-item ${selected.includes(c.id) ? 'selected' : ''}`}
                onClick={() => toggle(c.id)}
              >
                {selected.includes(c.id) ? '✓ ' : ''}{c.name}
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}

// ─── Note Form Modal (Create / Edit) ─────────────────────────────────────────
function NoteModal({
  note, categories, onClose, onSave,
}: { note: Note | null; categories: Category[]; onClose: () => void; onSave: () => void }) {
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [catIds, setCatIds] = useState<number[]>(note?.categories.map(c => c.id) ?? []);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      if (note) {
        await api.updateNote(note.id, title, content, catIds);
      } else {
        await api.createNote(title, content, catIds);
      }
      onSave();
      onClose();
    } catch (err) {
      Swal.fire({
        icon: 'error', title: 'Error',
        text: err instanceof Error ? err.message : 'Failed to save note.',
        background: '#0d0d0d', color: '#e7e9ea', confirmButtonColor: '#1d9bf0',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{note ? 'Edit Note' : 'New Note'}</h3>
          <button className="btn btn-ghost" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="note-title">Title</label>
              <input id="note-title" type="text" value={title}
                onChange={e => setTitle(e.target.value)} placeholder="Note title…" required autoFocus />
            </div>
            <div className="form-group">
              <label htmlFor="note-content">Content</label>
              <textarea id="note-content" value={content} rows={5}
                onChange={e => setContent(e.target.value)} placeholder="What's on your mind?" />
            </div>
            <div className="form-group">
              <label>Categories</label>
              <CategorySelect categories={categories} selected={catIds} onChange={setCatIds} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-accent btn-sm" disabled={saving}>
              {saving ? <><span className="spinner-sm" /> Saving…</> : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Note Detail Modal ────────────────────────────────────────────────────────
function NoteDetailModal({
  note, onClose, onEdit, onArchive, onDelete,
}: { note: Note; onClose: () => void; onEdit: () => void; onArchive: () => void; onDelete: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Note</h3>
          <button className="btn btn-ghost" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="note-detail-title">{note.title}</div>
          <div className="note-detail-content">
            {note.content || <span style={{ color: 'var(--text-3)' }}>No content.</span>}
          </div>
          {note.categories.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: '1rem' }}>
              {note.categories.map(c => <span key={c.id} className="badge">{c.name}</span>)}
            </div>
          )}
          <div className="note-detail-actions">
            <button className="btn btn-outline btn-sm" onClick={onEdit}>
              <Edit3 size={14} /> Edit
            </button>
            <button className="btn btn-outline btn-sm" onClick={onArchive}>
              {note.archived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
              {note.archived ? 'Unarchive' : 'Archive'}
            </button>
            <button
              className="btn btn-sm"
              style={{ marginLeft: 'auto', color: 'var(--danger)', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)' }}
              onClick={onDelete}
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Category Manager Modal ───────────────────────────────────────────────────
function CategoryManagerModal({
  categories, onClose, onRefresh,
}: { categories: Category[]; onClose: () => void; onRefresh: () => void }) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await api.createCategory(name.trim());
      setName('');
      onRefresh();
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to create category.', background: '#0d0d0d', color: '#e7e9ea', confirmButtonColor: '#1d9bf0' });
    } finally { setSaving(false); }
  };

  const handleDelete = async (cat: Category) => {
    const r = await Swal.fire({
      title: 'Delete category?', text: `"${cat.name}" will be removed from all notes.`,
      icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Delete', cancelButtonText: 'Cancel',
      confirmButtonColor: '#f4212e', cancelButtonColor: '#2f3336',
      background: '#0d0d0d', color: '#e7e9ea',
    });
    if (!r.isConfirmed) return;
    try { await api.deleteCategory(cat.id); onRefresh(); }
    catch { Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to delete.', background: '#0d0d0d', color: '#e7e9ea', confirmButtonColor: '#1d9bf0' }); }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Manage Categories</h3>
          <button className="btn btn-ghost" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: '.5rem', marginBottom: '1.25rem' }}>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="New category name…" required style={{ flex: 1 }} />
            <button type="submit" className="btn btn-accent btn-sm" disabled={saving}>
              {saving ? <span className="spinner-sm" /> : <Plus size={16} />}
            </button>
          </form>
          {categories.length === 0
            ? <p style={{ color: 'var(--text-2)', fontSize: '.88rem' }}>No categories yet.</p>
            : <ul style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
              {categories.map(cat => (
                <li key={cat.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '.55rem .85rem', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                }}>
                  <span style={{ fontSize: '.9rem' }}>{cat.name}</span>
                  <button className="btn btn-danger-ghost" onClick={() => handleDelete(cat)}>
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          }
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline btn-sm" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton Loading ─────────────────────────────────────────────────────────
function NotesSkeleton() {
  return (
    <div className="loading-grid">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="sk-line sk-title" />
          <div className="sk-line sk-text" />
          <div className="sk-line sk-text-s" />
        </div>
      ))}
    </div>
  );
}

// ─── Simple in-memory cache ───────────────────────────────────────────────────
const cache: Record<string, { data: Note[]; ts: number }> = {};
const CACHE_TTL = 30_000; // 30s



function invalidateCache() {
  Object.keys(cache).forEach(k => delete cache[k]);
}

// ─── Main App ─────────────────────────────────────────────────────────────────
type Screen = 'login' | 'register' | 'app';

export default function App() {
  const [screen, setScreen] = useState<Screen>(isLoggedIn() ? 'app' : 'login');
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [viewMode, setViewMode] = useState<'active' | 'archived'>('active');
  const [catFilter, setCatFilter] = useState<number | undefined>(undefined);

  const [loadingNotes, setLoadingNotes] = useState(false);
  const [loadingCats, setLoadingCats] = useState(false);

  // Modals
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [detailNote, setDetailNote] = useState<Note | null>(null);
  const [catManagerOpen, setCatManagerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const username = getUsername();

  // Register unauthorised callback so api.ts can force-logout on 401/403
  useEffect(() => {
    setUnauthorizedCallback(() => {
      setScreen('login');
      setNotes([]);
      setCategories([]);
    });
  }, []);

  const fetchCategories = useCallback(async () => {
    setLoadingCats(true);
    try { setCategories(await api.getCategories()); }
    catch { /* handled by api.ts */ }
    finally { setLoadingCats(false); }
  }, []);

  const fetchNotes = useCallback(async (bust = false) => {
    const key = `${viewMode}-${catFilter ?? 'all'}`;
    
    if (bust) {
      invalidateCache();
    }
    
    const now = Date.now();
    const cached = cache[key];
    const isCacheValid = cached && (now - cached.ts < CACHE_TTL);
    
    if (isCacheValid && !bust) {
      setNotes(cached.data);
      // Background revalidation
      try {
        const fetcher = viewMode === 'active'
          ? () => api.getActiveNotes(catFilter)
          : () => api.getArchivedNotes(catFilter);
        const freshData = await fetcher();
        cache[key] = { data: freshData, ts: Date.now() };
        setNotes(freshData);
      } catch {
        /* ignore background load errors */
      }
      return;
    }
    
    setLoadingNotes(true);
    try {
      const fetcher = viewMode === 'active'
        ? () => api.getActiveNotes(catFilter)
        : () => api.getArchivedNotes(catFilter);
      const data = await fetcher();
      cache[key] = { data, ts: Date.now() };
      setNotes(data);
    } catch { /* handled by api.ts */ }
    finally { setLoadingNotes(false); }
  }, [viewMode, catFilter]);

  useEffect(() => {
    if (screen === 'app') { fetchCategories(); }
  }, [screen, fetchCategories]);

  useEffect(() => {
    if (screen === 'app') { fetchNotes(); }
  }, [screen, viewMode, catFilter, fetchNotes]);

  const handleLogout = () => {
    clearAuth(); invalidateCache();
    setScreen('login'); setNotes([]); setCategories([]);
  };

  const swal = (opts: any) =>
    Swal.fire({ background: '#0d0d0d', color: '#e7e9ea', ...opts });

  const handleDeleteNote = async (note: Note) => {
    const r = await swal({
      title: 'Delete note?', text: `"${note.title}" will be permanently deleted.`,
      icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Delete', cancelButtonText: 'Cancel',
      confirmButtonColor: '#f4212e', cancelButtonColor: '#2f3336',
    });
    if (!r.isConfirmed) return;
    try { await api.deleteNote(note.id); setDetailNote(null); fetchNotes(true); }
    catch { swal({ icon: 'error', title: 'Error', text: 'Failed to delete note.', confirmButtonColor: '#1d9bf0' }); }
  };

  const handleToggleArchive = async (note: Note) => {
    const action = note.archived ? 'Unarchive' : 'Archive';
    const r = await swal({
      title: `${action} note?`,
      text: `"${note.title}" will be ${note.archived ? 'moved back to active' : 'archived'}.`,
      icon: 'question', showCancelButton: true,
      confirmButtonText: action, cancelButtonText: 'Cancel',
      confirmButtonColor: note.archived ? '#00ba7c' : '#ffd400',
      cancelButtonColor: '#2f3336',
    });
    if (!r.isConfirmed) return;
    try {
      note.archived ? await api.unarchiveNote(note.id) : await api.archiveNote(note.id);
      setDetailNote(null); fetchNotes(true);
    } catch { swal({ icon: 'error', title: 'Error', text: 'Failed to update note.', confirmButtonColor: '#1d9bf0' }); }
  };

  if (screen === 'login')    return <LoginPage    onLogin={() => setScreen('app')} onGoRegister={() => setScreen('register')} />;
  if (screen === 'register') return <RegisterPage onRegister={() => setScreen('app')} onGoLogin={() => setScreen('login')} />;

  return (
    <>
      {/* ── Top Header ── */}
      <div className="top-header">
        <div className="top-header-inner">
          {/* Left: logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
            <div className="top-header-logo">
              <BookOpen size={22} color="#1d9bf0" />
              <span>NotesApp</span>
            </div>
          </div>

          {/* Center: tabs */}
          <div className="top-header-tabs">
            <button className={`tab-btn ${viewMode === 'active' ? 'active' : ''}`} onClick={() => setViewMode('active')}>
              Active
            </button>
            <button className={`tab-btn ${viewMode === 'archived' ? 'active' : ''}`} onClick={() => setViewMode('archived')}>
              Archived
            </button>
          </div>

          {/* Right: actions */}
          <div className="top-header-actions">
            <button className="btn btn-outline btn-sm" onClick={() => setCatManagerOpen(true)}>
              <FolderPlus size={15} /><span>Categories</span>
            </button>
            <button className="btn btn-accent btn-sm" onClick={() => { setEditingNote(null); setNoteModalOpen(true); }}>
              <Plus size={15} /><span>New Note</span>
            </button>
            {/* Hamburger (only visible on mobile) */}
            <button className="hamburger btn-ghost" onClick={() => setSidebarOpen(o => !o)}>
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="main-layout">
        {/* Mobile overlay */}
        {sidebarOpen && <div className="mob-overlay" onClick={() => setSidebarOpen(false)} />}

        {/* ── Sidebar (categories only) ── */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          {/* Sidebar Header (mobile drawer brand) */}
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <BookOpen size={22} color="#1d9bf0" />
              <span>NotesApp</span>
            </div>
            <button className="sidebar-close btn-ghost" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>
          
          {/* Mobile-only view mode selector */}
          <div className="sidebar-view-modes">
            <button className={`sidebar-view-btn ${viewMode === 'active' ? 'active' : ''}`} onClick={() => { setViewMode('active'); setSidebarOpen(false); }}>
              <BookOpen size={16} style={{ marginRight: 8 }} />
              Active Notes
            </button>
            <button className={`sidebar-view-btn ${viewMode === 'archived' ? 'active' : ''}`} onClick={() => { setViewMode('archived'); setSidebarOpen(false); }}>
              <Archive size={16} style={{ marginRight: 8 }} />
              Archived Notes
            </button>
          </div>

          <div className="sidebar-title">
            <Tag size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            Categories
          </div>

          {/* All filter */}
          <div
            className={`cat-filter-item ${!catFilter ? 'active' : ''}`}
            onClick={() => { setCatFilter(undefined); setSidebarOpen(false); }}
          >
            <span>All notes</span>
          </div>

          {loadingCats
            ? <div style={{ padding: '.6rem .75rem', color: 'var(--text-3)', fontSize: '.82rem' }}>Loading…</div>
            : categories.map(cat => (
              <div
                key={cat.id}
                className={`cat-filter-item ${catFilter === cat.id ? 'active' : ''}`}
                onClick={() => { setCatFilter(cat.id); setSidebarOpen(false); }}
              >
                <span>{cat.name}</span>
              </div>
            ))
          }

          {/* User profile & logout at bottom */}
          <div style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
            <button
              className="sidebar-user-logout"
              onClick={handleLogout}
              title="Sign out"
            >
              <div className="user-info">
                {username === 'agustin'
                  ? <img src={agustinAvatar} alt="avatar" className="avatar" />
                  : <div className="avatar-placeholder" style={{ width: 28, height: 28 }}>{username?.[0]?.toUpperCase()}</div>
                }
                <span className="username">{username}</span>
              </div>
              <LogOut size={16} className="logout-icon" />
            </button>
          </div>
        </aside>

        {/* ── Notes Grid ── */}
        <main>
          {loadingNotes
            ? <NotesSkeleton />
            : notes.length === 0
              ? (
                <div className="empty-state">
                  <BookOpen size={48} color="var(--text-3)" />
                  <h3>{viewMode === 'active' ? 'No active notes' : 'No archived notes'}</h3>
                  <p>{viewMode === 'active' ? 'Create your first note to get started.' : 'Archive a note and it will appear here.'}</p>
                  {viewMode === 'active' && (
                    <button className="btn btn-accent btn-sm" onClick={() => { setEditingNote(null); setNoteModalOpen(true); }}>
                      <Plus size={14} /> New Note
                    </button>
                  )}
                </div>
              )
              : (
                <div className="notes-grid">
                  {notes.map(note => (
                    <div key={note.id} className="note-card" onClick={() => setDetailNote(note)}>
                      <div className="note-card-title">{note.title}</div>
                      {note.content && <div className="note-card-content">{note.content}</div>}
                      {note.categories.length > 0 && (
                        <div className="note-card-cats">
                          {note.categories.map(c => <span key={c.id} className="badge">{c.name}</span>)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
          }
        </main>
      </div>

      {/* ── Modals ── */}
      {noteModalOpen && (
        <NoteModal
          note={editingNote}
          categories={categories}
          onClose={() => { setNoteModalOpen(false); setEditingNote(null); }}
          onSave={() => fetchNotes(true)}
        />
      )}

      {detailNote && !noteModalOpen && (
        <NoteDetailModal
          note={detailNote}
          onClose={() => setDetailNote(null)}
          onEdit={() => { setEditingNote(detailNote); setDetailNote(null); setNoteModalOpen(true); }}
          onArchive={() => handleToggleArchive(detailNote)}
          onDelete={() => handleDeleteNote(detailNote)}
        />
      )}

      {catManagerOpen && (
        <CategoryManagerModal
          categories={categories}
          onClose={() => setCatManagerOpen(false)}
          onRefresh={() => { fetchCategories(); fetchNotes(true); }}
        />
      )}
    </>
  );
}
