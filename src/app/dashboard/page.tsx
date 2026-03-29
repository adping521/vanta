'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import DashboardClient from './DashboardClient'

export default function DashboardPage() {
  const [projects, setProjects] = useState([])
  const [user, setUser] = useState({ id: '', email: '' })

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUser({ id: user.id, email: user.email ?? '' })

      const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (projects) setProjects(projects as any)
    }

    load()
  }, [])

  return <DashboardClient user={user} projects={projects} />
}
