# development

# AI Router for Korean Users — Development Design Document (MVP)

## 1. Scope

### In Scope
-Public web app
-User provides own API key
-Korean question input
-Simple router
-Rule-based prompt optimizer
-LLM-based optimizer fallback
-English LLM response
-Korean translation
-Token and cost estimation
-Debug transparency view
-Deployable on Vercel or Vercel + Render

### Out of Scope
-Automatic model selection
-Team analytics
-Shared prompt library
-Slack integration
-IDE plugins
-Caching layer
-Billing dashboard

---

# 2. System Architecture

## High-Level Flow
```

Client UI
↓
API Layer
↓
Router
↓
Prompt Optimizer
↓
LLM Request
↓
Translation Layer
↓
Token / Cost Estimator
↓
Response Formatter
↓
Client UI

```

## Runtime Decision Flow
```

Korean Question
↓
Router
├─ simple → rule-based optimizer
└─ complex → LLM optimizer
↓
optimized English prompt
↓
main LLM call
↓
English response
↓
translation
↓
token/cost estimation
↓
final response

```

---

# 3. Recommended Tech Stack

## Option A — Fastest MVP
- Frontend: Next.js
- Backend: Next.js Route Handlers / Server Actions
- Deployment: Vercel
- Storage: browser local storage for user API key
- No separate backend server

## Option B — Cleaner Separation
- Frontend: Next.js
- Backend: FastAPI
- Deployment:
  - Frontend on Vercel
  - Backend on Render
- Better if logic grows quickly

### Recommendation
Start with **Option A** and keep modules isolated for future backend separation.

---

# 4. Project Structure

## Next.js Monorepo Structure
```

ai-router/
├─ app/
│ ├─ page.tsx
│ ├─ api/
│ │ ├─ chat/route.ts
│ │ ├─ optimize/route.ts
│ │ └─ health/route.ts
├─ components/
│ ├─ ChatInput.tsx
│ ├─ ResponsePanel.tsx
│ ├─ DebugPanel.tsx
│ ├─ TokenUsagePanel.tsx
│ └─ ApiKeyModal.tsx
├─ lib/
│ ├─ router.ts
│ ├─ optimizer/
│ │ ├─ ruleBased.ts
│ │ ├─ llmBased.ts
│ │ └─ templates.ts
│ ├─ llm/
│ │ ├─ claude.ts
│ │ └─ openai.ts
│ ├─ translation.ts
│ ├─ tokenizer.ts
│ ├─ cost.ts
│ ├─ detectIntent.ts
│ ├─ detectCode.ts
│ ├─ types.ts
│ └─ config.ts
├─ public/
├─ .env.local
├─ package.json
└─ README.md

```

---

# 5. Core Modules

## 5.1 Router

### Responsibility
- Decide whether the question is simple or complex
- Detect whether technical mode is needed
- Detect intent category

### Inputs
- Raw Korean question
- Character length
- Code presence
- Keyword patterns

### Outputs
- Route type (`rule_based` or `llm_optimized`)
- Detected intent
- Technical mode flag

### Router Rules
- `length <= 120` → simple
- `length > 120` → complex
- code block present → technical mode
- multiple requests → complex

### Technical Keywords
```

API
SQL
SAP
ABAP
RFC
class
table
error
dump
ST22
SM37
SELECT

```

---

## 5.2 Intent Detector

### Intent Categories
- explain
- summarize
- compare
- troubleshoot
- rewrite
- generate
- analyze

### Heuristic Examples

| Keyword | Intent |
|--------|-------|
요약 | summarize |
핵심 | summarize |
비교 | compare |
차이 | compare |
자연스럽게 | rewrite |
다듬 | rewrite |
추천 | generate |
아이디어 | generate |
병목 | analyze |
성능 | analyze |
느려 | analyze |
에러 | troubleshoot |
오류 | troubleshoot |
설명 | explain |
왜 | explain |

---

## 5.3 Rule-Based Optimizer

### Purpose
Convert simple Korean questions into concise English prompts.

### Processing
- Remove filler words
- Preserve meaning
- Apply intent template
- Append style constraint

### Filler Words Removed
```

혹시
좀
약간
그냥
봐줄래
알려줄 수 있어
느낌인데

```

### Example

Input:
```

이 코드 왜 느려?

```

Output:
```

Analyze why this code is slow.
Keep the answer concise.

```

---

## 5.4 LLM-Based Optimizer

### Usage
Used for complex questions.

### System Prompt
```

Rewrite the user’s Korean question into a concise, clear English prompt for an LLM.
Preserve the original intent.
Remove filler expressions.
Split multiple tasks into separate instructions.
Preserve technical terms, code, identifiers, class names, table names, API names, and acronyms.
Return only the optimized English prompt.

```

### Example

Input:
```

이 코드가 느린 것 같은데 DB 쿼리가 문제인 것 같아. 병목이 어디인지 봐줄 수 있어?

```

Output:
```

Analyze the performance of this code, especially database queries.
Identify potential bottlenecks and suggest improvements.

```

---

## 5.5 LLM Request Module

### Supported Providers
- Claude
- OpenAI

### Input
- optimized prompt
- user API key
- response length
- technical mode

### Output
English response text

### Response Style Rules
```

Keep the answer concise.
Use short bullet points when appropriate.
Preserve technical terms exactly.

```

---

## 5.6 Translation Layer

### Purpose
Translate English response into Korean.

### Rules
Preserve:
- code
- identifiers
- class names
- table names
- transaction codes
- API names
- acronyms

### Translation Prompt
```

Translate the following English answer into natural Korean.
Preserve all code, identifiers, class names, table names, API names, transaction codes, and acronyms in English.
Do not over-explain.
Return only the Korean translation.

```

---

## 5.7 Token Estimator

### Responsibility
Calculate:

- prompt tokens
- response tokens
- translation tokens
- total tokens

### Preferred Source
LLM API usage metadata.

### Fallback
Local tokenizer estimation.

---

## 5.8 Cost Calculator

### Formula
```

total_cost =
(prompt_tokens * prompt_rate_per_token) +
(response_tokens * response_rate_per_token) +
(translation_tokens * translation_rate_per_token)

```

### Config Variables
```

MODEL_NAME
PROMPT_COST_PER_MILLION
RESPONSE_COST_PER_MILLION
TRANSLATION_COST_PER_MILLION

```

---

# 6. API Design

## POST `/api/chat`

### Request

```json
{
  "question": "이 코드 왜 느려?",
  "responseLength": "short",
  "provider": "claude",
  "apiKey": "user-provided-key"
}
```

### Response

```json
{
  "koreanResponse": "이 코드가 느린 이유는 ...",
  "englishResponse": "The code is slow because ...",
  "optimizedPrompt": "Analyze why this code is slow. Keep the answer concise.",
  "routerDecision": "rule_based",
  "intent": "analyze",
  "technicalMode": true,
  "tokenUsage": {
    "promptTokens": 120,
    "responseTokens": 280,
    "translationTokens": 90,
    "totalTokens": 490
  },
  "estimatedCost": {
    "currency": "USD",
    "amount": 0.0021
  }
}
```

---

## POST `/api/optimize`

### Request

```json
{
  "question": "이 코드 병목 어디야?",
  "responseLength": "short"
}
```

### Response

```json
{
  "optimizedPrompt": "Analyze why this code is slow. Identify bottlenecks and suggest improvements.",
  "routerDecision": "llm_optimized",
  "intent": "analyze",
  "technicalMode": true
}
```

---

## GET `/api/health`

### Response

```json
{
  "status": "ok"
}
```

---

# 7. Type Definitions (TypeScript)

```tsx
export type IntentType =
  | "explain"
  | "summarize"
  | "compare"
  | "troubleshoot"
  | "rewrite"
  | "generate"
  | "analyze";

export type RouterDecision = "rule_based" | "llm_optimized";

export interface ChatRequest {
  question: string;
  responseLength: "short" | "normal";
  provider: "claude" | "openai";
  apiKey: string;
}

export interface TokenUsage {
  promptTokens: number;
  responseTokens: number;
  translationTokens?: number;
  totalTokens: number;
}

export interface CostEstimate {
  currency: "USD";
  amount: number;
}

export interface ChatResponse {
  koreanResponse: string;
  englishResponse: string;
  optimizedPrompt: string;
  routerDecision: RouterDecision;
  intent: IntentType;
  technicalMode: boolean;
  tokenUsage: TokenUsage;
  estimatedCost: CostEstimate;
}
```

---

# 8. Pseudocode

## Router

```
function routeQuestion(question):
    length = question.length
    hasCode = detectCode(question)
    intent = detectIntent(question)

    if length > 120:
        return llm_optimized

    if hasCode:
        return llm_optimized

    return rule_based
```

---

## Intent Detection

```
if contains("요약"): summarize
if contains("차이"): compare
if contains("다듬"): rewrite
if contains("추천"): generate
if contains("성능"): analyze
if contains("에러"): troubleshoot
else explain
```

---

# 9. Frontend Components

| Component | Purpose |
| --- | --- |
| ApiKeyModal | Collect API key |
| ChatInput | Korean question input |
| ResponsePanel | Korean answer |
| DebugPanel | Show internal processing |
| TokenUsagePanel | Show token usage and cost |

---

# 10. Security Design

### Rules

- API keys never logged
- API keys never returned to client
- Only server-side LLM calls
- HTTPS required
- Secrets stored in environment variables

---

# 11. Deployment

## Primary Deployment

**Vercel**

Advantages:

- serverless functions
- simple CI/CD
- environment variable support

---

## Alternative Architecture

Frontend:

- Vercel

Backend:

- Render

---

## GitHub Pages

Allowed only for:

- documentation
- landing page
- static demos

Not allowed for:

- API handling
- secret storage

---

# 12. Implementation Order

1. UI layout
2. `/api/chat` endpoint
3. rule-based router
4. rule-based optimizer
5. LLM integration
6. translation layer
7. token estimation
8. cost estimation
9. debug panel

---

# 13. Testing Plan

### Unit Tests

- detectIntent
- detectCode
- router
- optimizer
- cost calculator

### Integration Tests

- simple question flow
- complex question flow
- translation correctness
- invalid API key

---

# 14. MVP Success Criteria

Users can:

- input Korean questions
- receive Korean answers
- inspect English reasoning
- see token usage
- access public web app