import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function DELETE(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization')
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const token = auth.replace('Bearer ', '')
    if (!token || token === 'undefined' || token === 'null') {
      return NextResponse.json({ error: 'Istunto vanhentunut' }, { status: 401 })
    }

    const { data: { user }, error: userErr } = await supabaseAdmin.auth.getUser(token)
    if (userErr) return NextResponse.json({ error: userErr.message }, { status: 401 })
    if (!user) return NextResponse.json({ error: 'Käyttäjää ei löydy' }, { status: 401 })

    const uid = user.id

    // Delete receipt images from Storage
    const { data: storageFiles } = await supabaseAdmin.storage.from('receipts').list(uid)
    if (storageFiles && storageFiles.length > 0) {
      const paths = storageFiles.map(f => `${uid}/${f.name}`)
      await supabaseAdmin.storage.from('receipts').remove(paths)
    }

    // Delete participation data (ignore errors — rows may not exist)
    await Promise.allSettled([
      supabaseAdmin.from('project_members').delete().eq('user_id', uid),
      supabaseAdmin.from('time_entries').delete().eq('user_id', uid),
      supabaseAdmin.from('travel_entries').delete().eq('user_id', uid),
      supabaseAdmin.from('expenses').delete().eq('user_id', uid),
      supabaseAdmin.from('receipts').delete().eq('user_id', uid),
    ])

    // If team owner: remove entire team
    const { data: ownedTeams } = await supabaseAdmin
      .from('teams').select('id').eq('owner_id', uid)
    if (ownedTeams && ownedTeams.length > 0) {
      const ids = ownedTeams.map(t => t.id)
      await Promise.allSettled([
        supabaseAdmin.from('team_invites').delete().in('team_id', ids),
        supabaseAdmin.from('team_members').delete().in('team_id', ids),
      ])
      await supabaseAdmin.from('teams').delete().in('id', ids)
    } else {
      await supabaseAdmin.from('team_members').delete().eq('user_id', uid)
    }

    // Delete projects and profile
    await supabaseAdmin.from('projects').delete().eq('user_id', uid)
    await supabaseAdmin.from('profiles').delete().eq('id', uid)

    // Delete auth user
    const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(uid)
    if (delErr) {
      return NextResponse.json({ error: delErr.message || JSON.stringify(delErr) }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    const msg = e?.message ?? (typeof e === 'string' ? e : JSON.stringify(e) ?? 'Tuntematon virhe')
    console.error('delete-account error:', msg, e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
