# Spendify AI Expense Tracker

Live Demo: **ADD_YOUR_VERCEL_URL_HERE**

AI-powered expense tracker with conversational CRUD, analytics, budgeting, recurring detection, multi-currency support, voice input, and Supabase persistence.

## Features

- Email/password authentication with Supabase Auth
- Persistent expenses/categories/budgets in Supabase Postgres
- AI chatbot (Gemini function-calling) for create/read/update/delete/query
- Context-aware chat memory (last expense, last query, pending confirmations)
- Safe bulk delete confirmation flow in chat
- Dashboard + analytics charts (category mix, trends, budget health, merchants)
- Advanced transactions filtering/sorting/search + CSV/PDF export
- Recurring expense detection + recurring rules management
- Multi-currency expense entry with base-currency analytics conversion
- Theme toggle (light/dark) stored in user profile
- Voice input in chat via Web Speech API

## Tech Stack

- Frontend: React (Create React App)
- Data/Auth: Supabase (Postgres + Auth + RLS)
- AI: Gemini API (environment variable key)
- Charts: Recharts
- Testing: Jest + React Testing Library

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env` in project root:
   ```env
   REACT_APP_SUPABASE_URL=your_supabase_project_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   REACT_APP_GEMINI_API_KEY=your_gemini_api_key
   ```
3. Apply DB schema in Supabase SQL editor:
   - Run [`supabase/schema.sql`](./supabase/schema.sql)
4. Start app:
   ```bash
   npm start
   ```
5. Open `http://localhost:3000`
6. Sign up/sign in and start using chat (key is loaded from environment variable).

## Environment Variables

- `REACT_APP_SUPABASE_URL`: Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY`: Supabase anon key
- `REACT_APP_GEMINI_API_KEY`: Gemini API key for chat requests

## Architecture and Design

- UI layer: page components for dashboard, transactions, categories, budgets, analytics, chat
- Data layer: Supabase-backed services in `src/services/db.js` and `src/services/fx.js`
- AI layer:
  - Tool declarations in `src/constants/geminiTools.js`
  - Tool execution in `src/services/chatTools.js` (DB-backed)
  - Chat UI + function-calling orchestration in `src/components/ChatPanel.jsx`
- Business logic:
  - Recurring detection in `src/utils/recurring.js`
  - Chat safety/context helpers in `src/utils/chatGuard.js`

## AI Integration (CRUD + State)

Chatbot uses Gemini function calling with tools:

- `add_expense`
- `query_expenses`
- `update_expense`
- `delete_expense`
- `confirm_action`
- `compare_spending`
- `get_budget_status`
- `get_insights`

Execution flow:

1. User message -> Gemini tool call(s)
2. Tool calls executed against Supabase tables (real DB operations)
3. Tool response sent back to Gemini
4. Final natural-language response rendered

Context state is persisted in `chat_context`:

- `last_expense_id`
- `last_query_signature`
- `last_result_set_ids`
- `pending_confirmation_action`

Bulk deletes require explicit confirmation via `confirm_action`.

## Deployment Instructions (Vercel)

1. Push repo to GitHub
2. Import repo in Vercel
3. Add env vars in Vercel Project Settings:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
   - `REACT_APP_GEMINI_API_KEY`
4. Deploy
5. Run Supabase schema migration (`supabase/schema.sql`) in production project
6. Copy Vercel URL to README Live Demo field

## Database and Security

- All data tables are user-scoped via `user_id`
- Row Level Security enabled on all application tables
- Policies ensure users can only read/write their own rows
- Chat messages/context are constrained via chat session ownership policies

## Tests

Run tests:

```bash
npm test -- --watchAll=false
```

Included tests:

- recurring detection logic (`src/utils/recurring.test.js`)
- chat guard/context resolution (`src/utils/chatGuard.test.js`)

## Demo Assets

- Add screenshots/GIF/video in this section before submission
- Include sample chat flows:
  - Add expense by natural language
  - Query monthly spend
  - Update latest expense
  - Bulk delete + confirmation
  - Budget tracking insights

## Submission Checklist

- [ ] Private GitHub repository created
- [ ] Collaborators added:
  - `Aswath363`
  - `akshaiP`
  - `ashwanthnebula`
- [ ] Live demo deployed and URL added to README
- [ ] README fully filled (this file)
- [ ] Submission email sent with repo + demo links

## Future Improvements

- OCR receipt scanning (deferred in this scope)
- Better recurring suggestions with ML confidence model
- Server-side Gemini proxy with observability and rate limiting
- Role-based sharing/family workspace mode
- Alert notifications for budget overrun thresholds

