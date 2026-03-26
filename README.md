# Sunshine Early Learning Center

AI-powered front desk assistant for a daycare — parents chat, operators manage policies, and the AI gets smarter over time.

**Live app:** https://sunshine-daycare.vercel.app

## Features

- **Parent Chat** — Mobile-friendly chat with voice input and multi-turn conversations
- **Operator Dashboard** — Stats, filterable chat log with CSV export, and a live policy editor
- **AI Grounding** — Answers only from the policy knowledge base, escalates what it can't handle
- **Spam Detection** — Three-way classification (answered / escalated / off-topic) keeps the dashboard clean
- **Persistent Storage** — Policies and chat history survive page refreshes via localStorage

## Tech Stack

React, Tailwind CSS v4, OpenAI gpt-4o-mini, Vercel Serverless Functions

## Running Locally

```bash
npm install
cp .env.example .env        # add your OPENAI_API_KEY
npm run dev                  # starts on http://localhost:3000
```

## Design Decisions

See [DESIGN.md](./DESIGN.md) for architecture, grounding strategy, feedback loop, and future improvements.
