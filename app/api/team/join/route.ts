import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  const auth = request.headers.get('authorization')
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user } } = await supabaseAdmin.auth.getUser(auth.replace('Bearer ', ''))
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { token } = await request.json()
  if (!token) return NextResponse.json({ error: 'Token puuttuu' }, { status: 400 })

  const { data: invite } = await supabaseAdmin
    .from('team_invites')
    .select('*, teams(name)')
    .eq('token', token)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!invite) return NextResponse.json({ error: 'Kutsu ei ole voimassa tai se on vanhentunut' }, { status: 400 })

  const { data: existing } = await supabaseAdmin
    .from('team_members')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existing) return NextResponse.json({ error: 'Olet jo tiimin jäsen' }, { status: 400 })

  await supabaseAdmin.from('team_members').insert({
    team_id: invite.team_id,
    user_id: user.id,
    role: 'member',
    email: user.email,
  })

  await supabaseAdmin
    .from('team_invites')
    .update({ used_at: new Date().toISOString() })
    .eq('id', invite.id)

  return NextResponse.json({ ok: true, teamName: (invite.teams as any)?.name })
}
