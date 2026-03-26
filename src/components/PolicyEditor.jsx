import { useState } from 'react'

const SECTION_LABELS = {
  hours: 'Operating Hours',
  holidays_closed: 'Holidays Closed',
  tuition_rates: 'Tuition Rates',
  sick_policy: 'Sick Policy',
  lunch_menu: 'Lunch Menu',
  tour_scheduling: 'Tour Scheduling',
  pickup_dropoff_rules: 'Pickup & Drop-off Rules',
  emergency_contacts: 'Emergency Contacts',
  additional_policies: 'Additional Policies',
}

export default function PolicyEditor({ policies, setPolicies }) {
  const [activeSection, setActiveSection] = useState('hours')
  const [saved, setSaved] = useState(false)

  const sections = Object.keys(policies).filter((k) => k !== 'daycare_name')

  const handleChange = (path, value) => {
    setPolicies((prev) => {
      const updated = JSON.parse(JSON.stringify(prev))
      const keys = path.split('.')
      let obj = updated
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]]
      }
      obj[keys[keys.length - 1]] = value
      return updated
    })
    setSaved(false)
  }

  const handleArrayChange = (path, index, value) => {
    setPolicies((prev) => {
      const updated = JSON.parse(JSON.stringify(prev))
      const keys = path.split('.')
      let obj = updated
      for (const key of keys) {
        obj = obj[key]
      }
      obj[index] = value
      return updated
    })
    setSaved(false)
  }

  const addArrayItem = (path) => {
    setPolicies((prev) => {
      const updated = JSON.parse(JSON.stringify(prev))
      const keys = path.split('.')
      let obj = updated
      for (const key of keys) {
        obj = obj[key]
      }
      obj.push('')
      return updated
    })
    setSaved(false)
  }

  const removeArrayItem = (path, index) => {
    setPolicies((prev) => {
      const updated = JSON.parse(JSON.stringify(prev))
      const keys = path.split('.')
      let obj = updated
      for (const key of keys) {
        obj = obj[key]
      }
      obj.splice(index, 1)
      return updated
    })
    setSaved(false)
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const renderValue = (data, parentPath) => {
    if (Array.isArray(data)) {
      return (
        <div className="space-y-2">
          {data.map((item, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => handleArrayChange(parentPath, i, e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
              <button
                onClick={() => removeArrayItem(parentPath, i)}
                className="text-red-400 hover:text-red-600 px-2 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={() => addArrayItem(parentPath)}
            className="text-amber-600 hover:text-amber-700 text-sm font-medium"
          >
            + Add item
          </button>
        </div>
      )
    }

    if (typeof data === 'object' && data !== null) {
      return (
        <div className="space-y-3">
          {Object.entries(data).map(([key, val]) => {
            const fullPath = parentPath ? `${parentPath}.${key}` : key
            const label = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

            if (Array.isArray(val)) {
              return (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    {label}
                  </label>
                  {renderValue(val, fullPath)}
                </div>
              )
            }

            if (typeof val === 'object') {
              return (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    {label}
                  </label>
                  {renderValue(val, fullPath)}
                </div>
              )
            }

            return (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  {label}
                </label>
                <input
                  type="text"
                  value={val}
                  onChange={(e) => handleChange(fullPath, e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              </div>
            )
          })}
        </div>
      )
    }

    return null
  }

  return (
    <div className="space-y-3">
      {/* Section picker */}
      <div className="flex overflow-x-auto gap-2 pb-1 -mx-1 px-1">
        {sections.map((key) => (
          <button
            key={key}
            onClick={() => setActiveSection(key)}
            className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              activeSection === key
                ? 'bg-amber-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {SECTION_LABELS[key] || key}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          {SECTION_LABELS[activeSection] || activeSection}
        </h3>
        {renderValue(policies[activeSection], activeSection)}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Changes take effect immediately in chat
          </p>
          <button
            onClick={handleSave}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              saved
                ? 'bg-green-500 text-white'
                : 'bg-amber-500 text-white hover:bg-amber-600'
            }`}
          >
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
