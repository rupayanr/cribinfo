import { useState } from 'react'
import { MermaidDiagram } from '../components/Docs/MermaidDiagram'
import { diagrams } from '../data/diagrams'
import { Database, Server, Globe, Cpu, Search, GitBranch, Layers } from 'lucide-react'

const sections = [
  { id: 'overview', label: 'Overview', icon: Layers },
  { id: 'hld', label: 'System Architecture', icon: GitBranch },
  { id: 'backend', label: 'Backend Modules', icon: Server },
  { id: 'rag', label: 'RAG Pipeline', icon: Cpu },
  { id: 'search', label: 'Search Strategy', icon: Search },
  { id: 'deploy', label: 'Deployment', icon: Globe },
  { id: 'schema', label: 'DB Schema', icon: Database },
]

const techStack = {
  frontend: [
    { name: 'React', description: 'UI Library', color: 'bg-cyan-500' },
    { name: 'TypeScript', description: 'Type Safety', color: 'bg-blue-600' },
    { name: 'Tailwind CSS', description: 'Styling', color: 'bg-teal-500' },
    { name: 'Zustand', description: 'State Management', color: 'bg-amber-500' },
    { name: 'Leaflet', description: 'Maps', color: 'bg-green-600' },
  ],
  backend: [
    { name: 'FastAPI', description: 'API Framework', color: 'bg-emerald-500' },
    { name: 'Python', description: 'Language', color: 'bg-yellow-500' },
    { name: 'SQLAlchemy', description: 'ORM', color: 'bg-red-500' },
    { name: 'pgvector', description: 'Vector Search', color: 'bg-purple-500' },
  ],
  deployment: [
    { name: 'Vercel', description: 'Frontend Hosting', icon: VercelIcon },
    { name: 'Render', description: 'Backend Hosting', icon: RenderIcon },
    { name: 'Neon', description: 'PostgreSQL', icon: NeonIcon },
    { name: 'Groq', description: 'LLM API', icon: GroqIcon },
    { name: 'Jina AI', description: 'Embeddings', icon: JinaIcon },
  ],
}

export function ArchitecturePage() {
  const [activeSection, setActiveSection] = useState('overview')

  return (
    <main className="flex-1 overflow-hidden flex flex-col md:flex-row">
      {/* Sidebar */}
      <nav className="hidden md:flex flex-col w-56 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 gap-1 overflow-y-auto flex-shrink-0">
        {sections.map((s) => {
          const Icon = s.icon
          return (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-2 text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === s.id
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              <Icon size={16} />
              {s.label}
            </button>
          )
        })}
      </nav>

      {/* Mobile tabs */}
      <div className="md:hidden flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
        <div className="flex overflow-x-auto gap-1 px-3 py-2 bg-white dark:bg-gray-800">
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
        <div className="max-w-4xl mx-auto space-y-8">
          {activeSection === 'overview' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">CribInfo Architecture</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  A RAG-powered housing search application. Natural language queries like "2BHK under 1Cr with gym" return relevant property recommendations.
                </p>
              </div>

              {/* Tech Stack */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Tech Stack</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <TechCard title="Frontend" items={techStack.frontend} />
                  <TechCard title="Backend" items={techStack.backend} />
                </div>
              </div>

              {/* Deployment */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Deployment & Services</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {techStack.deployment.map((service) => (
                    <div
                      key={service.name}
                      className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    >
                      <service.icon />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{service.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{service.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'hld' && (
            <DiagramSection
              title="System Architecture"
              description="High-level overview showing how the frontend, backend, database, and AI services interact."
              chart={diagrams.systemArchitecture}
            />
          )}

          {activeSection === 'backend' && (
            <DiagramSection
              title="Backend Module Architecture"
              description="Layered architecture: API routes → Core services → Provider abstractions → Data layer."
              chart={diagrams.backendArchitecture}
            />
          )}

          {activeSection === 'rag' && (
            <DiagramSection
              title="RAG Pipeline Flow"
              description="How a natural language query flows through the system — from user input to property results."
              chart={diagrams.ragPipeline}
            />
          )}

          {activeSection === 'search' && (
            <DiagramSection
              title="Search Strategy"
              description="When exact matches aren't found, the search engine progressively relaxes filters."
              chart={diagrams.searchStrategy}
            />
          )}

          {activeSection === 'deploy' && (
            <DiagramSection
              title="Deployment Architecture"
              description="Vercel hosts the React SPA, Render runs the FastAPI backend, Neon provides PostgreSQL with pgvector."
              chart={diagrams.deploymentArchitecture}
            />
          )}

          {activeSection === 'schema' && (
            <DiagramSection
              title="Database Schema"
              description="PostgreSQL table with pgvector extension for storing 768-dimensional property embeddings."
              chart={diagrams.databaseSchema}
            />
          )}

          {/* Footer */}
          <div className="pt-8 pb-4 border-t border-gray-200 dark:border-gray-700 mt-12">
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 flex-wrap">
              Made with
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#D97757]/10 to-[#D97757]/5 dark:from-[#D97757]/20 dark:to-[#D97757]/10 border border-[#D97757]/20">
                <ClaudeIcon />
                <span className="text-xs font-semibold text-[#D97757]">Claude</span>
              </span>
              by
              <span className="font-semibold text-gray-700 dark:text-gray-300">Rupayan Roy</span>
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

function TechCard({ title, items }: { title: string; items: { name: string; description: string; color: string }[] }) {
  return (
    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-700/50"
          >
            <div className={`w-2 h-2 rounded-full ${item.color}`} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Service Icons
function VercelIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 76 65" fill="currentColor">
      <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
    </svg>
  )
}

function RenderIcon() {
  return (
    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#46E3B7] to-[#2EB67D] flex items-center justify-center">
      <span className="text-white font-bold text-sm">R</span>
    </div>
  )
}

function NeonIcon() {
  return (
    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00E699] to-[#00CC88] flex items-center justify-center">
      <Database className="w-4 h-4 text-white" />
    </div>
  )
}

function GroqIcon() {
  return (
    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F55036] to-[#D63D2A] flex items-center justify-center">
      <Cpu className="w-4 h-4 text-white" />
    </div>
  )
}

function JinaIcon() {
  return (
    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#009688] to-[#00796B] flex items-center justify-center">
      <Search className="w-4 h-4 text-white" />
    </div>
  )
}

function ClaudeIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="#D97757">
      <path d="m3.127 10.604 3.135-1.76.053-.153-.053-.085H6.11l-.525-.032-1.791-.048-1.554-.065-1.505-.08-.38-.081L0 7.832l.036-.234.32-.214.455.04 1.009.069 1.513.105 1.097.064 1.626.17h.259l.036-.105-.089-.065-.068-.064-1.566-1.062-1.695-1.121-.887-.646-.48-.327-.243-.306-.104-.67.435-.48.585.04.15.04.593.456 1.267.981 1.654 1.218.242.202.097-.068.012-.049-.109-.181-.9-1.626-.96-1.655-.428-.686-.113-.411a2 2 0 0 1-.068-.484l.496-.674L4.446 0l.662.089.279.242.411.94.666 1.48 1.033 2.014.302.597.162.553.06.17h.105v-.097l.085-1.134.157-1.392.154-1.792.052-.504.25-.605.497-.327.387.186.319.456-.045.294-.19 1.23-.37 1.93-.243 1.29h.142l.161-.16.654-.868 1.097-1.372.484-.545.565-.601.363-.287h.686l.505.751-.226.775-.707.895-.585.759-.839 1.13-.524.904.048.072.125-.012 1.897-.403 1.024-.186 1.223-.21.553.258.06.263-.218.536-1.307.323-1.533.307-2.284.54-.028.02.032.04 1.029.098.44.024h1.077l2.005.15.525.346.315.424-.053.323-.807.411-3.631-.863-.872-.218h-.12v.073l.726.71 1.331 1.202 1.667 1.55.084.383-.214.302-.226-.032-1.464-1.101-.565-.497-1.28-1.077h-.084v.113l.295.432 1.557 2.34.08.718-.112.234-.404.141-.444-.08-.911-1.28-.94-1.44-.759-1.291-.093.053-.448 4.821-.21.246-.484.186-.403-.307-.214-.496.214-.98.258-1.28.21-1.016.19-1.263.112-.42-.008-.028-.092.012-.953 1.307-1.448 1.957-1.146 1.227-.274.109-.477-.247.045-.44.266-.39 1.586-2.018.956-1.25.617-.723-.004-.105h-.036l-4.212 2.736-.75.096-.324-.302.04-.496.154-.162 1.267-.871z"/>
    </svg>
  )
}
