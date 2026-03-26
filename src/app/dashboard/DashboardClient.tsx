'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from './dashboard.module.css'

type Project = {
  id: string
  name: string
  location: string | null
  date: string | null
  description: string | null
  created_at: string
}

type User = {
  id: string
  email?: string
}

export default function DashboardClient({
  user,
  projects,
}: {
  user: User
  projects: Project[]
}) {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className={styles.page}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>V</span>
          <span className={styles.logoText}>VANTA</span>
        </div>

        <nav className={styles.nav}>
          <a className={`${styles.navItem} ${styles.navActive}`} href="/dashboard">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2"/>
              <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2"/>
              <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2"/>
              <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
            Projects
          </a>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {user.email?.[0].toUpperCase() ?? 'U'}
            </div>
            <span className={styles.userEmail}>{user.email}</span>
          </div>
          <button className={styles.signOut} onClick={handleSignOut}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.pageTitle}>Projects</h1>
            <span className={styles.projectCount}>{projects.length}</span>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.viewToggle}>
              <button
                className={`${styles.viewBtn} ${view === 'grid' ? styles.viewBtnActive : ''}`}
                onClick={() => setView('grid')}
                aria-label="Grid view"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                  <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                  <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                  <rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                </svg>
              </button>
              <button
                className={`${styles.viewBtn} ${view === 'list' ? styles.viewBtnActive : ''}`}
                onClick={() => setView('list')}
                aria-label="List view"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <line x1="1" y1="3" x2="13" y2="3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  <line x1="1" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  <line x1="1" y1="11" x2="13" y2="11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Empty state */}
        {projects.length === 0 && (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect x="2" y="2" width="28" height="28" rx="4" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M10 16h12M16 10v12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className={styles.emptyTitle}>No projects yet</h2>
            <p className={styles.emptyText}>Projects added to your account will appear here.</p>
          </div>
        )}

        {/* Grid view */}
        {projects.length > 0 && view === 'grid' && (
          <div className={styles.grid}>
            {projects.map((project, i) => (
              <div
                key={project.id}
                className={styles.card}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {/* Placeholder scan preview */}
                <div className={styles.cardPreview}>
                  <div className={styles.cardPreviewInner}>
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" opacity="0.3">
                      <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="0.8"/>
                      <circle cx="20" cy="20" r="10" stroke="currentColor" strokeWidth="0.8"/>
                      <circle cx="20" cy="20" r="2" fill="currentColor"/>
                      <line x1="2" y1="20" x2="38" y2="20" stroke="currentColor" strokeWidth="0.8"/>
                      <line x1="20" y1="2" x2="20" y2="38" stroke="currentColor" strokeWidth="0.8"/>
                    </svg>
                  </div>
                  <div className={styles.cardBadge}>SCAN</div>
                </div>

                <div className={styles.cardBody}>
                  <h3 className={styles.cardName}>{project.name}</h3>
                  {project.location && (
                    <p className={styles.cardLocation}>
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                        <path d="M5.5 1C3.57 1 2 2.57 2 4.5c0 2.625 3.5 5.5 3.5 5.5S9 7.125 9 4.5C9 2.57 7.43 1 5.5 1zm0 4.75A1.25 1.25 0 114.25 4.5 1.25 1.25 0 015.5 5.75z" fill="currentColor"/>
                      </svg>
                      {project.location}
                    </p>
                  )}
                  {project.date && (
                    <p className={styles.cardDate}>{formatDate(project.date)}</p>
                  )}
                </div>

                <div className={styles.cardFooter}>
                  <a
                    href={`/viewer/${project.id}`}
                    className={styles.cardOpen}
                  >
                    Open viewer
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List view */}
        {projects.length > 0 && view === 'list' && (
          <div className={styles.list}>
            <div className={styles.listHeader}>
              <span>Name</span>
              <span>Location</span>
              <span>Date</span>
              <span></span>
            </div>
            {projects.map((project, i) => (
              <div
                key={project.id}
                className={styles.listRow}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <span className={styles.listName}>{project.name}</span>
                <span className={styles.listMeta}>{project.location || '—'}</span>
                <span className={styles.listMeta}>{formatDate(project.date)}</span>
                <a href={`/viewer/${project.id}`} className={styles.listOpen}>
                  Open
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M2 5.5h7M6 2.5l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
