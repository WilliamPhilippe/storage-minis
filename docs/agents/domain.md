# Domain documentation

## Read before exploration

Read the current baseline sources listed in [AGENTS.md](../../AGENTS.md), selecting the requirements and decisions relevant to the task. The existing requirements, entity map, accepted model decisions and technical direction remain the governing sources.

Also read these optional domain documents when present:

- Root `GLOSSARY.md` for shared domain vocabulary.
- Relevant records in root `docs/adr/` for architecture decisions.
- If root `GLOSSARY-MAP.md` is introduced later, follow it to the glossaries relevant to the topic.

If an optional glossary or ADR directory is absent, proceed silently. Do not flag its absence or suggest creating it upfront. The domain-modeling skill creates these documents lazily when terms or decisions are resolved.

## Layout

Use a single shared domain context for the current repository:

```text
GLOSSARY.md                 # Shared terms, when created
docs/adr/                   # Architecture decisions, when created
  NNNN-decision-title.md
```

The planned backend/frontend monorepo does not by itself require separate domain glossaries. Revisit the layout if distinct domain contexts emerge.

## Vocabulary and decisions

Use the glossary's terms in issue titles, proposals, hypotheses and test names. Until a glossary exists, use the terminology in the current baseline and accepted model decisions. For an undefined concept, check whether an existing term applies; record a genuine gap for domain-modeling.

Surface conflicts with an ADR or an approved source explicitly and follow the owner-resolution rule in AGENTS.md. Record decision status, owner approval, date and examples when an outcome is approved. Keep proposals, accepted decisions and implemented behavior distinguishable; the DBML draft in `docs/database/` remains a review proposal.
