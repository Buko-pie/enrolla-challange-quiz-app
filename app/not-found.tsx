'use client'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center px-4">
        <h1 className="text-9xl font-bold text-gray-800 mb-4">404</h1>
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-gray-700 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-500 text-lg">
            Oops! The page you&#39;re looking for doesn&#39;t exist.
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}