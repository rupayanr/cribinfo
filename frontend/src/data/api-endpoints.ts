export const apiEndpoints = [
  { method: 'POST', path: '/api/v1/search', description: 'Natural language property search with RAG pipeline' },
  { method: 'GET', path: '/api/v1/properties/{id}', description: 'Get full details for a single property' },
  { method: 'POST', path: '/api/v1/compare', description: 'Compare multiple properties side-by-side' },
  { method: 'GET', path: '/api/v1/cities', description: 'List all available cities' },
  { method: 'GET', path: '/api/v1/cities/{city}/areas', description: 'List areas within a specific city' },
]
