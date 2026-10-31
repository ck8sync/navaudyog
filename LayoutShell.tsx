'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'
import BottomNav from '@/components/BottomNav'
import Footer from '@/components/Footer'

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLandingPage = pathname === '/'

  return (
    <>
      {!isLandingPage && <Navbar />}
      <main className="flex-grow">
        {children}
      </main>
      {!isLandingPage && <Footer />}
      {!isLandingPage && <BottomNav />}
    </>
  )
}

