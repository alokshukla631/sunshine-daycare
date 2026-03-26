import { useState } from 'react'

function escapeCsvField(str) {
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}

function getClassification(entry) {
  if (entry.classification) return entry.classification
  // Backwards compat with old entries
  return entry.escalated ? 'escalated' : 'answered'
}

function exportToCsv(chatLog) {
  const header = 'Timestamp,Question,Answer,Classification'
  const rows = chatLog.map((e) =>
    [
      e.timestamp,
      escapeCsvField(e.question),
      escapeCsvField(e.answer),
      getClassification(e),
    ].join(',')
  )
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `sunshine-chat-log-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function ChatLogTable({ chatLog }) {
  const [filter, setFilter] = useState('all')
  const [hideOffTopic, setHideOffTopic] = useState(true)

  const escalatedCount = chatLog.filter((e) => getClassification(e) === 'escalated').length
  const offTopicCount = chatLog.filter((e) => getClassification(e) === 'off_topic').length

  let filtered = chatLog
  if (filter === 'escalated') {
    filtered = chatLog.filter((e) => getClassification(e) === 'escalated')
  } else if (filter === 'answered') {
    filtered = chatLog.filter((e) => getClassification(e) === 'answered')
  } else if (filter === 'off_topic') {
    filtered = chatLog.filter((e) => getClassification(e) === 'off_topic')
  } else if (hideOffTopic) {
    filtered = chatLog.filter((e) => getClassification(e) !== 'off_topic')
  }

  if (chatLog.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center text-gray-400">
        No conversations yet. Questions from Parent Chat will appear here.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Filter buttons + export */}
      <div className="flex gap-2 items-center flex-wrap">
        {['all', 'escalated', 'answered', 'off_topic'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              filter === f
                ? 'bg-amber-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'off_topic' ? 'Off-topic' : f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'escalated' && ` (${escalatedCount})`}
            {f === 'off_topic' && ` (${offTopicCount})`}
          </button>
        ))}
        <button
          onClick={() => exportToCsv(chatLog)}
          className="ml-auto px-3 py-1.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          Export CSV
        </button>
      </div>

      {/* Hide off-topic toggle (only show on "all" filter) */}
      {filter === 'all' && offTopicCount > 0 && (
        <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
          <input
            type="checkbox"
            checked={hideOffTopic}
            onChange={(e) => setHideOffTopic(e.target.checked)}
            className="rounded border-gray-300 text-amber-500 focus:ring-amber-400"
          />
          Hide off-topic questions ({offTopicCount})
        </label>
      )}

      {/* Log entries */}
      <div className="space-y-2">
        {filtered.map((entry) => {
          const cls = getClassification(entry)
          return (
            <details
              key={entry.id}
              className={`bg-white rounded-xl shadow-sm border overflow-hidden ${
                cls === 'escalated'
                  ? 'border-red-200'
                  : cls === 'off_topic'
                    ? 'border-gray-200 opacity-60'
                    : 'border-gray-100'
              }`}
            >
              <summary className="px-4 py-3 cursor-pointer flex items-center gap-3 hover:bg-gray-50">
                {cls === 'escalated' && (
                  <span className="shrink-0 w-2 h-2 rounded-full bg-red-500" />
                )}
                {cls === 'off_topic' && (
                  <span className="shrink-0 w-2 h-2 rounded-full bg-gray-300" />
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
                {cls === 'escalated' && (
                  <span className="inline-block mt-2 px-2 py-0.5 bg-red-50 text-red-600 text-xs font-medium rounded-full">
                    Escalated to staff
                  </span>
                )}
                {cls === 'off_topic' && (
                  <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                    Off-topic
                  </span>
                )}
              </div>
            </details>
          )
        })}
      </div>
    </div>
  )
}
