## AI Router for Korean Users — Requirements Definition (MVP v2)

### 1. Purpose

- Provide a web interface where Korean users can ask AI questions naturally.
- Improve prompt clarity before sending requests to LLMs.
- Route questions through a lightweight optimization layer.
- Return responses in Korean while preserving the English reasoning layer.
- Enable easy internal usage and public web access.

---

# 2. Product Concept

The system acts as a **Prompt Optimization and AI Routing Layer**.

```
Korean Question
→ Router
→ Prompt Optimizer
→ LLM
→ Translation
→ Korean Response
```

The system improves:

- prompt structure
- response clarity
- usability for Korean-speaking users

Primary value is **prompt quality improvement**, not guaranteed token reduction.

---

# 3. Target Users

Internal team members:

- developers
- product managers
- operations staff
- AI power users

Future expansion:

- Korean AI users in general

---

# 4. Authentication

### Login Method

Users authenticate using their own AI API keys.

Supported keys:

- Claude API key
- OpenAI API key (optional)

---

### Key Storage Options

Two acceptable approaches:

1. **Browser local storage (default for MVP)**
2. **Encrypted server-side storage**

---

### Security Requirements

- API keys must never be logged.
- API keys must not be exposed in UI responses.
- All communication must use HTTPS.
- Environment variables must be used for system-level secrets.

---

# 5. Core Features

The MVP includes six primary features.

---

# 6. Feature 1 — Question Input

### Purpose

Allow users to submit questions in Korean.

### UI Element

Input field:

```
Placeholder: "질문을 입력하세요"
```

Example inputs:

- 이 코드 왜 느려?
- 이 문서 요약해줘
- 이 에러 왜 나는거야?

---

### Optional Settings

Response length selector:

- Short
- Normal

---

# 7. Feature 2 — Router

### Purpose

Determine how the question should be processed.

The router evaluates:

- question length
- code presence
- question intent

---

## 7.1 Question Length Rule

```
≤ 120 characters → simple
> 120 characters → complex
```

---

## 7.2 Code Detection

Router detects programming content via patterns.

Examples:

```
{}
()
;
=
function
class
SELECT
```

or fenced code blocks:

```
```code```
```

---

## 7.3 Intent Detection

Router classifies the question into one category:

- Explain
- Summarize
- Compare
- Troubleshoot
- Rewrite
- Generate
- Analyze

---

# 8. Feature 3 — Prompt Optimizer

### Purpose

Convert Korean questions into LLM-friendly English prompts.

Two modes are used.

---

## 8.1 Rule-Based Optimizer

Used for simple questions.

Example:

Input:

```
이 코드 왜 느려?
```

Output:

```
Analyze why this code is slow.
```

No additional LLM call required.

---

## 8.2 LLM Optimizer

Used for complex questions.

Example:

Input:

```
이 코드가 느린 것 같은데 DB 쿼리가 문제인 것 같아.
병목이 어디인지 봐줄 수 있어?
```

Output:

```
Analyze the performance of this code, especially database queries.
Identify potential bottlenecks and suggest improvements.
```

---

# 9. Prompt Construction Rules

During optimization, the system must follow these rules:

- preserve original intent
- remove filler expressions
- convert to imperative structure
- split multiple tasks into separate instructions
- keep prompts concise
- preserve technical identifiers

---

## Technical Terms That Must Never Be Translated

Examples include:

- API
- SQL
- SAP
- ABAP
- RFC
- table names
- class names
- error codes

---

# 10. Feature 4 — LLM Request

The optimized prompt is sent to the selected LLM.

Input:

```
optimized_prompt
```

Supported LLM providers:

- Claude API (primary)
- OpenAI API (optional)

Response format:

```
English response
```

---

# 11. Feature 5 — Translation Layer

### Purpose

Convert the English response into Korean.

### Translation Rules

The system must preserve:

- code
- technical identifiers
- API names
- SAP transaction codes
- table names
- class names

Output example:

```
한국어 설명
```

---

# 12. Feature 6 — Debug Transparency

The system should allow users to inspect internal processing.

Expandable section includes:

```
English Response
Optimized Prompt
Router Decision
```

Example display:

```
Router: rule-based
```

---

# 13. User Interface Layout

Single-page interface.

---

## Top Section

```
Question Input Field
Response Length Selector
```

---

## Middle Section

```
Korean Response Output
```

---

## Expandable Debug Section

```
English Response
Optimized Prompt
Router Decision
```

---

# 14. System Flow

Full system workflow:

```
User Question
↓
Router
↓
Prompt Optimizer
↓
LLM API
↓
English Response
↓
Translation Layer
↓
User Output
```

---

# 15. Non-Functional Requirements

### Response Time

Target latency:

```
≤ 3 seconds
```

---

### Reliability

If LLM request fails:

```
Retry once
```

---

### Security

- HTTPS required
- API keys encrypted or locally stored
- API keys must never appear in logs
- environment variables used for secrets

---

# 16. Deployment Requirements

The application must support **public web deployment**.

---

## Primary Deployment Platform

Preferred platform:

- **Vercel**

Reasons:

- supports serverless functions
- simple deployment pipeline
- environment variable management
- ideal for Next.js applications

---

## Optional Backend Deployment

Alternative architecture:

Frontend:

- Vercel

Backend:

- Render

Backend responsibilities may include:

- Router logic
- Prompt optimizer
- LLM proxy
- translation handling

---

## GitHub Pages Usage

GitHub Pages may only be used for:

- static landing page
- project documentation
- demo UI without backend logic

It must **not** host LLM calls or secret handling.

---

# 17. Architecture Requirements

The system must support modular architecture.

Modules should be separable:

- Router module
- Prompt optimizer module
- LLM request module
- Translation module

These modules must be replaceable without affecting the overall system.

---

# 18. MVP Scope

### Included

- API key login
- Korean question input
- Router
- Rule-based prompt optimizer
- LLM optimizer fallback
- LLM request handling
- Translation layer
- Debug transparency panel
- public deployment support

---

### Excluded

The following are intentionally excluded from MVP:

- automatic model selection
- token analytics dashboard
- prompt sharing
- team collaboration features
- Slack integration
- IDE plugins
- caching layer
- usage analytics

---

# 19. Success Criteria

### Qualitative

Users report:

- asking AI feels easier
- prompts appear clearer
- AI responses are more helpful

---

### Quantitative

Internal adoption goal:

```
Each team member uses the system ≥ 3 times per week
```

---

# 20. Estimated Development Timeline

| Task | Duration |
| --- | --- |
| UI Implementation | 1 day |
| Router Implementation | 1 day |
| Prompt Optimizer | 1 day |
| LLM Integration | 1 day |
| Translation Layer | 1 day |

Total estimate:

```
~5 days
```

---

# Final Definition

System definition:

```
A lightweight AI Router and Prompt Optimization Layer for Korean users.
```

Core functionality:

```
Korean Question
→ optimized English reasoning
→ Korean response output
```

# Additional Feature — Token Cost Estimation

## Purpose

Provide visibility into AI usage cost by estimating token consumption and approximate API cost for each request.

Goals:

- help users understand LLM cost
- improve transparency of AI usage
- allow comparison between optimized vs non-optimized prompts
- provide cost awareness for internal team usage

---

# 21. Feature — Token Usage Estimation

The system must estimate token usage for each request.

Two metrics should be displayed:

- **Estimated token usage**
- **Estimated API cost**

---

## 21.1 Token Calculation Scope

Token estimation must include:

- prompt tokens (optimized prompt)
- response tokens (LLM output)

Optional:

- translation tokens

---

## 21.2 Token Calculation Flow

```
Optimized Prompt
↓
Token Estimator
↓
LLM Request
↓
Response Tokens
↓
Cost Calculation
```

---

## 21.3 Cost Calculation Formula

```
Total Tokens = Prompt Tokens + Response Tokens
```

Cost estimation:

```
Estimated Cost = (Prompt Tokens × Prompt Rate) + (Response Tokens × Response Rate)
```

Example pricing configuration:

```
Claude Sonnet
Prompt: $X / 1M tokens
Response: $Y / 1M tokens
```

Rates must be configurable via environment variables.

---

# 22. Token Comparison (Optional but Recommended)

The system may estimate **baseline token usage** without prompt optimization.

Purpose:

- show the effect of the optimizer
- provide insight into efficiency

Example UI:

```
Estimated Tokens

Baseline Prompt
230 tokens

Optimized Prompt
165 tokens

Reduction
-28%
```

This calculation can be approximate.

---

# 23. UI Display — Token Information

Token usage information should appear below the response.

Example display:

```
Token Usage

Prompt Tokens: 120
Response Tokens: 340
Total Tokens: 460

Estimated Cost: $0.0023
```

---

# 24. Token Data Source

Token counts may be obtained from:

- LLM API usage metadata (preferred)
- tokenizer library estimation (fallback)

Possible approaches:

1. **API response usage field**
2. **Local tokenizer library**

---

# 25. Token Cost Configuration

Cost rates must be configurable.

Example configuration:

```
MODEL_NAME
PROMPT_COST_PER_MILLION
RESPONSE_COST_PER_MILLION
```

These values should be stored in:

- environment variables
- configuration file

---

# 26. Non-Functional Requirements — Cost Transparency

The system must:

- display token usage for every request
- update cost calculation dynamically
- allow easy modification of pricing parameters

---

# 27. MVP Scope for Token Feature

### Included

- token usage display
- estimated cost calculation
- prompt + response token count

### Excluded

- monthly usage dashboard
- team-wide cost analytics
- billing management

---

# 28. Example User Output

Example UI section:

```
AI Response

[ Korean answer ]

Token Usage

Prompt Tokens: 110
Response Tokens: 290
Total Tokens: 400

Estimated Cost: $0.0018
```

Optional expanded view:

```
Optimization Effect

Baseline Tokens: 520
Optimized Tokens: 400
Savings: 23%
```

---

# Updated System Flow

```
User Question
↓
Router
↓
Prompt Optimizer
↓
Token Estimator
↓
LLM API
↓
Response Tokens
↓
Cost Calculator
↓
Translation
↓
User Output
```

---

# Final Definition (Updated)

System definition:

```
A lightweight AI Router and Prompt Optimization Layer for Korean users with built-in token cost visibility.
```

Core pipeline:

```
Korean Question
→ optimized English prompt
→ LLM reasoning
→ Korean response
→ token cost estimation
```