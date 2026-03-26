import { useState } from 'react'
import ChatLogTable from './ChatLogTable'
import PolicyEditor from './PolicyEditor'

export default function OperatorDashboard({ policies, setPolicies, chatLog }) {
  const [view, setView] = useState('log')
  const answeredCount = chatLog.filter((e) => e.classification === 'answered').length
  const escalatedCount = chatLog.filter((e) => e.classification === 'escalated').length
  const offTopicCount = chatLog.filter((e) => e.classification === 'off_topic').length
  // Backwards compat: old entries with escalated boolean
  const legacyEscalated = chatLog.filter((e) => !e.classification && e.escalated).length

  return (
    <div className="p-4 space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-2xl font-bold text-gray-900">{chatLog.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-2xl font-bold text-green-600">{answeredCount}</p>
          <p className="text-xs text-gray-500 mt-1">Answered</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-2xl font-bold text-red-500">{escalatedCount + legacyEscalated}</p>
          <p className="text-xs text-gray-500 mt-1">Escalated</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-2xl font-bold text-gray-400">{offTopicCount}</p>
          <p className="text-xs text-gray-500 mt-1">Off-topic</p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setView('log')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            view === 'log' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
          }`}
        >
          Chat Log
        </button>
        <button
          onClick={() => setView('policies')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            view === 'policies' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
          }`}
        >
          Edit Policies
        </button>
      </div>

      {/* Content */}
      {view === 'log' ? (
        <ChatLogTable chatLog={chatLog} />
      ) : (
        <PolicyEditor policies={policies} setPolicies={setPolicies} />
      )}
    </div>
  )
}
