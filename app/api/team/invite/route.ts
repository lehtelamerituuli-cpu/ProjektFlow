import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  const auth = request.headers.get('authorization')
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user } } = await supabaseAdmin.auth.getUser(auth.replace('Bearer ', ''))
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email } = await request.json()
  if (!email) return NextResponse.json({ error: 'Sähköposti puuttuu' }, { status: 400 })

  const { data: membership } = await supabaseAdmin
    .from('team_members')
    .select('team_id, teams(name)')
    .eq('user_id', user.id)
    .eq('role', 'owner')
    .single()

  if (!membership) return NextResponse.json({ error: 'Et ole tiimin omistaja' }, { status: 403 })

  const { data: invite, error: inviteError } = await supabaseAdmin
    .from('team_invites')
    .insert({ team_id: membership.team_id, email })
    .select()
    .single()

  if (inviteError) return NextResponse.json({ error: inviteError.message }, { status: 500 })

  const origin = request.headers.get('origin') || 'https://freelancehub-psi-six.vercel.app'
  const redirectTo = `${origin}/join?token=${invite.token}`

  const { error: emailError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    redirectTo,
    data: { team_id: membership.team_id },
  })

  if (emailError) {
    await supabaseAdmin.from('team_invites').delete().eq('id', invite.id)
    return NextResponse.json({ error: emailError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest) {
  const auth = request.headers.get('authorization')
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user } } = await supabaseAdmin.auth.getUser(auth.replace('Bearer ', ''))
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { inviteId } = await request.json()
  if (!inviteId) return NextResponse.json({ error: 'inviteId puuttuu' }, { status: 400 })

  const { data: membership } = await supabaseAdmin
    .from('team_members')
    .select('team_id')
    .eq('user_id', user.id)
    .eq('role', 'owner')
    .single()

  if (!membership) return NextResponse.json({ error: 'Et ole tiimin omistaja' }, { status: 403 })

  await supabaseAdmin.from('team_invites').delete().eq('id', inviteId).eq('team_id', membership.team_id)

  return NextResponse.json({ ok: true })
}
