import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

async function getUser(request: NextRequest) {
  const auth = request.headers.get('authorization')
  if (!auth) return null
  const { data: { user } } = await supabaseAdmin.auth.getUser(auth.replace('Bearer ', ''))
  return user
}

export async function GET(request: NextRequest) {
  const user = await getUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: membership } = await supabaseAdmin
    .from('team_members')
    .select('*, teams(*)')
    .eq('user_id', user.id)
    .single()

  if (!membership) return NextResponse.json({ team: null })

  const { data: members } = await supabaseAdmin
    .from('team_members')
    .select('*')
    .eq('team_id', membership.team_id)
    .order('joined_at')

  let invites: any[] = []
  if (membership.role === 'owner') {
    const { data } = await supabaseAdmin
      .from('team_invites')
      .select('*')
      .eq('team_id', membership.team_id)
      .is('used_at', null)
      .order('created_at', { ascending: false })
    invites = data || []
  }

  return NextResponse.json({ team: membership.teams, membership, members: members || [], invites })
}

export async function POST(request: NextRequest) {
  const user = await getUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name } = await request.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Tiimin nimi puuttuu' }, { status: 400 })

  const { data: existing } = await supabaseAdmin
    .from('team_members')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existing) return NextResponse.json({ error: 'Olet jo tiimin jäsen' }, { status: 400 })

  const { data: team, error } = await supabaseAdmin
    .from('teams')
    .insert({ name: name.trim(), owner_id: user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabaseAdmin.from('team_members').insert({
    team_id: team.id,
    user_id: user.id,
    role: 'owner',
    email: user.email,
  })

  return NextResponse.json({ team })
}

export async function DELETE(request: NextRequest) {
  const user = await getUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { userId } = await request.json()
  if (!userId) return NextResponse.json({ error: 'userId puuttuu' }, { status: 400 })

  // Varmista että pyytäjä on omistaja
  const { data: ownerMembership } = await supabaseAdmin
    .from('team_members')
    .select('team_id')
    .eq('user_id', user.id)
    .eq('role', 'owner')
    .single()

  if (!ownerMembership) return NextResponse.json({ error: 'Et ole tiimin omistaja' }, { status: 403 })

  // Estä omistajan poistaminen
  if (userId === user.id) return NextResponse.json({ error: 'Et voi poistaa itseäsi' }, { status: 400 })

  await supabaseAdmin
    .from('team_members')
    .delete()
    .eq('user_id', userId)
    .eq('team_id', ownerMembership.team_id)

  return NextResponse.json({ ok: true })
}
