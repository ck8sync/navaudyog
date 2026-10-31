'use client'

import Navbar from '@/components/Navbar'
import BottomNav from '@/components/BottomNav'

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-grow pb-20 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </>
  )
}

