import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function DELETE(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user } } = await supabaseAdmin.auth.getUser(auth.replace('Bearer ', ''))
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const uid = user.id

  // Delete membership/participation data first
  await Promise.all([
    supabaseAdmin.from('project_members').delete().eq('user_id', uid),
    supabaseAdmin.from('time_entries').delete().eq('user_id', uid),
    supabaseAdmin.from('travel_entries').delete().eq('user_id', uid),
    supabaseAdmin.from('expenses').delete().eq('user_id', uid),
  ])

  // If team owner: remove entire team
  const { data: ownedTeams } = await supabaseAdmin
    .from('teams').select('id').eq('owner_id', uid)
  if (ownedTeams && ownedTeams.length > 0) {
    const ids = ownedTeams.map(t => t.id)
    await supabaseAdmin.from('team_invites').delete().in('team_id', ids)
    await supabaseAdmin.from('team_members').delete().in('team_id', ids)
    await supabaseAdmin.from('teams').delete().in('id', ids)
  } else {
    await supabaseAdmin.from('team_members').delete().eq('user_id', uid)
  }

  // Delete projects (and any remaining linked data)
  await supabaseAdmin.from('projects').delete().eq('user_id', uid)

  // Delete profile
  await supabaseAdmin.from('profiles').delete().eq('id', uid)

  // Finally delete auth user
  const { error } = await supabaseAdmin.auth.admin.deleteUser(uid)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
