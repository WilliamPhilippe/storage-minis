# Issue tracker: GitHub

Issues and specs for this repository live in [WilliamPhilippe/storage-minis-be](https://github.com/WilliamPhilippe/storage-minis-be/issues). Use the authenticated `gh` CLI from the repository root with `--repo WilliamPhilippe/storage-minis-be`.

## Existing backlog

Read the relevant live issue, including comments, acceptance criteria and dependencies, before acting. Follow the hierarchy and requirement ownership rules in [AGENTS.md](../../AGENTS.md). Consult the [current ownership index](../requirements-coverage-v0.7.md) before creating work; extend the existing delivery owner when the requirement is already assigned.

The [current baseline tracker, #82](https://github.com/WilliamPhilippe/storage-minis-be/issues/82), is a published reference. Its closed state is not evidence that application workflows are implemented. Preserve existing issue identities, parent links, dependencies and decision boundaries.

## Operations

Append `--repo WilliamPhilippe/storage-minis-be` to these commands:

- Read: `gh issue view <number> --json number,title,state,body,labels,comments,assignees`.
- List: `gh issue list --state open --limit 100 --json number,title,labels,assignees`, with appropriate `--label` filters. Paginate when the task requires the full backlog.
- Create: `gh issue create --title "..." --body-file <file>`; add `--parent <number>` for a sub-issue and `--blocked-by <numbers>` for dependencies.
- Update a body: `gh issue edit <number> --body-file <file>`.
- Attach an existing child: `gh issue edit <parent> --add-sub-issue <child>`.
- Add a blocker: `gh issue edit <number> --add-blocked-by <blocker>`; remove a resolved relationship only when the workflow requires it.
- Comment: `gh issue comment <number> --body-file <file>`.
- Label: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`.
- Claim: `gh issue edit <number> --add-assignee @me`.
- Close: `gh issue close <number>`, after recording the applicable acceptance evidence, decision outcome or approved deferral.

Write multiline bodies and comments to a temporary file and pass it with `--body-file`.

## Pull requests as a triage surface

**PRs as a request surface: no.**

If this flag is later set to `yes`, external PRs enter triage using the same roles and `gh pr` operations. Read an explicitly named PR with `gh pr view <number> --comments` and `gh pr diff <number>`. GitHub issues and PRs share a number space; resolve an ambiguous number with `gh pr view <number>`, falling back to `gh issue view <number>`.

## Skill instructions

When a skill says "publish to the issue tracker", create or update the appropriate GitHub issue, checking existing ownership first. When it says "fetch the relevant ticket", read the issue and its comments.

## Wayfinding operations

For a new exploration map, use a `wayfinder:map` issue with Notes, Decisions-so-far and Fog sections. Link child tickets through native sub-issues and label them `wayfinder:research`, `wayfinder:prototype`, `wayfinder:grilling` or `wayfinder:task` as appropriate. Reuse the existing epic and delivery owner for work already in the backlog.

Use native blocked-by relationships for dependencies. Select the first open child in map order that has no open blockers or assignee; read its dependencies before claiming it. Record the result, close only when its completion criteria are met, and append a context pointer to the map's Decisions-so-far. Where native relationships are unavailable, use a parent task list plus `Part of #<parent>` on the child, and a `Blocked by: #<number>` line for dependencies.
