# Design

Approved designs for the StorageMinis web app (`apps/web`). When building a page, point to its folder under `pages/` and to `system/`.

**Status:** design reference, approved by the owner on 2026-11-01. The approval of a page here doesn't authorize an implementation step; each step still follows its own plan, as the [technical direction](../technical/technical-direction.md) and [AGENTS.md](../../AGENTS.md) require. Where this folder and an approved technical or requirements document disagree, the approved document wins: raise the conflict instead of following the design.

## Layout

```text
docs/design/
├── system/                    the design system: read before any page
│   ├── brand-book.md          principles, copy, colour, type, layout, logo, accessibility
│   ├── ant-design.md          antd 6 theme (theme.ts), token mapping, allowed overrides
│   ├── tokens.json            every token (source of truth for values)
│   ├── tokens.css             the same tokens as CSS variables, for CSS Modules
│   ├── components/<Name>.md   one guideline per shared pattern, with its antd parts
│   └── assets/logo/           logo, mark and originals
└── pages/
    └── login/                 one folder per page
        ├── README.md          the spec: states, copy, behaviour, antd mapping, open items
        ├── screens/*.png      one image per state (phones at 390×844, desktop at 1280×800)
        └── prototype/*.html   static HTML of each state; open in a browser
```

## How to use it when building a page

1. Read `system/brand-book.md` and `system/ant-design.md`.
2. Read `pages/<page>/README.md`, then compare against its `screens/`.
3. Build with antd 6 components themed through `ConfigProvider`. The prototype HTML is a visual reference only: never copy its markup or inline styles into `apps/web`.
4. Put every string in the en-US and pt-BR catalogs. The copy in a spec is the en-US source text.

Example prompt for Claude Code:

```text
Build the Login page following docs/design/pages/login/README.md and docs/design/system/.
```

## Where the designs live

The editable originals are in Claude:

- Design system: https://claude.ai/code/artifact/ab72a3de-2a48-4be8-b103-7009cae85ebd
- Login prototype: https://claude.ai/artifact/EosKQeQE84uUT5enrc6pLV

Both are private to the owner's account. This folder is a copy: `system/` was last refreshed on 2026-11-03 (design system version 15) and `pages/login/` on 2026-11-01. When a design changes there, refresh its folder here in the same change.

## Pages

| Page | Folder | Status |
| --- | --- | --- |
| Login | [`pages/login/`](pages/login/README.md) | Approved 2026-11-01 |
