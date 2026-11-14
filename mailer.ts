// Server-only e-mail helper built on Nodemailer.
// Never import this file from a 'use client' component: it reads SMTP secrets.
import nodemailer, { type Transporter } from 'nodemailer'
import { APPLICATION_STATUS_META, BRAND, isApplicationStatus } from '@/lib/constants'

let transporter: Transporter | null = null

/** True when the SMTP settings needed to send mail are present. */
export function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
}

function getTransporter() {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 587)
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      // true for port 465 (SSL); false for 587 (STARTTLS)
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }
  return transporter
}

function siteUrl() {
  return (process.env.APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
}

function fromAddress() {
  // Prefer MAIL_FROM_NAME + MAIL_FROM_EMAIL; fall back to MAIL_FROM or SMTP_USER.
  const email = process.env.MAIL_FROM_EMAIL || process.env.SMTP_USER
  const name = process.env.MAIL_FROM_NAME || BRAND.name
  if (process.env.MAIL_FROM_EMAIL || process.env.MAIL_FROM_NAME) return `"${name.replace(/"/g, '')}" <${email}>`
  return process.env.MAIL_FROM || `"${name}" <${email}>`
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}

const STATUS_COLORS: Record<string, string> = {
  applied: '#1d4ed8',
  reviewing: '#b45309',
  interview: '#7e22ce',
  hired: '#15803d',
  rejected: '#b91c1c',
}

export interface StatusEmailInput {
  to: string
  candidateName: string
  jobTitle: string
  companyName?: string | null
  status: string
}

export type EmailResult = { sent: true } | { sent: false; reason: string }

/** Sends the "your application status changed" e-mail. Never throws. */
export async function sendApplicationStatusEmail(input: StatusEmailInput): Promise<EmailResult> {
  if (!isEmailConfigured()) {
    console.warn('[email] SMTP is not configured; skipping status e-mail.')
    return { sent: false, reason: 'Email is not configured on the server.' }
  }
  if (!isApplicationStatus(input.status)) {
    return { sent: false, reason: `Unknown status "${input.status}".` }
  }

  const meta = APPLICATION_STATUS_META[input.status]
  const company = input.companyName || 'the employer'
  const dashboardUrl = `${siteUrl()}/dashboard/employee`
  const color = STATUS_COLORS[input.status] || BRAND.primary

  const subject = input.status === 'applied'
    ? `Application received: ${input.jobTitle}`
    : `Application update: ${input.jobTitle} – ${meta.label}`

  const text = [
    `Hi ${input.candidateName},`,
    '',
    input.status === 'applied'
      ? `Your application for "${input.jobTitle}" at ${company} has been submitted.`
      : `The status of your application for "${input.jobTitle}" at ${company} has changed.`,
    '',
    `Current status: ${meta.label}`,
    meta.description,
    '',
    `Track your applications: ${dashboardUrl}`,
    '',
    `– ${BRAND.name}`,
  ].join('\n')

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f8fafc;padding:24px">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden">
      <div style="background:${BRAND.primary};color:#ffffff;padding:20px 24px;font-size:20px;font-weight:bold">${escapeHtml(BRAND.name)}</div>
      <div style="padding:24px;color:#111827;font-size:15px;line-height:1.6">
        <p style="margin:0 0 12px">Hi ${escapeHtml(input.candidateName)},</p>
        <p style="margin:0 0 16px">${input.status === 'applied'
          ? `Your application for <strong>${escapeHtml(input.jobTitle)}</strong> at <strong>${escapeHtml(company)}</strong> has been submitted.`
          : `The status of your application for <strong>${escapeHtml(input.jobTitle)}</strong> at <strong>${escapeHtml(company)}</strong> has changed.`}</p>
        <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#6b7280">Current status</p>
        <p style="margin:0 0 8px"><span style="display:inline-block;padding:6px 14px;border-radius:999px;background:${color};color:#ffffff;font-weight:bold;font-size:13px">${escapeHtml(meta.label)}</span></p>
        <p style="margin:0 0 24px;color:#4b5563">${escapeHtml(meta.description)}</p>
        <a href="${dashboardUrl}" style="display:inline-block;background:${BRAND.accent};color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:bold">View my applications</a>
      </div>
      <div style="padding:16px 24px;font-size:12px;color:#9ca3af;border-top:1px solid #f3f4f6">${escapeHtml(BRAND.tagline)}</div>
    </div>
  </div>`

  try {
    await getTransporter().sendMail({
      from: fromAddress(),
      to: input.to,
      subject,
      text,
      html,
    })
    return { sent: true }
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'Unknown e-mail error'
    console.error('[email] Failed to send status e-mail:', reason)
    return { sent: false, reason }
  }
}

