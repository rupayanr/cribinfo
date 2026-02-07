import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function DocsPage() {
  return (
    <main className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">API Documentation</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Interactive API reference powered by OpenAPI. Try endpoints directly from this page.
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <SwaggerUI url={`${API_URL}/openapi.json`} />
        </div>
      </div>
    </main>
  )
}
