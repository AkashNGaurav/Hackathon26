# European specialist chat agents

## Purpose

The chatbot is split into three independent European-market agents. Each agent has a narrowly scoped system prompt, its own API route, and its own conversation memory. A request sent to one agent is never included in another agent's prompt.

| Agent | Route | Scope |
| --- | --- | --- |
| Mutual Fund | `POST /api/chat/mutual-funds` | European mutual funds and UCITS funds |
| ETF | `POST /api/chat/etfs` | European/UCITS exchange-traded funds |
| Stock | `POST /api/chat/stocks` | Individual equities listed on European exchanges |
| Investment Advisor | `POST /api/chat/investment-advisor` | Investment education and portfolio-analysis support |

All three endpoints accept the same body:

```json
{
  "message": "What is the difference between accumulating and distributing share classes?",
  "session_id": "optional-existing-session-id"
}
```

`session_id` is optional on the first request. The API creates and returns a UUID if it is omitted. The UI must send that returned ID on the next message for the same selected specialist.

```json
{
  "reply": "...",
  "step": "OUTPUT",
  "session_id": "e1af2fbc-4124-4af8-a50d-4f8f6e5deee8",
  "agent": "etf"
}
```

## Request flow

```text
React specialist selector
  -> POST /api/chat/{mutual-funds|etfs|stocks|investment-advisor}
  -> FastAPI selects the matching agent class
  -> load last 12 rows for (session_id, agent_type)
  -> append and save the new user message
  -> send the selected agent's strict system prompt + history to the AI provider
  -> save assistant reply as a checkpoint
  -> return reply and session_id to the UI
```

## Memory/checkpointer table

`agent_checkpoints` stores every user and assistant turn.

| Column | Use |
| --- | --- |
| `session_id` | Identifies one browser conversation |
| `agent_type` | Keeps mutual-fund, ETF, and stock memories separate |
| `role` | `user` or `assistant`, used to reconstruct model messages |
| `content` | The exact message for the turn |
| `created_at` | Orders the conversation history |

At most the latest 12 stored messages are passed to the model, controlling prompt size while retaining recent context. The complete table remains available for future audit, retention, or deletion policies.

## Runtime efficiency

The backend creates a lightweight agent wrapper for each request, but it does **not** create a new Gemini/OpenAI HTTP client each time. `get_gemini_client()` is process-cached, so all agent types reuse one configured provider client and its connection pool.

The agent wrapper is deliberately not cached by `session_id`: it contains the request-scoped SQLAlchemy database session, which is closed at the end of each request and is not safe to share across concurrent requests. Conversation state is instead restored efficiently from `agent_checkpoints` using the `(session_id, agent_type)` query.

The `ix_agent_checkpoints_session_agent_created` composite index supports that lookup and its chronological ordering.

## Error handling

- Provider configuration, timeout, rate-limit, and other provider API errors return a safe temporary-unavailable chat reply and are logged server-side.
- Database writes roll back their SQLAlchemy session before the error is propagated.
- Database errors are logged and returned by the API as HTTP `503` without exposing database details.
- Unexpected programming errors are not silently converted into chat content; they continue through FastAPI's normal `500` handling so they can be diagnosed.

## Database setup

For existing databases, apply the new migration from `backend/`:

```bash
alembic upgrade head
```

For a fresh local database, the application's SQLAlchemy metadata also creates the table at startup. Alembic remains the recommended deployment path.

## Prompt boundaries

The prompts are defined in `backend/app/agents.py`. Each explicitly restricts its agent to a single product category and directs it to refuse any other category. This is a prompt-level guardrail, so production deployments that need strong enforcement should also add deterministic topic classification before the model call.

The Investment Advisor is intentionally broader than the product specialists: it is limited to investment education and portfolio analysis. It can explain portfolio diversification and risk, but it must not provide personalised trade instructions or make up live market data.
