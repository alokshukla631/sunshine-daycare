# Sunshine Early Learning Center — AI Front Desk Assistant

## What We Built

A two-tab React application for a fictional daycare, "Sunshine Early Learning Center":

1. **Parent Chat** — A mobile-friendly chat interface where parents ask questions about the daycare. An AI assistant answers using only the daycare's official policies as its knowledge base.

2. **Operator Dashboard** — A staff-facing view showing all conversations, flagging escalations, and providing a live policy editor that immediately updates the AI's knowledge.

### Why This Scope

The spec asked for both the parent and operator perspectives working end-to-end. We kept the scope tight: one chat interface, one dashboard, one shared policy document. No auth, no database, no unnecessary complexity. Everything works in a single session and deploys as a single Vercel project.

## Grounding the AI — Preventing Hallucination

The AI is constrained through a carefully designed system prompt:

- **Policy JSON as single source of truth**: The entire policy document is injected into every API call. The AI is instructed to answer ONLY based on this data.
- **Explicit escalation rules**: When a question falls outside the policies (or touches sensitive topics like medical advice, billing disputes, or complaints), the AI says "Let me connect you with our team" instead of guessing.
- **Low temperature (0.3)**: Reduces creative/speculative responses. We want factual, grounded answers.
- **No persistent memory**: Each question is stateless against the policy document, preventing context drift.

## The Operator Feedback Loop

This is the core value of the system:

1. **See where AI struggled**: The dashboard flags every escalated conversation with a red indicator. Operators can filter to see only escalated questions.
2. **Identify knowledge gaps**: If the AI keeps escalating "do you have a summer camp program?" — the operator knows to add a summer camp policy.
3. **Edit policies in real-time**: The policy editor lets operators add holidays, update tuition rates, change the lunch menu, or add entirely new policy sections. Changes take effect immediately — the next chat message uses the updated policies.
4. **Continuous improvement**: Over time, the escalation rate drops as operators fill knowledge gaps based on real parent questions.

## Tech Stack

- **React** (Vite) — Fast development, modern tooling
- **Tailwind CSS v4** — Utility-first styling, mobile-responsive by default
- **OpenAI API** (gpt-4o-mini) — Cost-effective, fast responses, sufficient quality for policy Q&A
- **Vercel** — Serverless functions for the API route, static hosting for the frontend
- **No database** — Policies live in-memory (from JSON). Chat log lives in React state. This is intentional for the demo scope.

## What We'd Add With More Time

- **Voice input**: Web Speech API for hands-free parent questions (especially useful during drop-off)
- **Analytics dashboard**: Charts showing most common question categories, peak usage times, and escalation rate trends
- **Auto-suggested policy updates**: When the AI can't answer a question that's been asked 3+ times, automatically suggest a policy addition to the operator
- **Persistent storage**: Database for chat logs and policies so data survives page refreshes
- **Authentication**: Separate parent and operator logins
- **Multi-turn context**: Conversation history for follow-up questions
- **Notification system**: Real-time alerts to operators when escalations happen
