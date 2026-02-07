import { ChatContainer } from '../components/Chat'
import { CompareView } from '../components/Property/CompareView'
import { useSearchStore } from '../stores/searchStore'

export function HomePage() {
  const { compareList } = useSearchStore()

  return (
    <>
      <main className={`flex-1 overflow-hidden ${compareList.length > 0 ? 'pb-48' : ''}`}>
        <div className="h-full max-w-4xl mx-auto">
          <ChatContainer />
        </div>
      </main>
      <CompareView />
    </>
  )
}
