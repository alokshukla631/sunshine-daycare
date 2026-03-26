import { useState } from 'react'

export default function ChatLogTable({ chatLog }) {
  const [filter, setFilter] = useState('all')

  const filtered =
    filter === 'escalated'
      ? chatLog.filter((e) => e.escalated)
      : filter === 'answered'
        ? chatLog.filter((e) => !e.escalated)
        : chatLog

  if (chatLog.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center text-gray-400">
        No conversations yet. Questions from Parent Chat will appear here.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Filter buttons */}
      <div className="flex gap-2">
        {['all', 'escalated', 'answered'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              filter === f
                ? 'bg-amber-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'escalated' && ` (${chatLog.filter((e) => e.escalated).length})`}
          </button>
        ))}
      </div>

      {/* Log entries */}
      <div className="space-y-2">
        {filtered.map((entry) => (
          <details
            key={entry.id}
            className={`bg-white rounded-xl shadow-sm border overflow-hidden ${
              entry.escalated ? 'border-red-200' : 'border-gray-100'
            }`}
          >
            <summary className="px-4 py-3 cursor-pointer flex items-center gap-3 hover:bg-gray-50">
              {entry.escalated && (
                <span className="shrink-0 w-2 h-2 rounded-full bg-red-500" />
              )}
              <span className="flex-1 text-sm text-gray-800 truncate">
                {entry.question}
              </span>
              <span className="shrink-0 text-xs text-gray-400">
                {new Date(entry.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </summary>
            <div className="px-4 pb-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 mt-2 mb-1 font-medium">AI Response:</p>
              <p className="text-sm text-gray-700 leading-relaxed">{entry.answer}</p>
              {entry.escalated && (
                <span className="inline-block mt-2 px-2 py-0.5 bg-red-50 text-red-600 text-xs font-medium rounded-full">
                  Escalated to staff
                </span>
              )}
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
