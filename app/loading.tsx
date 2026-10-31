export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="flex min-h-[45vh] flex-col items-center justify-center gap-4 text-brand-navy">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-brand-navy" />
      <span className="text-sm font-semibold">Loading Nava Udyog…</span>
    </div>
  )
}
