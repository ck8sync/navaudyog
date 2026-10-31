import { NextResponse } from 'next/server'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const maxDuration = 30

const headings = /^(skills?|technical skills|education|educational qualifications?|work experience|experience|employment history|certifications?|certificates?)\s*:?\s*$/i

function section(text: string, names: RegExp) {
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean)
  const start = lines.findIndex(line => names.test(line))
  if (start < 0) return []
  const values: string[] = []
  for (const line of lines.slice(start + 1)) {
    if (headings.test(line)) break
    values.push(line)
  }
  return values.slice(0, 30)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Please sign in to upload a CV.' }, { status: 401 })

  const form = await request.formData()
  const file = form.get('file')
  if (!(file instanceof File)) return NextResponse.json({ error: 'Choose a PDF file.' }, { status: 400 })
  if (file.size === 0 || file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'CV must be no larger than 5 MB.' }, { status: 400 })
  const bytes = new Uint8Array(await file.arrayBuffer())
  if (file.type !== 'application/pdf' || new TextDecoder().decode(bytes.slice(0, 5)) !== '%PDF-') {
    return NextResponse.json({ error: 'Only valid PDF files are supported.' }, { status: 400 })
  }

  let text: string
  try {
    const document = await getDocument({ data: bytes, useSystemFonts: true }).promise
    const pages: string[] = []
    for (let pageNumber = 1; pageNumber <= Math.min(document.numPages, 30); pageNumber++) {
      const page = await document.getPage(pageNumber)
      const content = await page.getTextContent()
      const rows = new Map<number, string[]>()
      for (const item of content.items) {
        if (!('str' in item) || !item.str.trim()) continue
        const y = Math.round(item.transform[5])
        rows.set(y, [...(rows.get(y) || []), item.str])
      }
      pages.push([...rows.entries()].sort(([a], [b]) => b - a).map(([, words]) => words.join(' ')).join('\n'))
    }
    text = pages.join('\n').slice(0, 100_000)
  } catch {
    return NextResponse.json({ error: 'This PDF could not be read. You can still complete your profile manually.' }, { status: 422 })
  }

  if (!text.trim()) return NextResponse.json({ error: 'No selectable text was found. Please enter your profile manually.' }, { status: 422 })
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean)
  const name = lines.find(line => line.length > 1 && line.length < 80 && !/[@\d]/.test(line) && !headings.test(line)) || ''
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || ''
  const phone = text.match(/(?:\+?91[\s-]?)?([6-9]\d{9})/)?.[1] || ''
  const skills = section(text, /^(skills?|technical skills)\s*:?\s*$/i)
  const education = section(text, /^(education|educational qualifications?)\s*:?\s*$/i)
  const experience = section(text, /^(work experience|experience|employment history)\s*:?\s*$/i)
  const certifications = section(text, /^(certifications?|certificates?)\s*:?\s*$/i)

  const path = `${user.id}/${Date.now()}-${crypto.randomUUID()}.pdf`
  const { error: uploadError } = await supabase.storage.from('employee-cvs').upload(path, bytes, {
    contentType: 'application/pdf', upsert: false,
  })
  if (uploadError) return NextResponse.json({ error: `Private CV upload failed: ${uploadError.message}` }, { status: 502 })

  return NextResponse.json({
    uploaded: true,
    extracted: { fullName: name, email, phone, skills, education, experience, certifications },
  })
}
