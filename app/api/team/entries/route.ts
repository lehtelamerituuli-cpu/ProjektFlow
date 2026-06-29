import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization')
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user } } = await supabaseAdmin.auth.getUser(auth.replace('Bearer ', ''))
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: membership } = await supabaseAdmin
    .from('team_members')
    .select('team_id, role')
    .eq('user_id', user.id)
    .eq('role', 'owner')
    .single()

  if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: members } = await supabaseAdmin
    .from('team_members')
    .select('user_id, email, role')
    .eq('team_id', membership.team_id)

  const memberIds = (members || []).map(m => m.user_id)

  const [{ data: timeEntries }, { data: travelEntries }] = await Promise.all([
    supabaseAdmin
      .from('time_entries')
      .select('*, projects(name)')
      .in('user_id', memberIds)
      .order('date', { ascending: false }),
    supabaseAdmin
      .from('travel_entries')
      .select('*, projects(name)')
      .in('user_id', memberIds)
      .order('date', { ascending: false }),
  ])

  return NextResponse.json({
    members: members || [],
    timeEntries: timeEntries || [],
    travelEntries: travelEntries || [],
  })
}
