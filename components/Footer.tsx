import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-8 pb-24 text-sm text-gray-600 sm:pb-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} Nava Udyog · New Job, New Start.</p>
        <nav aria-label="Social media" className="flex gap-5">
          <Link href="https://www.linkedin.com/" target="_blank" rel="noreferrer" className="hover:text-brand-navy">LinkedIn</Link>
          <Link href="https://www.instagram.com/" target="_blank" rel="noreferrer" className="hover:text-brand-navy">Instagram</Link>
          <Link href="https://www.facebook.com/" target="_blank" rel="noreferrer" className="hover:text-brand-navy">Facebook</Link>
        </nav>
      </div>
    </footer>
  )
}
