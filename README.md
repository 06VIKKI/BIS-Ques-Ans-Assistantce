# BIS-Assist: Bureau of Indian Standards QA Assistant

> **Ask a question about an Indian Standard, get the answer and the exact clause it came from. Then audit a specification against those clauses and download the report.**

[![Node](https://img.shields.io/badge/Node.js-18.18%2B-339933.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000.svg)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

BIS-Assist runs entirely on its own. There is **no API key, no model download, no training step and no external service**. The intelligence is a built-in, hand-curated knowledge base of clause excerpts from IS 456, IS 800, IS 1786 and IS 9873, searched with a local BM25 retriever and backed by deterministic calculators and rule checkers.

---

## Read this first: what the knowledge base is, and is not

The clause text in this project is a **condensed reference summary written for demonstration**, not a verbatim copy of the published standards (BIS standards are copyrighted publications). Clause numbers follow the standards as closely as the author could confirm, but **page numbers are indicative, and individual values should be verified**.

- The UI says this wherever clause text appears.
- Before using any number in a design, test report or purchase specification, check it against the official BIS publication.
- Only the grades and limits present in the corpus are checked. For example, chemistry limits for Fe 415D, Fe 550, Fe 550D and Fe 600 are not loaded, so the rebar check reports "not applicable" for them instead of guessing.

To make this production-grade for a real organisation, replace the files in `backend/data/clauses/` with text you are licensed to use (see [Extending the knowledge base](#extending-the-knowledge-base)).

---

## What it does

| Feature | How it works |
| :--- | :--- |
| **Chat with citations** | Ask in plain language. Answers stream in and contain numbered markers `[1]`, `[2]` that map to the clauses used. |
| **Quick-query pills** | Ten one-click questions for common compliance queries, each answerable from the corpus. |
| **Forensic evidence panel** | Right-hand panel with one card per clause, labelled like `[IS 456: Clause 26.4.2.1, Page 47]`. Click a card, or a marker in the answer, to expand the excerpt with the matched words highlighted. |
| **Refuses to guess** | If no clause matches strongly enough, the assistant says so and cites nothing. Numeric questions with missing inputs are not answered with an invented number. |
| **Worked calculations** | Development length, lap length, modulus and flexural strength of concrete, rebar mass per metre. Steps are shown. |
| **Compliance checker** | Five audit modules (RC beam, RC column, rebar test report, steel member and connection, toy safety) with 9 to 14 clause-linked checks each, returning **PASS / FAIL / PASS WITH OBSERVATIONS**. |
| **Specification upload** | Upload a `.json`, `.csv` or `.txt` file of parameters. It is parsed, the form is filled, and the audit runs immediately. |
| **Exportable audit trail** | Download the session log (JSON, CSV, Markdown) and each compliance report (printable HTML, Markdown, JSON). |
| **Tamper-evident log** | Every event is hash-chained (SHA-256) to the previous one. Editing or deleting a row in an exported log breaks verification. |
| **Dark and light themes** | Follows your system setting, remembers your choice, no flash on load. |
| **Responsive** | Evidence panel becomes a bottom sheet on phones. |

---

## Supported standards

| Standard | Edition | Subject | Clause excerpts |
| :--- | :---: | :--- | :---: |
| **IS 456** | 2000 | Plain and reinforced concrete: grades, durability, cover, detailing, shear, quality control | 32 |
| **IS 800** | 2007 | General construction in steel: classification, slenderness, deflection, bolts, welds | 24 |
| **IS 1786** | 2008 | High strength deformed bars: grades, tensile properties, chemistry, mass tolerance | 7 |
| **IS 9873 (Part 1)** | 1999 | Safety of toys: small parts, cords, edges, warnings | 5 |
| **IS 9873 (Part 3)** | 2014 | Safety of toys: migration of heavy elements | 2 |

---

## Quickstart

### Prerequisites
- **Node.js 18.18 or newer** (tested on Node 22) and **npm**
- No Python, no database, no API keys

### Install and run (two commands)

```bash
# 1. Install everything (the root install also installs the frontend)
npm install

# 2. Start the API and the web client together with hot reload
npm run dev
```

Open **http://localhost:5173**. The API runs on http://localhost:8000.

### In VS Code
1. **File > Open Folder**, choose the `bis-assist` folder.
2. Open the integrated terminal (**Ctrl+`**) and run the two commands above.

### Other commands

| Command | What it does |
| :--- | :--- |
| `npm run dev` | API (port 8000, auto-restart) and Vite client (port 5173, hot reload) |
| `npm run build` | Build the production web client into `frontend/dist` |
| `npm start` | Serve the API **and** the built client on http://localhost:8000 |
| `npm test` | Run the 33 backend tests |

### Production mode on your machine

```bash
npm run build
npm start
# open http://localhost:8000
```

---

## Using the app

1. **Ask a question.** Click a pill such as *Column cover, moderate exposure*, or type your own. Watch the answer stream in.
2. **Check the evidence.** Click a numbered marker `[1]` in the answer. The matching card opens in the right panel with the excerpt and highlighted terms. On a phone, tap *Evidence*.
3. **Try a calculation.** Ask *"Development length for a 16 mm Fe 500 bar in M25 concrete"* and the working is shown, ending in **777 mm**.
4. **Run a compliance audit.** Open **Compliance check**, pick a module, and press *Run compliance audit*. Failed checks open automatically with the clause text and a corrective action.
5. **Upload a specification.** Use *Choose file*, drag a file in, or load one of the files in [`samples/`](samples/). The file is read in the browser and parsed on the server (it is not stored).
6. **Export.** Download the report from the result, or the full session log from **Audit trail**.

### Specification file formats

Any of these works. Keys can be the field key (`fck`), the label (`Concrete grade`), or a common alias (`width`).

```text
# key: value  (also key = value)
module: beam-456
width: 300
overall depth: 550
effective depth: 500
concrete grade: 25
```

```json
{ "module": "beam-456", "values": { "b": 300, "D": 550, "d": 500, "fck": "25" } }
```

```csv
b,D,d,fck,fy
300,550,500,25,500
```

If `module` is omitted, the module is detected from the parameter names. Ready-made files are in `samples/`.

### Things worth asking

- *What is the minimum cover for a column in severe exposure?* (answers 45 mm and explains why)
- *Minimum cement content and water-cement ratio for severe exposure*
- *What is the lap length for 16 mm Fe 415 in M20?*
- *Which grades does IS 1786 cover?*
- *Bolt pitch and edge distance rules in IS 800*
- *Small parts cylinder requirement for toys under 3 years*
- *weather in delhi* (it declines, because no clause supports an answer)

---

## Architecture

```
BIS-Assist
│
├── 🧠 Knowledge base                 backend/data/
│   ├── clauses/is456.js ...          70 clause excerpts, each with id, clause, page, heading, text, keywords
│   ├── intents.js                    32 curated answers for common questions, each tied to specific clauses
│   ├── standards.js                  document metadata and the corpus notice
│   └── quickPrompts.js               suggestion pills
│
├── ⚙️  Answer engine                  backend/services/
│   ├── retriever.js                  BM25 over weighted fields, synonyms, idf-weighted coverage score
│   ├── calculators.js                numeric questions with worked steps (never guesses missing inputs)
│   └── answerEngine.js               calculator, then curated intent, then retrieval, then refusal
│
├── ✅ Compliance engine              backend/compliance/
│   ├── beam456 · column456 · rebar1786 · steel800 · toy9873
│   └── index.js                      validation, verdict, report with clause excerpts attached
│
├── 🧾 Audit and export               backend/services/
│   ├── auditLog.js                   per-session, SHA-256 hash-chained events, TTL and size caps
│   ├── specParser.js                 JSON / CSV / key:value files to module inputs
│   └── reportBuilder.js              HTML, Markdown, JSON, CSV renderers
│
├── 🌐 API (Express)                  backend/routes/
│   └── helmet CSP, CORS, gzip (SSE excluded), rate limiting, session middleware
│
└── 💻 Web client (React 18 + Tailwind 3 + Vite)   frontend/
    ├── Assistant          chat, quick prompts, streaming, evidence panel
    ├── Compliance check   dynamic forms from the API schema, upload, results, exports
    ├── Standards library  searchable clause browser
    └── Audit trail        event log, integrity check, downloads
```

### How an answer is produced

1. **Calculator**: if the question is numeric and supplies every input, compute it and show the steps.
2. **Curated intent**: a hand-written answer for a common question, with `{{clauseId}}` placeholders that become `[n]` markers.
3. **Retrieval**: otherwise rank clauses with BM25 and assemble the answer **only from sentences in the retrieved clauses**.
4. **Refusal**: if the best match is weak (score or term coverage below threshold), say so and cite nothing.

Only clauses that were actually used are cited. A test checks that every marker has a citation and every cited clause exists.

---

## API reference

All routes are under `/api`. Send an `x-session-id` header (the web client does this) to keep a per-browser audit trail; one is created if absent.

| Method and path | Purpose |
| :--- | :--- |
| `GET /api/health` | Service status and corpus size |
| `POST /api/chat` | `{ "message": "..." }` returns the answer and citations as JSON |
| `POST /api/chat/stream` | Same, as server-sent events: `meta`, many `token`, then `done` |
| `GET /api/chat/prompts` | Quick-prompt pills |
| `GET /api/standards` | Standards with clause counts and the corpus notice |
| `GET /api/standards/clauses?standard=&q=` | Browse or search clauses |
| `GET /api/compliance/modules` | Module schemas (fields, units, limits, samples) |
| `GET /api/compliance/samples` | Sample specification files |
| `POST /api/compliance/parse` | `{ filename, content }` parses a specification file |
| `POST /api/compliance/run` | `{ moduleId, values }` runs an audit and stores the report |
| `GET /api/compliance/reports/:id?format=html\|md\|json` | Download a report |
| `GET /api/audit` | Session events and chain integrity |
| `POST /api/audit/event` | Log `citation.view` |
| `GET /api/audit/export?format=json\|csv\|md` | Download the session log |
| `DELETE /api/audit` | Clear this session |

Example:

```bash
curl -s -X POST http://localhost:8000/api/chat \
  -H 'content-type: application/json' \
  -d '{"message":"minimum cover for a column in moderate exposure"}'
```

---

## Project structure

```
bis-assist/
├── backend/
│   ├── app.js                     # Express app factory (helmet, CORS, rate limit, static client)
│   ├── config.js                  # Environment configuration
│   ├── data/
│   │   ├── clauses/               # is456.js, is800.js, is1786.js, is9873.js, index.js
│   │   ├── intents.js             # Curated answers
│   │   ├── quickPrompts.js
│   │   └── standards.js
│   ├── services/                  # tokenizer, retriever, calculators, answerEngine,
│   │                              # auditLog, specParser, reportBuilder
│   ├── compliance/                # helpers + beam456, column456, rebar1786, steel800, toy9873
│   ├── routes/                    # chat, standards, compliance, audit
│   ├── middleware/                # session, errorHandler
│   └── tests/                     # api, compliance, corpus, engine (33 tests)
├── frontend/
│   ├── public/                    # favicon.svg, theme-init.js
│   ├── src/
│   │   ├── components/            # 18 components, one per concern
│   │   ├── hooks/                 # useChat, useTheme, useMediaQuery
│   │   ├── lib/                   # api.js (client + SSE reader), format.jsx
│   │   ├── App.jsx
│   │   ├── index.css              # Theme tokens, excerpt typography
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js             # Dev server and /api proxy
├── samples/                       # Specification files to try the upload with
├── main.js                        # Launcher (`npm start`)
├── package.json                   # Scripts: dev, build, start, test
├── Dockerfile · render.yaml       # Deployment
├── .env.example
└── README.md
```

---

## Deployment

### Render (free tier works)
Push the repo to GitHub, create a **Blueprint** on Render and select it. `render.yaml` sets the build (`npm install && npm run build`) and start (`npm start`) commands.

### Docker

```bash
docker build -t bis-assist .
docker run -p 8000:8000 bis-assist
```

### Any Node host (Railway, Fly.io, a VPS)

```bash
npm install && npm run build
NODE_ENV=production PORT=8000 npm start
```

Put it behind HTTPS. Set `CORS_ORIGIN` to your domain if the client is served from a different origin.

### Configuration (`.env`, all optional)

| Variable | Default | Purpose |
| :--- | :---: | :--- |
| `PORT` | `8000` | API and production web port |
| `CORS_ORIGIN` | `*` | Comma-separated allowed origins |
| `RATE_LIMIT_PER_MIN` | `120` | Requests per minute per IP on `/api` |
| `STREAM_DELAY_MS` | `16` | Delay between streamed chunks (0 disables the typing effect) |

### Production notes
- **Security**: Helmet with a strict Content-Security-Policy (no inline scripts, self-hosted fonts, no third-party requests), rate limiting, request size limit, input validation, HTML-escaped reports.
- **Privacy**: no accounts, no database, no analytics. Uploaded specification files are processed in memory and not stored. Sessions live in server memory, expire after 6 hours of inactivity and are capped in number and size.
- **Scaling**: state is in memory, so run a single instance, or swap `auditLog.js` for a shared store before running several.

---

## Extending the knowledge base

Add a clause to the matching file in `backend/data/clauses/`:

```js
{
  ...base, id: 'IS456-26.4.2.2', clause: '26.4.2.2', page: 47, topic: 'cover',
  heading: 'Nominal cover for footings',
  text: 'For footings, minimum cover shall be 50 mm.',
  keywords: ['footing', 'foundation', 'cover', '50 mm'],
}
```

It is searchable immediately. To give it a hand-written answer, add an entry to `backend/data/intents.js` that cites it with `{{IS456-26.4.2.2}}`. To add a new standard, create a clause file, export it from `clauses/index.js`, and register it in `standards.js`. Run `npm test`: the suite fails if an intent cites a clause that does not exist or if an answer has a marker without a citation.

---

## Testing

```bash
npm test
```

33 tests cover the corpus (unique ids, every intent and every compliance check cites a real clause), the answer engine (hand-calculated values, refusal of out-of-scope questions), all five compliance modules (boundary cases, validation), the specification parser (every sample file round-trips), the audit chain (tampering and deletion are detected) and the HTTP API including streaming and downloads.

---

## Known limits

- Retrieval is keyword-based (BM25 with synonyms), not semantic. Unusual phrasing can miss; the assistant then says it has no grounded answer.
- Compliance modules check **detailing and specification rules**, not structural adequacy. They do not replace design calculations or engineering review.
- Steel section classification covers rolled I-sections with the neutral axis at mid-depth.
- The audit log is in memory and is lost when the server restarts.

---

## License

MIT. See [LICENSE](LICENSE). IS standards are published by the Bureau of Indian Standards; this project is independent and not affiliated with BIS.
