import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import styles from './viewer.module.css'

export default async function ViewerPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!project) redirect('/dashboard')

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <a href="/dashboard" className={styles.back}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Dashboard
        </a>
        <div className={styles.projectInfo}>
          <span className={styles.projectName}>{project.name}</span>
          {project.location && (
            <span className={styles.projectLocation}>{project.location}</span>
          )}
        </div>
        <div className={styles.logo}>
          <span className={styles.logoMark}>V</span>
          <span className={styles.logoText}>VANTA</span>
        </div>
      </header>

      <div className={styles.viewerArea}>
        <div className={styles.placeholder}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity="0.4">
            <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="0.8"/>
            <circle cx="24" cy="24" r="12" stroke="currentColor" strokeWidth="0.8"/>
            <circle cx="24" cy="24" r="2.5" fill="currentColor"/>
            <line x1="2" y1="24" x2="46" y2="24" stroke="currentColor" strokeWidth="0.8"/>
            <line x1="24" y1="2" x2="24" y2="46" stroke="currentColor" strokeWidth="0.8"/>
          </svg>
          <p className={styles.placeholderText}>Viewer coming in Phase 3</p>
          <p className={styles.placeholderSub}>SuperSplat integration · {project.name}</p>
        </div>
      </div>
    </div>
  )
}
