import { useState } from 'react'
import { MermaidDiagram } from '../components/Docs/MermaidDiagram'
import { diagrams } from '../data/diagrams'
import { componentCatalog } from '../data/components'
import { apiEndpoints } from '../data/api-endpoints'

const sections = [
  { id: 'hld', label: 'System Architecture' },
  { id: 'backend', label: 'Backend Modules' },
  { id: 'rag', label: 'RAG Pipeline' },
  { id: 'search', label: 'Search Strategy' },
  { id: 'state', label: 'State Management' },
  { id: 'deploy', label: 'Deployment' },
  { id: 'components', label: 'Component Tree' },
  { id: 'schema', label: 'DB Schema' },
  { id: 'error', label: 'Error Handling' },
  { id: 'catalog', label: 'Component Catalog' },
  { id: 'api', label: 'API Endpoints' },
]

export function ArchitecturePage() {
  const [activeSection, setActiveSection] = useState('hld')

  return (
    <main className="flex-1 overflow-hidden flex">
      {/* Sidebar */}
      <nav className="hidden md:flex flex-col w-56 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 gap-1 overflow-y-auto flex-shrink-0">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === s.id
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            {s.label}
          </button>
        ))}
      </nav>

      {/* Mobile tabs */}
      <div className="md:hidden flex-shrink-0">
        <div className="flex overflow-x-auto gap-1 px-3 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeSection === s.id
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="space-y-8">
          {activeSection === 'hld' && (
            <DiagramSection
              title="System Architecture (HLD)"
              description="High-level overview of CribInfo's architecture showing how the frontend, backend, database, and AI services interact."
              chart={diagrams.systemArchitecture}
            />
          )}

          {activeSection === 'backend' && (
            <DiagramSection
              title="Backend Module Architecture"
              description="Python module organization showing the layered architecture: API routes → Core services → Provider abstractions → Data layer. The provider pattern enables swapping between Ollama (local) and cloud services (Groq, Jina AI)."
              chart={diagrams.backendArchitecture}
            />
          )}

          {activeSection === 'rag' && (
            <DiagramSection
              title="RAG Pipeline Flow"
              description="Sequence diagram showing how a natural language query flows through the system — from user input to property results."
              chart={diagrams.ragPipeline}
            />
          )}

          {activeSection === 'search' && (
            <DiagramSection
              title="Search Strategy (Filter Relaxation)"
              description="When exact matches aren't found, the search engine progressively relaxes filters to find the best possible results."
              chart={diagrams.searchStrategy}
            />
          )}

          {activeSection === 'state' && (
            <DiagramSection
              title="State Management (Zustand)"
              description="The searchStore centralizes application state using Zustand. Components subscribe to specific slices and dispatch actions to update state, enabling a unidirectional data flow."
              chart={diagrams.stateManagement}
            />
          )}

          {activeSection === 'deploy' && (
            <DiagramSection
              title="Deployment Architecture"
              description="Production infrastructure: Vercel hosts the React SPA with CDN distribution, Railway runs the FastAPI container, Neon provides PostgreSQL with pgvector, and external APIs (Groq, Jina AI) handle LLM and embedding generation."
              chart={diagrams.deploymentArchitecture}
            />
          )}

          {activeSection === 'components' && (
            <DiagramSection
              title="Frontend Component Tree"
              description="Visual hierarchy of React components that make up the CribInfo frontend."
              chart={diagrams.componentTree}
            />
          )}

          {activeSection === 'schema' && (
            <DiagramSection
              title="Database Schema"
              description="PostgreSQL table structure with pgvector extension for storing property embeddings."
              chart={diagrams.databaseSchema}
            />
          )}

          {activeSection === 'error' && (
            <DiagramSection
              title="Error Handling Flow"
              description="Error propagation through the system: backend errors are caught by FastAPI exception handlers and returned as structured responses. LLM failures trigger a fallback to filter-only search. All errors surface as Toast notifications in the frontend."
              chart={diagrams.errorHandling}
            />
          )}

          {activeSection === 'catalog' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Component Catalog</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">All React components in the CribInfo frontend.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Component</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Path</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {componentCatalog.map((c) => (
                      <tr key={c.name} className="border-b border-gray-100 dark:border-gray-700/50">
                        <td className="py-2.5 px-4 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">{c.name}</td>
                        <td className="py-2.5 px-4 text-gray-500 dark:text-gray-400 font-mono text-xs">{c.path}</td>
                        <td className="py-2.5 px-4 text-gray-600 dark:text-gray-300">{c.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'api' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">API Endpoints</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">All REST API endpoints exposed by the FastAPI backend.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Method</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Path</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiEndpoints.map((e) => (
                      <tr key={`${e.method}-${e.path}`} className="border-b border-gray-100 dark:border-gray-700/50">
                        <td className="py-2.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            e.method === 'GET'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                            {e.method}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-mono text-xs text-gray-900 dark:text-gray-100">{e.path}</td>
                        <td className="py-2.5 px-4 text-gray-600 dark:text-gray-300">{e.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-8 pb-4 border-t border-gray-200 dark:border-gray-700 mt-12">
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 flex-wrap">
              Made with
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#D97757]/10 to-[#D97757]/5 dark:from-[#D97757]/20 dark:to-[#D97757]/10 border border-[#D97757]/20">
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="#D97757">
                  <path d="m3.127 10.604 3.135-1.76.053-.153-.053-.085H6.11l-.525-.032-1.791-.048-1.554-.065-1.505-.08-.38-.081L0 7.832l.036-.234.32-.214.455.04 1.009.069 1.513.105 1.097.064 1.626.17h.259l.036-.105-.089-.065-.068-.064-1.566-1.062-1.695-1.121-.887-.646-.48-.327-.243-.306-.104-.67.435-.48.585.04.15.04.593.456 1.267.981 1.654 1.218.242.202.097-.068.012-.049-.109-.181-.9-1.626-.96-1.655-.428-.686-.113-.411a2 2 0 0 1-.068-.484l.496-.674L4.446 0l.662.089.279.242.411.94.666 1.48 1.033 2.014.302.597.162.553.06.17h.105v-.097l.085-1.134.157-1.392.154-1.792.052-.504.25-.605.497-.327.387.186.319.456-.045.294-.19 1.23-.37 1.93-.243 1.29h.142l.161-.16.654-.868 1.097-1.372.484-.545.565-.601.363-.287h.686l.505.751-.226.775-.707.895-.585.759-.839 1.13-.524.904.048.072.125-.012 1.897-.403 1.024-.186 1.223-.21.553.258.06.263-.218.536-1.307.323-1.533.307-2.284.54-.028.02.032.04 1.029.098.44.024h1.077l2.005.15.525.346.315.424-.053.323-.807.411-3.631-.863-.872-.218h-.12v.073l.726.71 1.331 1.202 1.667 1.55.084.383-.214.302-.226-.032-1.464-1.101-.565-.497-1.28-1.077h-.084v.113l.295.432 1.557 2.34.08.718-.112.234-.404.141-.444-.08-.911-1.28-.94-1.44-.759-1.291-.093.053-.448 4.821-.21.246-.484.186-.403-.307-.214-.496.214-.98.258-1.28.21-1.016.19-1.263.112-.42-.008-.028-.092.012-.953 1.307-1.448 1.957-1.146 1.227-.274.109-.477-.247.045-.44.266-.39 1.586-2.018.956-1.25.617-.723-.004-.105h-.036l-4.212 2.736-.75.096-.324-.302.04-.496.154-.162 1.267-.871z"/>
                </svg>
                <span className="text-xs font-semibold text-[#D97757]">Claude</span>
              </span>
              by
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                Rupayan Roy
              </span>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

function DiagramSection({ title, description, chart }: { title: string; description: string; chart: string }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">{description}</p>
      <MermaidDiagram chart={chart} />
    </div>
  )
}
