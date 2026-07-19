import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  const { email, project_id } = await req.json()
  if (!email || !project_id) return NextResponse.json({ error: 'Puuttuvat tiedot' }, { status: 400 })

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, display_name')
    .eq('email', email.trim().toLowerCase())
    .single()

  if (!profile) return NextResponse.json({ error: 'Käyttäjää ei löydy tällä sähköpostilla' }, { status: 404 })

  const { error } = await supabaseAdmin
    .from('project_members')
    .insert({ project_id, user_id: profile.id, role: 'member' })

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Käyttäjä on jo jäsen' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, display_name: profile.display_name || email })
}

export async function DELETE(req: NextRequest) {
  const { project_id, user_id } = await req.json()
  if (!project_id || !user_id) return NextResponse.json({ error: 'Puuttuvat tiedot' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('project_members')
    .delete()
    .eq('project_id', project_id)
    .eq('user_id', user_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
