# Step 5 plan — tRPC and Zod integration (2026-11-01)

**Status: approved by the owner on 2026-11-01; not yet implemented.** The owner
approved P5-01–P5-10 as recommended. The approval is recorded in
[technical direction](technical-direction.md#step-5-trpc-and-zod-plan-approval-2026-11-01);
the implementing PR adds its outcome and evidence there. Choices this plan does
not settle, and any deviation that implementation forces, still need approval.
This is the plan for
[Step 5](technical-foundation-implementation-guide.md#step-5--trpc-and-zod-integration)
of the foundation guide, part of
[T06 / #26](https://github.com/WilliamPhilippe/storage-minis/issues/26).

## Approved decisions

| ID | Recommendation |
| --- | --- |
| P5-01 | Pin `@trpc/server` 11.22.1 (API dependency) and `@trpc/client` 11.22.1 (API devDependency, tests only). |
| P5-02 | Mount at `/trpc`; plain JSON with no transformer; batching off; method override off; no subscriptions. |
| P5-03 | 1 MiB body limit on the tRPC route only; an empty JSON body counts as "no input"; every array and string input has a `.max()`. |
| P5-04 | One tRPC error envelope for everything under `/trpc`: fixed messages, and only `code`, `httpStatus` and validation `issues` (`path`, `code`). |
| P5-05 | Request logs carry `procedure` for matched procedures; each tRPC failure logs one `request_failed` record with the allowlisted `err`. |
| P5-06 | Context `{ db, requestId }`; a module-private diagnostic procedure builder; no exported unguarded builder. |
| P5-07 | One procedure, `diagnostics.echo`: a query with strict `{ message }` (1–100 characters) as input and output. |
| P5-08 | Types-only package export `@storage-minis/api/types` with `AppRouter`. |
| P5-09 | Source layout under `apps/api/src/trpc/`. |
| P5-10 | Tests through `app.inject()`, a loopback test with the real tRPC client, and a compiled browser-profile consumer; root tests depend on the API build. |

## 1. Starting state

- `main` is at `0a417b8`: the
  [API composition and error-log rework](technical-direction.md#api-composition-and-error-log-rework-2026-11-01)
  (PR #112, merged 2026-11-01) on top of the
  [foundation restructure](technical-direction.md#foundation-restructure-2026-10-31).
  Its recorded evidence: 83 unit tests, 27 process tests, 29 PostgreSQL tests and
  5 parity-stack tests.
- `buildApp(httpConfig, { database, isClosing })` is the single composition root,
  with `database` typed `Pick<Database, "db" | "check">`. The health routes are
  the encapsulated plugin `src/health.ts`. The root error handler logs
  `request_failed` with the allowlisted `err` record from `src/error-log.ts`
  (4xx at info, 5xx at error) and sends fixed bodies; an `onResponse` hook logs
  `request_completed` (method, route template, status, elapsed time).
- The API depends on `fastify` 5.12.7, `zod` 4.6.7 and `@storage-minis/db`. It
  has no tRPC package and no `exports` field; `tsconfig.build.json` already emits
  declarations.
- `app.test.ts` mocks `@storage-minis/db` so that any runtime import fails: the
  tRPC modules may import only its types.
- Turbo: `//#test` depends only on `@storage-minis/db#build`; `typecheck`
  depends on `^build`.
- #26 is closed. PR #107's closing link closed it on 2026-10-29, although that PR
  said it did not (recorded in AGENTS.md). Reopening it is the owner's call; this
  plan does not depend on it.

Approvals this plan inherits (not asked again):

| Source | What it settles |
| --- | --- |
| [Accepted stack](technical-direction.md#accepted-application-stack) (2026-10-21) | tRPC with Zod on Fastify; a React client through TanStack Query's tRPC integration. |
| Restructure D5 (2026-10-31) | Same-origin `/trpc`: Caddy in production, the Vite proxy in development, so no CORS policy. |
| Step 5 planning inputs (2026-11-01) | The adapter registers as a plugin in `buildApp`; the context exposes `database.db`, never the whole `Database`; request logs include the procedure name; failures keep the allowlisted `err` record and fixed client bodies. |
| API rework (2026-11-01) | Error-log allowlist, messages logged only in development, JSON lifecycle lines. |
| Tooling (2026-10-23) and Step 4.1 (2026-10-28) | TypeScript 6.0.3 with strict flags including `exactOptionalPropertyTypes`; shared `skipLibCheck`; Fastify 5.12.7; Zod 4.6.7. |

No prerequisite blocks a diagnostic, table-free Step 5. T02 (identity), T03
(money and dates) and T04 (origins and proxies) stay open and outside this step.

## 2. Scope

**Delivers:** the tRPC Fastify adapter mounted at `/trpc` from `buildApp`; one
diagnostic query; the request context; one error envelope; procedure names in
request logs; a types-only router export; tests; documentation.

**Files:** `apps/api/package.json`, `pnpm-lock.yaml`, `apps/api/src/app.ts`, new
`apps/api/src/trpc/*` and `apps/api/src/types.ts` with their tests, `turbo.json`,
and the documents in section 6.

**Excluded:**
- Business or table-backed procedures.
- Authentication, principals, Organization scope and protected builders (T02).
- Money and date serializers, or any transformer (T03).
- Batching, subscriptions, SSE and WebSockets.
- CORS, `trustProxy`, rate limiting and production origins (T04).
- Pagination and idempotency conventions.
- A shared runtime-schema package for the browser, and the frontend itself.
- tRPC checks against the parity stack (Step 6).
- Changes to the Dockerfile or Compose files.

**Proposal subsets used:** from
[the T06 proposal](t06-foundation-proposal-2026-10-24.md#7-step-4--trpc-with-zod),
F10 (route, JSON transport, diagnostic procedure, context, safe errors), the
type-only export from F07, the adapter tests from F11, and one task dependency
under F12. The proposal recorded these as candidates; this plan asks for the
exact subset.

## 3. Decisions

### P5-01 Packages

**Recommendation:**
- Run `pnpm --filter @storage-minis/api add @trpc/server@11.22.1` and
  `pnpm --filter @storage-minis/api add --save-dev @trpc/client@11.22.1`. Both are
  exact pins, as the workspace sets `saveExact`.
- The server package contains the Fastify adapter and has no runtime
  dependencies of its own.
- The client is used only by tests and never enters the image, because
  `pnpm deploy --prod` drops devDependencies.

**Why 11.22.1:**
- It is the current stable release and the only stable release since 11.19.0,
  the proposal's candidate.
- It includes fixes this contract relies on:
  - malformed URL-encoding in a procedure path returns 400;
  - content-type matching is case-insensitive;
  - inferred types stay portable;
  - a request whose body was already consumed no longer hangs.
- Its TypeScript peer is `>=5.7.2`, and it declares no Fastify peer. Both
  packages carry SLSA provenance.
- A scratch project compiled a server and a browser-profile client shaped like
  this step against 11.22.1, Fastify 5.12.7, Zod 4.6.7 and Drizzle 0.45.4. It used
  this repository's strict flags, including `exactOptionalPropertyTypes`, and
  produced no errors.

**Tradeoffs and alternatives:**
- **Tradeoff:** 11.22.1 was published on 2026-10-28. It is the first release from
  tRPC's new publishing pipeline and bundles 88 changes.
- **Alternative:** 11.19.0 (2026-09-16) has been in use longer, but lacks the
  fixes above.
- **Client alternative:** skip the client and type the consumer with
  `inferRouterOutputs` only. That cannot show how the real client reads errors
  (P5-04).

Sources: [npm manifest](https://registry.npmjs.org/@trpc/server/11.22.1),
[v11.22.1 release](https://github.com/trpc/trpc/releases/tag/v11.22.1),
[Fastify adapter](https://trpc.io/docs/server/adapters/fastify).

### P5-02 Transport

**Recommendation:**
- Mount at `/trpc` (F10, D5).
- Use plain JSON with no transformer.
- Set `allowBatching: false`.
- Keep method override off (tRPC's default), so queries are GET and mutations
  are POST.
- Add no subscriptions.
- Clients use `httpLink`.

**Why:**
- Plain JSON needs no extra package and keeps the wire format readable.
- Money and dates wait for T03, so diagnostics return only strings.
- One call per request keeps body limits, logs and errors per procedure.
- Because queries are GET only and mutations POST only, a cross-site GET cannot
  trigger a mutation if cookies are ever used.

**Alternatives:**
- SuperJSON now, which adds Date and BigInt support before T03 decides those
  formats.
- Batching: fewer requests, but one oversized or failing call affects the whole
  batch, and logs lose the one-procedure-per-request shape.

Either can be added later without changing procedures.

Sources: [error handling](https://trpc.io/docs/server/error-handling),
[httpLink](https://trpc.io/docs/client/links/httpLink).

### P5-03 Request bodies

**Recommendation:**
- An `onRoute` hook inside the tRPC plugin sets the tRPC route's `bodyLimit` to
  1 MiB; every other route keeps the app's 16 KiB. Fastify runs `onRoute` hooks
  before it reads a route's limit (`lib/route.js` in 5.12.7).
- A JSON parser scoped to the tRPC plugin treats an empty body as "no input". It
  passes every other body to Fastify's default parser, which keeps its
  prototype-poisoning protection.
- Every procedure input bounds its arrays and strings with `.max()`. Those
  bounds, set by each business workflow, are the real per-procedure limit.

**Why 1 MiB.** Rough JSON sizes of the largest requests we can foresee:

| Request | Rough size |
| --- | --- |
| A typical Sale or Payment | under 5 KB |
| Manual expense allocation across 1,000 units (PUR-019) | about 52 KB |
| A 500-line Purchase that also registers new Products | about 175 KB |
| 1,000 spreadsheet rows, if T05 sends rows as JSON | 300–500 KB |

- 1 MiB covers the largest of these about twice over and matches Fastify's own
  default.
- Photos and spreadsheet files never travel as tRPC JSON; they get their own
  routes when D04 and T05 design them.
- Query input travels in the URL, where Node's 16 KiB header limit applies, so
  query inputs must stay small.

**Why the parser:**
- The tRPC client sends `content-type: application/json` on every POST, but sends
  no body when a mutation has no input (`httpUtils` in 11.22.1).
- Fastify always parses the body when `content-type` is present, and its default
  JSON parser rejects an empty body with `FST_ERR_CTP_EMPTY_JSON_BODY`
  (`lib/handle-request.js` and `lib/content-type-parser.js`).
- Without this parser, every mutation without input would fail with 400.

**Alternatives:**
- 256 KiB: enough for daily work, but import batches would have to be smaller.
- Raising the global limit, which also loosens future non-tRPC routes.
- Requiring an input on every mutation instead of the parser, which every new
  procedure could fall into.

Sources: [Fastify `bodyLimit`](https://fastify.dev/docs/latest/Reference/Server/#bodylimit),
[`onRoute`](https://fastify.dev/docs/latest/Reference/Hooks/#onroute),
[content-type parsers](https://fastify.dev/docs/latest/Reference/ContentTypeParser/),
[Node `maxHeaderSize`](https://nodejs.org/api/http.html#httpmaxheadersize).

### P5-04 Error envelope

**Recommendation:** every response under `/trpc` uses tRPC's envelope:

```json
{
  "error": {
    "message": "Invalid request",
    "code": -32600,
    "data": {
      "code": "BAD_REQUEST",
      "httpStatus": 400,
      "issues": [{ "path": ["message"], "code": "too_big" }]
    }
  }
}
```

- **One helper builds it** from public tRPC exports: `TRPCError`,
  `getHTTPStatusCodeFromError` from `@trpc/server/http`, and
  `TRPC_ERROR_CODES_BY_KEY` from `@trpc/server/rpc`. The router's
  `errorFormatter` and the Fastify handlers both call it, so the client's typed
  `data` is accurate. Do not use `getErrorShape`: it is exported but marked
  `@internal`.
- **Fixed content:** `message` is a fixed phrase per code, and `isDev` is
  `false`. Responses never carry `error.message`, causes, stacks or the procedure
  path.
- **Validation details:** `issues` appears only for input-validation failures
  (a `ZodError` cause). It holds at most 20 entries, each `{ path, code }`.
- **Failures outside tRPC** reach the same envelope:
  - oversized, malformed or unsupported bodies inside the tRPC scope go through a
    scoped error handler;
  - paths under `/trpc` that match no route (`/trpc`, `/trpc/a/b`) go through a
    scoped not-found handler;
  - a malformed URL under `/trpc` goes through a prefix check in the root
    `frameworkErrors` handler.
- **Unchanged:** health and every other route keep their current bodies.
- **Documented exception:** some failures are handled by Node or Fastify before
  routing (431 for oversized headers or URL, 408 for receive timeout, malformed
  HTTP). They keep Fastify's fixed client-error body, and the tRPC client reports
  them as plain HTTP errors.

**Why:**
- The tRPC 11.22.1 client only recognizes errors shaped
  `{"error": {"code": <number>, "message": <string>}}` (`isTRPCErrorResponse`).
  Today's `{"error": "payload_too_large"}` becomes a `TRPCClientError` that says
  "Unknown error" and has no code.
- tRPC's own messages echo text the client controls:
  - the Zod issues JSON, including unknown key names
    (`"Unrecognized key: \"secret\""`);
  - `No procedure found on path "<path>"`;
  - the HTTP method;
  - the content-type header.
- Fixed messages keep all of that out. The client relies on `data.code`; the UI
  language is not decided anyway.

**Alternatives:**
- Let the client handle two shapes, so the frontend inspects raw HTTP statuses
  for some failures.
- Return Zod's messages as well. They help while debugging, but they echo key
  names, and the frontend validates with the same schemas anyway.

Sources: [error formatting](https://trpc.io/docs/server/error-formatting),
[error handling](https://trpc.io/docs/server/error-handling),
[Fastify `setNotFoundHandler`](https://fastify.dev/docs/latest/Reference/Server/#setnotfoundhandler).

### P5-05 Logs

**Recommendation:**
- **Procedure name:** a middleware at the base of the diagnostic builder records
  the matched procedure's `path` for the request. The root `request_completed`
  and `request_failed` lines add `procedure` when a name was recorded. tRPC never
  runs middleware for unknown paths, so text the client supplies is never logged;
  the route stays `/trpc/:path`.
- **How the name reaches the request:** the middleware finds the Fastify request
  through a module-private `WeakMap` keyed by the context object, and stores the
  name in a request decorator. The context type stays `{ db, requestId }`.
- **tRPC failures** are logged once, in the adapter's `onError`, as
  `request_failed` with:
  - `category`: the lowercased tRPC code, with `INTERNAL_SERVER_ERROR` logged as
    `internal_error` to match existing 500s;
  - `status` and `procedure`;
  - the allowlisted `err` (the `TRPCError` with its cause chain).

  4xx failures log at info and 5xx at error. Fastify-level failures keep being
  logged once by their handler. Input is never logged.

**Why:** this meets the approved input using tRPC's public middleware API. The
other ways to know whether a path exists (`info.calls[].procedure`,
`router._def.procedures`, `getProcedureAtPath`) are marked `@internal` or live in
`unstable-core-do-not-import`.

**Alternative:** log the requested path on every request. Simpler, but it logs
URL text the client controls, which the approved log policy excludes.

Source: [middlewares](https://trpc.io/docs/server/middlewares).

### P5-06 Context and procedure builders

**Recommendation:**
- `createContext` returns `{ db: database.db, requestId: request.id }` for each
  request, and nothing else: no principal, Organization, permissions, headers, IP
  address, logger or configuration.
- The diagnostics router uses a module-private `diagnosticProcedure`: tRPC's base
  procedure plus the P5-05 middleware.
- No `publicProcedure` or other unguarded builder is exported.

**Why:**
- The proposal forbids a reusable unguarded business builder and forbids treating
  headers as identities.
- T02 has two clear seams:
  - `createContext` will verify the Firebase ID token and add a verified
    principal, never one taken from unverified headers;
  - Membership and Organization checks become middleware on protected builders.
- Firebase identity alone grants no Membership.

Source: [context](https://trpc.io/docs/server/context).

### P5-07 Diagnostic procedure

**Recommendation:** `diagnostics.echo`, a query. Its input and output are both
`z.strictObject({ message: z.string().min(1).max(100) })`. It returns
`{ message }` and reads no table or environment value.

**Why:** this was F10's candidate. One query exercises input validation, output
validation, the adapter and the client types without touching data.

### P5-08 Type export

**Recommendation:**
- `apps/api/src/types.ts` contains only
  `export type { AppRouter } from "./trpc/router.js";`.
- `apps/api/package.json` adds:

```json
"exports": { "./types": { "types": "./dist/types.d.ts" } }
```

- With only a `types` condition, a runtime import fails to resolve, and
  `verbatimModuleSyntax` already forces `import type`.
- A future web app adds `@storage-minis/api` as a `workspace:*` devDependency and
  imports only the type.

**Why:** this keeps server code, configuration and the database out of browser
bundles while sharing one contract. A scratch check confirmed that a types-only
export resolves under both NodeNext and bundler resolution, including through
package self-reference, and that the compiled consumer contains no import.

**Note for the frontend:** the browser type-check still loads the server-side
declarations the context type reaches: Drizzle, pg, Node, and Fastify if the
router imports it. That was about 500 files in the scratch check. It compiles
with the approved `skipLibCheck`, but Node globals such as `process` become
visible to browser code, so the frontend should lint against them.

Source: [TypeScript package `exports`](https://www.typescriptlang.org/docs/handbook/modules/reference.html#packagejson-exports).

### P5-09 Layout

```text
apps/api/src/
├── app.ts               # registers trpcRoutes at /trpc; frameworkErrors prefix; procedure in logs
├── types.ts             # export type { AppRouter }
└── trpc/
    ├── init.ts          # initTRPC: Context type, isDev false, errorFormatter
    ├── context.ts       # createContext; context-to-request WeakMap
    ├── errors.ts        # envelope helper: fixed messages, issues
    ├── plugin.ts        # trpcRoutes: onRoute limit, JSON parser, scoped handlers, adapter, onError
    ├── router.ts        # appRouter, AppRouter
    └── routers/diagnostics.ts
```

Router modules import only types from `@storage-minis/db`, Fastify and the
plugin, so the declarations the client loads stay few.

### P5-10 Tests and task graph

**Recommendation:**
- **Adapter tests:** run every case in section 5 for the production router
  through `buildApp(...)` and `app.inject()`.
- **Test-only router:** tests that need failing or mutating procedures register
  the same `trpcRoutes` plugin with a test-only router at `/trpc-test`, on the
  app `buildApp` returns, before it is ready. Production code gains no test
  option.
- **Loopback test:** one test listens on `127.0.0.1:0` and calls the app with
  `@trpc/client` (`httpLink`). It covers:
  - success;
  - a validation error with typed `data.code` and `issues`;
  - a mutation without input;
  - an oversized mutation (`PAYLOAD_TOO_LARGE`);
  - an internal error with the fixed message.
- **Consumer test:** compiles a virtual browser-profile file (bundler resolution,
  DOM library, no Node types, this repository's strict flags). The file imports
  `type AppRouter` from `@storage-minis/api/types` and calls
  `createTRPCClient<AppRouter>`. The test asserts:
  - zero diagnostics;
  - the emitted JavaScript imports only `@trpc/client`;
  - Node's resolver rejects a runtime import of `@storage-minis/api/types`.

  It uses the TypeScript compiler API, which is already pinned, so it needs no
  new tool or tsconfig file.
- **Task graph:** in `turbo.json`, `//#test` also depends on
  `@storage-minis/api#build`, because the consumer test reads the compiled
  declarations. An API source change then also reruns root tests.

**Alternatives:**
- A real consumer file with its own tsconfig; lint and typecheck would then also
  depend on the API build.
- Deferring the consumer to the frontend, which the completion criteria do not
  allow.

## 4. Implementation order

Branch `feat/step-5-trpc` from `main` and use Conventional Commits. The PR must
leave the repository working, and each commit should pass `pnpm check` where
practical.

1. **`build(api): pin tRPC server and client`.** The two `pnpm add` commands
   (P5-01), with the manifest and lockfile; `pnpm install --frozen-lockfile`
   passes.
2. **`feat(api): add the diagnostic tRPC router`.** `trpc/init.ts`, `context.ts`,
   `errors.ts`, `router.ts`, `routers/diagnostics.ts` and `types.ts`, with unit
   tests for the envelope helper.
3. **`feat(api): mount tRPC in buildApp`.** `trpc/plugin.ts`; registration in
   `buildApp` at `/trpc`; the `frameworkErrors` prefix check; the request
   decorator and the `procedure` log field; the adapter and loopback tests.
4. **`build(api): export the router type`.** The `exports` field, the Turbo
   dependency and the consumer test.
5. **`docs: record Step 5`.** Section 6.

Contracts consumed from earlier steps:
- `buildApp` and `AppDependencies`;
- `serializeError` and the log policy;
- the root request-log hook;
- `Database["db"]`.

Contracts supplied to later work:
- the `/trpc` HTTP contract and envelope;
- `@storage-minis/api/types`;
- the `procedure` log field;
- `trpcRoutes`, the one place later routers attach (T02's protected builder,
  business routers).

**Risk:** declaration emit of `AppRouter` may hit TS2742 ("cannot be named
without a reference to …") if a procedure's inferred type reaches a package the
API does not depend on directly. Fix it by annotating the type; adding a
dependency instead needs approval.

## 5. Verification

### Accepted and rejected requests

Production router, through `buildApp` and `app.inject()`:

| # | Request | Expected |
| --- | --- | --- |
| 1 | `GET /trpc/diagnostics.echo?input=%7B%22message%22%3A%22ok%22%7D` | 200 `{"result":{"data":{"message":"ok"}}}` |
| 2 | input `{"message":""}` | 400 `BAD_REQUEST`; issues `[{"path":["message"],"code":"too_small"}]` |
| 3 | `message` of 101 characters | 400 `BAD_REQUEST`, `too_big` |
| 4 | `{"message":42}` | 400 `BAD_REQUEST`, `invalid_type` |
| 5 | `{"message":"ok","secret":"…"}` | 400 `BAD_REQUEST`, `unrecognized_keys`; the body does not contain `secret` |
| 6 | no `input` | 400 `BAD_REQUEST`, `invalid_type` |
| 7 | `?input=not-json` | 400 `PARSE_ERROR` |
| 8 | `GET /trpc/diagnostics.nope` | 404 `NOT_FOUND`; the body does not echo the path |
| 9 | `GET /trpc` and `GET /trpc/a/b` | 404 `NOT_FOUND` envelope |
| 10 | `POST /trpc/diagnostics.echo` | 405 `METHOD_NOT_SUPPORTED` |
| 11 | `PUT /trpc/diagnostics.echo` | 405 `METHOD_NOT_SUPPORTED` |
| 12 | `GET /trpc/diagnostics.echo,diagnostics.echo?batch=1&input=…` | 400 `BAD_REQUEST` (batching off) |
| 13 | `GET /trpc/%E0%A4%A` | 400 envelope |
| 14 | `/health/live`, `/health/ready`, `/nope` | bodies unchanged |

Test-only router at `/trpc-test`:

| # | Request | Expected |
| --- | --- | --- |
| 15 | POST with a JSON body over 1 MiB | 413 `PAYLOAD_TOO_LARGE` |
| 16 | POST with a 20 KiB JSON body (above the 16 KiB default) | reaches tRPC: 200 |
| 17 | POST to a mutation without input, `content-type: application/json` and no body | 200 |
| 18 | POST with malformed JSON | 400 `PARSE_ERROR` |
| 19 | POST with `text/plain` or `multipart/form-data` | 415 `UNSUPPORTED_MEDIA_TYPE`; the body does not echo the header |
| 20 | a procedure returns output that violates its schema | 500 `INTERNAL_SERVER_ERROR` with the fixed message |
| 21 | a procedure throws an error whose message and cause hold a secret sentinel | 500 with the fixed message; the response and production logs contain no sentinel; development logs carry the message, per the log policy |
| 22 | a procedure reports its context | `ctx.db` is the injected `database.db`; the keys are exactly `db` and `requestId`; `requestId` matches the request log |

Every `/trpc` response in these tables is checked for:
- a numeric `error.code` and a fixed `message`;
- no stack, cause or path;
- no `DATABASE_URL` or password sentinel.

The logs are checked for:
- exactly one `request_failed` per failure, at the approved level;
- `procedure` only for matched procedures;
- the allowlisted `err` record;
- no input values.

If implementation shows a status different from these tables, report it for
approval rather than accepting it silently.

### Completion criteria

| Guide criterion | Evidence |
| --- | --- |
| A valid request succeeds through the actual adapter with input and output validation; invalid shape or value and unknown procedures return the specified errors | Cases 1–14 through `app.inject()`, and the loopback client test over real HTTP. Output validation runs on case 1 and fails on case 20. |
| Unexpected and output-validation failures omit stacks, secrets and raw causes; malformed and oversized requests follow documented behavior | Cases 7, 13 and 15–21 plus the log checks. These tables become the documented contract in `local-development.md`. |
| The context reuses the injected database and request information, without a principal, Organization or permission | Case 22; the context type has no other field. |
| A type-only router export; a temporary consumer's emitted JavaScript has no server or database runtime import | The consumer test: zero diagnostics, emitted imports exactly `@trpc/client`, and a runtime import of `@storage-minis/api/types` rejected. |
| Diagnostic and table-free; adapter tests go beyond a direct router call | One procedure with no table or environment access. No test uses `createCaller` as evidence, and the `@storage-minis/db` runtime-import mock in `app.test.ts` still passes. |

### Commands

| Command | Expected |
| --- | --- |
| `pnpm install --frozen-lockfile` | Succeeds with the new pins. |
| `pnpm check` | All tasks pass; the unit count rises from 83. |
| `pnpm build` | API `dist` includes `types.d.ts` and `trpc/`. |
| `pnpm turbo run test --dry=json` | `//#test` lists `@storage-minis/api#build`. An API source edit misses the root test cache; restoring the edit hits it again. |
| `pnpm db:up`, then `pnpm test:api` and `pnpm test:db`, one at a time | 27 and 29 pass, unchanged. |
| `pnpm test:stack` | 5 pass on the rebuilt image. A `docker run` listing confirms the image holds `@trpc/server` and not `@trpc/client`. |

The unit and loopback tests use no database or external resource. The loopback
listener binds an ephemeral loopback port and closes in `afterEach`.

**Deferred:**
- tRPC checks against the parity stack and the built process (Step 6);
- a real browser-bundle assertion (frontend delivery);
- protected procedures (T02);
- money and date formats (T03);
- production origins and proxy trust (T04).

This is tooling evidence, not business acceptance.

## 6. Handoff

Documentation to update:
- **Technical direction:** add a dated "Step 5 tRPC and Zod integration" record
  with the approved P5 items, rationale, outcome and evidence.
- **Implementation guide:** the Step 5 progress row and state, and the Step 6
  handoff: the HTTP contract above, `@trpc/client` for smoke checks, and the
  `procedure` log field.
- **README:** "Developing a tRPC endpoint" loses "(pending)" and gains `curl`
  examples, the client import and the `.max()` rule.
- **`local-development.md`:** the HTTP contract table gains the `/trpc` rows and
  the documented exceptions.
- **AGENTS.md:** Step 5 status in the repository-state paragraph and the T06
  line.

**PR:** write "Part of #26" only. Use no closing keyword, and check that the PR's
Development panel shows no linked issue (the lesson from #107).

**For the frontend:**
- Import `type AppRouter` from `@storage-minis/api/types`.
- Use `httpLink` (no batching) at `/trpc` through the Vite proxy, with no
  transformer.
- Read errors through `error.data.code`.
- Lint against Node globals.
- Sharing runtime Zod schemas with the browser needs a separate package, since
  this export is types-only.

**Remaining limitations:**
- Only a diagnostic procedure exists.
- No authentication or authorization.
- JSON primitives only until T03.
- Connection-level failures keep Fastify's client-error body.
- Full T06 acceptance remains open.
