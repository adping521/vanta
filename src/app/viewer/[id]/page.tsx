'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import styles from './viewer.module.css'

type Project = {
  id: string
  name: string
  location: string | null
  date: string | null
  ply_url: string | null
}

export default function ViewerPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('projects')
      .select('*')
      .eq('id', params.id)
      .single()
      .then(({ data }) => {
        if (data) setProject(data)
        else window.location.href = '/dashboard'
      })
  }, [params.id])

  async function handleFileUpload(file: File) {
    if (!file.name.toLowerCase().endsWith('.ply')) {
      setError('Please upload a .PLY file')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      const CHUNK_SIZE = 100 * 1024 * 1024
      const partCount = Math.ceil(file.size / CHUNK_SIZE)

      const initRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, partCount }),
      })

      if (!initRes.ok) throw new Error('Failed to start upload')
      const { uploadId, key, partUrls, publicUrl } = await initRes.json()

      const parts: { PartNumber: number; ETag: string }[] = []

      for (let i = 0; i < partCount; i++) {
        const start = i * CHUNK_SIZE
        const end = Math.min(start + CHUNK_SIZE, file.size)
        const chunk = file.slice(start, end)

        const res = await fetch(partUrls[i], {
          method: 'PUT',
          body: chunk,
        })

        if (!res.ok) throw new Error(`Part ${i + 1} failed`)

        const etag = res.headers.get('ETag') || ''
        parts.push({ PartNumber: i + 1, ETag: etag })
        setUploadProgress(Math.round(((i + 1) / partCount) * 90))
      }

      const completeRes = await fetch('/api/upload', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, uploadId, parts }),
      })

      if (!completeRes.ok) throw new Error('Failed to complete upload')

      const supabase = createClient()
      await supabase
        .from('projects')
        .update({ ply_url: publicUrl })
        .eq('id', params.id)

      setUploadProgress(100)
      setProject(prev => prev ? { ...prev, ply_url: publicUrl } : prev)
      setUploading(false)
      setUploadProgress(0)

    } catch (err) {
      setError('Upload failed. Please try again.')
      setUploading(false)
      setUploadProgress(0)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

  if (!project) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
      </div>
    )
  }

  const viewerUrl = project.ply_url
    ? `https://supersplat.playcanvas.com/#load=${encodeURIComponent(project.ply_url)}`
    : null

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
        {viewerUrl ? (
          <iframe
            src={viewerUrl}
            className={styles.iframe}
            allow="fullscreen"
            title={project.name}
          />
        ) : (
          <div
            className={styles.uploadZone}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".ply"
              className={styles.fileInput}
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload(file)
              }}
            />
            {uploading ? (
              <div className={styles.uploadProgress}>
                <div className={styles.progressRing}>
                  <svg width="64" height="64" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="var(--border)" strokeWidth="2"/>
                    <circle
                      cx="32" cy="32" r="28"
                      fill="none"
                      stroke="var(--amber)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      strokeDashoffset={`${2 * Math.PI * 28 * (1 - uploadProgress / 100)}`}
                      transform="rotate(-90 32 32)"
                      style={{ transition: 'stroke-dashoffset 0.3s ease' }}
                    />
                  </svg>
                  <span className={styles.progressText}>{uploadProgress}%</span>
                </div>
                <p className={styles.uploadingText}>Uploading scan...</p>
              </div>
            ) : (
              <div className={styles.uploadPrompt}>
                <div className={styles.uploadIcon}>
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="0.8"/>
                    <circle cx="20" cy="20" r="10" stroke="currentColor" strokeWidth="0.8"/>
                    <circle cx="20" cy="20" r="2.5" fill="currentColor"/>
                    <line x1="2" y1="20" x2="38" y2="20" stroke="currentColor" strokeWidth="0.8"/>
                    <line x1="20" y1="2" x2="20" y2="38" stroke="currentColor" strokeWidth="0.8"/>
                  </svg>
                </div>
                <h2 className={styles.uploadTitle}>Upload scan file</h2>
                <p className={styles.uploadSub}>Drop a .PLY file here or click to browse</p>
                {error && <p className={styles.uploadError}>{error}</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
