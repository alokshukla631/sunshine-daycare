export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { message, policies } = req.body

  if (!message || !policies) {
    return res.status(400).json({ error: 'Missing message or policies' })
  }

  const systemPrompt = `You are the friendly front desk assistant for ${policies.daycare_name}.

IMPORTANT RULES:
1. Answer ONLY based on the following policies. Do not make up information.
2. If a question is about something not covered in the policies below, say "Let me connect you with our team — they'll be able to help with that! You can reach us at ${policies.emergency_contacts?.center_phone || '(555) 123-4567'} or email ${policies.emergency_contacts?.center_email || 'info@sunshineelc.com'}."
3. If the question involves sensitive topics (medical advice, billing disputes, complaints, legal matters, child safety concerns), say "Let me connect you with our team — this is something our staff can help you with directly. Please call ${policies.emergency_contacts?.center_phone || '(555) 123-4567'} or ask for ${policies.emergency_contacts?.director || 'our director'}."
4. Keep answers concise, warm, and helpful. Use a friendly but professional tone.
5. When listing information (like menus, holidays), format it clearly.

POLICIES:
${JSON.stringify(policies, null, 2)}`

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API key not configured' })
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('OpenAI error:', err)
      return res.status(502).json({ error: 'Failed to get AI response' })
    }

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that. Please try again."

    return res.status(200).json({ reply })
  } catch (error) {
    console.error('Chat API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
