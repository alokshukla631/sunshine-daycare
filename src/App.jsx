import { useState } from 'react'
import ParentChat from './components/ParentChat'
import OperatorDashboard from './components/OperatorDashboard'
import defaultPolicies from './data/policies.json'

export default function App() {
  const [activeTab, setActiveTab] = useState('chat')
  const [policies, setPolicies] = useState(defaultPolicies)
  const [chatLog, setChatLog] = useState([])

  const addLogEntry = (entry) => {
    setChatLog((prev) => [entry, ...prev])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-amber-400 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-amber-900 text-center">
            Sunshine Early Learning Center
          </h1>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${
              activeTab === 'chat'
                ? 'border-amber-500 text-amber-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Parent Chat
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${
              activeTab === 'dashboard'
                ? 'border-amber-500 text-amber-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Operator Dashboard
          </button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto">
        {activeTab === 'chat' ? (
          <ParentChat policies={policies} addLogEntry={addLogEntry} />
        ) : (
          <OperatorDashboard
            policies={policies}
            setPolicies={setPolicies}
            chatLog={chatLog}
          />
        )}
      </main>
    </div>
  )
}
