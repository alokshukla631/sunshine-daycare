# Sunshine Early Learning Center — AI Front Desk Assistant

## What I Built

A two-tab React application for a fictional daycare, "Sunshine Early Learning Center," that demonstrates how AI can handle routine parent inquiries while keeping human staff in the loop for anything the AI can't confidently answer.

1. **Parent Chat** — A mobile-friendly chat interface where parents type questions about the daycare. An AI assistant responds using only the daycare's official policies as its knowledge base. The interface includes typing indicators, scrollable message history, and a clean bubble-style layout that feels natural on both phones and desktops.

2. **Operator Dashboard** — A staff-facing view with three components:
   - **Stats overview**: Real-time counters for total questions, successfully answered questions, and escalated questions
   - **Chat log**: A searchable, filterable log of every conversation. Each entry is expandable to show the full AI response. Escalated items are flagged with a red indicator for quick triage.
   - **Policy editor**: A structured form that lets operators edit any policy section — hours, tuition, holidays, lunch menus, sick policy, pickup rules, and more. Changes propagate to the AI immediately.

### Why I Scoped It This Way

The goal was to demonstrate a complete feedback loop: parent asks a question → AI answers from policy data → operator sees the interaction → operator improves the policies → AI gets better. I intentionally kept the scope tight — one chat interface, one dashboard, one shared policy document, no auth, no database — so every piece works end-to-end without loose ends. This isn't a prototype with placeholder screens; both the parent and operator experiences are fully functional.

I chose not to add user authentication or a database because they would add complexity without demonstrating the core value proposition: an AI that's grounded in operator-controlled knowledge and knows when to escalate. For a production version, these would obviously be needed.

## Architecture

```
┌─────────────┐     POST /api/chat      ┌──────────────────┐
│  React App  │ ───────────────────────► │ Vercel Serverless │
│  (Vite)     │ ◄─────────────────────── │   Function        │
└─────────────┘     { reply }           └────────┬─────────┘
       │                                          │
       │ policies JSON                            │ System prompt +
       │ (in React state)                         │ policies JSON
       │                                          │
       │                                          ▼
       │                                 ┌──────────────────┐
       └── Operator edits policies ──►   │  OpenAI API      │
           which updates React state     │  (gpt-4o-mini)   │
           and feeds into next API call  └──────────────────┘
```

The policies JSON lives in React state, initialized from a static JSON file. When the operator edits a policy, it updates the state. The next time a parent asks a question, the updated policies are sent to the API endpoint, which injects them into the system prompt. This means there's zero delay between a policy edit and the AI using the new information.

The serverless function (`api/chat.js`) is stateless — it receives the message and current policies on every request, constructs the system prompt, calls OpenAI, and returns the response. This keeps the backend simple and means the frontend is the single source of truth for policy data.

## Grounding the AI — Preventing Hallucination

This is the most important design decision in the project. The AI must never make up information about a real business — wrong hours, wrong tuition rates, or made-up policies could erode parent trust immediately. Here's how I addressed this:

- **Policy JSON as single source of truth**: The entire policy document is serialized and injected into every API call. The system prompt explicitly instructs the AI: "Answer ONLY based on the following policies." The AI has no other context to draw from.

- **Explicit escalation rules**: The system prompt defines specific categories that should always be escalated — medical advice, billing disputes, complaints, legal matters, child safety concerns. For anything not covered in the policies, the AI directs parents to call or email the center rather than guessing.

- **Low temperature (0.3)**: I set the temperature well below the default (1.0) to reduce creative or speculative responses. For a factual Q&A system, I want the AI to be conservative and repetitive rather than inventive.

- **Stateless requests**: Each question is answered independently against the policy document. There's no conversation history sent to the API, which prevents the AI from building up incorrect context over multiple turns. (Multi-turn context is listed as a future improvement, but it would need careful handling to avoid context drift.)

- **Client-side escalation detection**: The frontend scans AI responses for escalation phrases ("connect you with our team," "reach out to us directly," etc.) and flags them in the dashboard. This gives operators visibility even if the AI's escalation phrasing varies slightly.

## The Operator Feedback Loop

This is what makes the system improve over time rather than being a static chatbot:

1. **Visibility**: The operator sees every question parents ask, along with the AI's response. This is fundamentally different from a traditional FAQ page where you never know what parents are actually asking.

2. **Escalation signals**: Flagged conversations tell the operator exactly where the AI's knowledge has gaps. If the AI keeps escalating "do you have a summer camp program?" — the operator knows to add a summer camp section to the policies.

3. **Immediate policy updates**: The editor is structured by section (hours, tuition, holidays, etc.) with appropriate input types. Adding a new holiday is as simple as clicking "+ Add item" and typing the name. The AI uses the updated policies on the very next question.

4. **Measurable improvement**: The stats cards (Total / Answered / Escalated) give the operator a quick sense of how well the AI is performing. Over time, as they fill knowledge gaps, the escalation rate should drop — a concrete metric for AI improvement.

## Tech Stack Decisions

| Choice | Why |
|--------|-----|
| **React + Vite** | Fast build times, hot module replacement for development, industry-standard for SPAs. Vite's dev server starts in under a second. |
| **Tailwind CSS v4** | Utility-first approach means I didn't need to write any custom CSS files. Every style is co-located with the component. Mobile responsiveness comes from Tailwind's responsive prefixes. |
| **OpenAI gpt-4o-mini** | The cheapest OpenAI model that's still good at following system prompt instructions. For policy Q&A, it doesn't need to be the most powerful model — it needs to be fast, cheap, and obedient to the grounding instructions. |
| **Vercel Serverless Functions** | The API route (`api/chat.js`) deploys as a serverless function automatically. No server to manage, scales to zero when not in use, and the OpenAI API key stays server-side (never exposed to the browser). |
| **No database** | Intentional for demo scope. Policies and chat logs live in React state. This means data resets on page refresh, but it keeps the architecture simple and the focus on the AI interaction pattern. |

## What I'd Add With More Time

- **Voice input**: The Web Speech API can capture voice and convert to text in about 10 lines of code. Especially useful for parents at drop-off who have their hands full.
- **Persistent storage**: Replace React state with a lightweight database (Vercel KV or Supabase) so policies and chat logs survive page refreshes. This is the most impactful improvement for real-world use.
- **Multi-turn context**: Send the last 5 messages as conversation history so parents can ask follow-up questions ("What about on Saturdays?" after asking about hours). Would need guardrails to prevent context drift.
- **Analytics dashboard**: Charts showing most common question categories, peak usage times, and escalation rate trends over days/weeks. This would help operators proactively improve policies.
- **Auto-suggested policy updates**: When the AI escalates the same topic 3+ times, automatically surface a suggestion to the operator: "Parents keep asking about summer programs — consider adding a policy section for this."
- **Authentication**: Separate parent and operator logins so the dashboard is access-controlled and chat history is per-parent.
- **Notification system**: Real-time alerts (browser notifications or email) to operators when an escalation happens, so they can respond quickly.
- **Export functionality**: Let operators export the chat log as CSV for reporting, or export the policy JSON as a backup.
