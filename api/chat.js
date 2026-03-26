export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { message, policies, history } = req.body

  if (!message || !policies) {
    return res.status(400).json({ error: 'Missing message or policies' })
  }

  const systemPrompt = `You are the friendly front desk assistant for ${policies.daycare_name}.

CLASSIFICATION — You MUST start every response with exactly one of these tags (the tag will be stripped before showing to the parent):
- [ANSWERED] — the question is about the daycare and you can answer it from the policies below.
- [ESCALATED] — the question is about the daycare but is not covered by the policies, OR it involves sensitive topics (medical advice, billing disputes, complaints, legal matters, child safety concerns).
- [OFF-TOPIC] — the question has nothing to do with the daycare or childcare (e.g. weather, sports, general knowledge, jokes, coding help).

IMPORTANT RULES:
1. Answer ONLY based on the following policies. Do not make up information.
2. For [ESCALATED] questions, say "Let me connect you with our team — they'll be able to help with that! You can reach us at ${policies.emergency_contacts?.center_phone || '(555) 123-4567'} or email ${policies.emergency_contacts?.center_email || 'info@sunshineelc.com'}."
3. For sensitive [ESCALATED] topics, say "Let me connect you with our team — this is something our staff can help you with directly. Please call ${policies.emergency_contacts?.center_phone || '(555) 123-4567'} or ask for ${policies.emergency_contacts?.director || 'our director'}."
4. For [OFF-TOPIC] questions, politely say something like "I'm only able to help with questions about ${policies.daycare_name}! If you have any questions about our programs, hours, tuition, or policies, I'd be happy to help."
5. Keep answers concise, warm, and helpful. Use a friendly but professional tone.
6. When listing information (like menus, holidays), format it clearly.

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
          ...(Array.isArray(history) ? history.slice(-10) : []),
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
    const raw = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that. Please try again."

    // Parse classification tag
    const tagMatch = raw.match(/^\[(ANSWERED|ESCALATED|OFF-TOPIC)\]\s*/i)
    const classification = tagMatch ? tagMatch[1].toLowerCase().replace('-', '_') : 'answered'
    const reply = tagMatch ? raw.slice(tagMatch[0].length) : raw

    return res.status(200).json({ reply, classification })
  } catch (error) {
    console.error('Chat API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
