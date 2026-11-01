'use client'

import Navbar from '@/components/Navbar'
import BottomNav from '@/components/BottomNav'
import { usePathname } from 'next/navigation'
import Footer from '@/components/Footer'
import NavigationProgress from '@/components/NavigationProgress'

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname.startsWith('/auth/')

  return (
    <>
      <NavigationProgress />
      {!isAuthPage && <Navbar />}
      <main className={`app-main flex-grow ${isAuthPage ? '' : 'pb-20 md:pb-0'}`}>
        {children}
      </main>
      {!isAuthPage && <BottomNav />}
      {!isAuthPage && <Footer />}
    </>
  )
}

