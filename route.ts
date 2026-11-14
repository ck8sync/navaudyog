import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isApplicationStatus } from '@/lib/constants'
import { sendApplicationStatusEmail } from '@/lib/email/mailer'

export const runtime = 'nodejs'

/**
 * PATCH /api/applications/:id/status  { status }
 *
 * Updates an application's status as the signed-in employer (RLS ensures they
 * own the job), then e-mails the candidate. The status change is saved even if
 * the e-mail fails; the response reports both outcomes.
 */
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }
  const status = (body as { status?: unknown })?.status
  if (!isApplicationStatus(status)) {
    return NextResponse.json({ error: 'Invalid application status.' }, { status: 400 })
  }

  // Current status (RLS: only visible to the job owner / the candidate).
  const { data: existing, error: readError } = await supabase
    .from('applications')
    .select('id, status')
    .eq('id', id)
    .maybeSingle()

  if (readError) return NextResponse.json({ error: readError.message }, { status: 500 })
  if (!existing) return NextResponse.json({ error: 'Application not found.' }, { status: 404 })
  if (existing.status === status) {
    return NextResponse.json({ status, unchanged: true, email: { sent: false, reason: 'Status unchanged.' } })
  }

  // RLS + column grants (migration 007) allow only the job's employer to change status.
  const { data: updated, error: updateError } = await supabase
    .from('applications')
    .update({ status })
    .eq('id', id)
    .select('id, status')

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 })
  if (!updated || updated.length === 0) {
    return NextResponse.json({ error: 'You do not have permission to update this application.' }, { status: 403 })
  }

  // Look up the candidate's e-mail via the scoped SECURITY DEFINER function (migration 008).
  const { data: contacts, error: contactError } = await supabase
    .rpc('get_application_contact', { p_application_id: id })

  const contact = Array.isArray(contacts) ? contacts[0] : null
  let email: { sent: boolean; reason?: string }
  if (contactError || !contact?.email) {
    email = { sent: false, reason: contactError?.message || 'Candidate e-mail not found.' }
    console.error('[email] Could not load candidate contact:', email.reason)
  } else {
    email = await sendApplicationStatusEmail({
      to: contact.email,
      candidateName: contact.full_name || 'there',
      jobTitle: contact.job_title || 'your job application',
      companyName: contact.company_name,
      status: updated[0].status,
    })
  }

  return NextResponse.json({ status: updated[0].status, email })
}

