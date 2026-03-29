'use client'

import { useEffect, useRef } from 'react'
import styles from './SplatViewer.module.css'

interface SplatViewerProps {
  plyUrl: string
  projectName: string
}

export default function SplatViewer({ plyUrl, projectName }: SplatViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // SuperSplat viewer URL with the PLY file as a parameter
  const viewerUrl = `https://supersplat.playcanvas.com/#load=${encodeURIComponent(plyUrl)}`

  return (
    <div className={styles.container} ref={containerRef}>
      <iframe
        ref={iframeRef}
        src={viewerUrl}
        className={styles.iframe}
        allow="fullscreen"
        title={projectName}
      />
    </div>
  )
}
