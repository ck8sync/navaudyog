import Link from "next/link";
import { JOB_CATEGORIES, BRAND } from "@/lib/constants";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold" style={{ color: BRAND.primary }}>
                {BRAND.name.toUpperCase()}
              </h1>
              <span className="ml-2 text-sm italic" style={{ color: BRAND.accent }}>
                {BRAND.tagline}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">🇮🇳 Made in India</span>
              <Link
                href="/auth/login"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 text-sm font-medium text-white rounded-md"
                style={{ backgroundColor: BRAND.primary }}
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Find your next job in India's growing industries
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Connecting workers with opportunities in construction, manufacturing, delivery, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/jobs"
              className="px-8 py-3 text-lg font-medium text-white rounded-md hover:opacity-90"
              style={{ backgroundColor: BRAND.primary }}
            >
              Browse Jobs
            </Link>
            <Link
              href="/auth/register"
              className="px-8 py-3 text-lg font-medium border border-gray-300 rounded-md hover:bg-gray-50"
              style={{ color: BRAND.primary }}
            >
              Post a Job
            </Link>
          </div>
        </div>
      </section>

      {/* Job Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Popular Job Categories
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {JOB_CATEGORIES.map((category) => (
              <Link
                key={category}
                href={`/jobs?category=${encodeURIComponent(category)}`}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {category}
                </h4>
                <p className="text-gray-600">
                  Find opportunities in {category.toLowerCase()}.
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600">
            {BRAND.name} — {BRAND.tagline} 🇮🇳 Made in India
          </p>
        </div>
      </footer>
    </div>
  );
}
