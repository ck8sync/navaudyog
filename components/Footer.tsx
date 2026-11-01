import Link from 'next/link'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="site-footer border-t py-8 pb-24 text-sm sm:pb-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Logo className="footer-brand" />
        <span>New job. New start.</span>
        <span>Made in India. © {new Date().getFullYear()} Nava Udyog</span>
        <nav aria-label="Social media" className="flex gap-5">
          <Link href="https://www.linkedin.com/" target="_blank" rel="noreferrer">LinkedIn</Link>
          <Link href="https://www.instagram.com/" target="_blank" rel="noreferrer">Instagram</Link>
          <Link href="https://www.facebook.com/" target="_blank" rel="noreferrer">Facebook</Link>
        </nav>
      </div>
    </footer>
  )
}
