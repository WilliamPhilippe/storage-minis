# StorageMinis brand book

StorageMinis manages inventory, purchases, sales, collections and a public stock catalog for 1/64 miniature sellers and collectors. The interface is a storage tool first: clean, calm, and easy to read on a phone. Neutral ink does the work, and **racing red only appears when something needs attention**.

**Every component is an Ant Design 6 component.** This system doesn't add its own buttons, inputs or tags. It sets antd's colors, type, sizes and radii through `ConfigProvider` theme tokens, and CSS Modules handle page layout only. Each token here maps to an antd token; the *Ant Design* section has the mapping, the full `theme.ts` and the few allowed CSS overrides. The design is mobile-first: design every screen at 360px wide, then widen it.

## Principles

- **Readable before decorative.** Use `ink` on `surface` or `surface-page`, plenty of `space-4`, and one idea per row. If a screen looks busy, remove things before restyling them.
- **Red means "look here".** `racing-red` is the brand colour, so its meaning stays sharp: use it for an item waiting for approval, an overdue balance, an error, or the confirmation of a destructive action. At most one red button per screen, and never use red for decoration, headers or links.
- **Lists over tables.** Use the filterable `ListRow` on phones and desktops. Use a wide antd `Table` only when a screen truly needs one, and design its phone behaviour for that screen.
- **Nothing depends on hover.** Every action must be reachable by tap and keyboard, and tooltips may only repeat information that is shown elsewhere.

## Content fundamentals

- **Languages:** en-US is the source language and pt-BR is the second. Every string lives in the i18n catalogs, never in components. Allow pt-BR to run about 30% longer, so never fix a label's width.
- **Voice:** plain and direct, written to one person ("you"). Use sentence case everywhere, including buttons, titles and tags: "Mark available", not "Mark Available".
- **Buttons start with a verb:** "Record payment", "Add item", "Cancel sale". Name the object when the screen holds more than one: "Save purchase".
- **Domain words are fixed:** Item, Item ID, Product, Purchase, Sale, Payment, Return, Customer, Organization, plus the item states listed below. Don't swap in synonyms such as "order" for Sale or "stock" for Item.
- **Money:** amounts are integer cents in the Organization's currency (BRL by default, or USD, chosen once). The back office shows `$` followed by the amount; the public catalog shows the Organization's symbol, `R$` or `US$`. Show cents only when they aren't zero. Separators follow the language: `$1,234.50` in en-US, `$1.234,50` in pt-BR, and a minus sign goes before the symbol (`-$400.50`). Always format through `Money` / `lib/format`.
- **Dates:** show local time to the visitor. Use a short date in rows ("Oct 28") and the full date with time in details.
- **No emoji** in the UI or in copy.

## Colour

Colour is neutral-first. Each colour has one job:

| Role | Token | Use |
| --- | --- | --- |
| Page | `surface-page` | Behind lists, cards and forms |
| Container | `surface` | Cards, rows, inputs, drawers, the top bar |
| Fill | `surface-sunken` | Hover and pressed rows, chips, image placeholders |
| Hairline | `line` | Dividers and card borders |
| Control border | `line-strong` | Inputs, selects, default buttons (3:1) |
| Text | `ink`, `ink-muted` | Body and headings, then meta lines and help text |
| Primary action | `ink` fill, `on-ink` text | The main button of a screen |
| Link and focus | `info`, `focus-ring` | Inline links, the keyboard focus outline |
| Attention | `racing-red`, `racing-red-soft`, `racing-red-text` | Approval needed, overdue, errors, destructive confirm |
| Status | `success`, `warning`, `info` with their `-soft` | Tags and alerts, always paired with a word |

- Primary buttons are `ink`, not red, and so is the floating menu button. A screen's main action is calm, and red is kept for when something is wrong or urgent.
- On a soft background, the text uses the matching strong token: `racing-red-text` on `racing-red-soft`, `success` on `success-soft`, and so on.
- Colour never carries meaning on its own. A status always shows a word, and a dot or icon is optional on top.
- The UI is light only. Dark mode isn't planned.

## Item states

Item states are written exactly as the requirements name them. Each state has a fixed `StatusTag` tone:

| State | Tone | Why |
| --- | --- | --- |
| Received — not approved | `attention` | The administrator must act before the item can be sold |
| Available | `success` | Sellable and shown in the catalog |
| Reserved | `warning` | In a sale with a balance still due |
| In garage | `info` | Fully paid, waiting for dispatch |
| Awaiting arrival, Held for appreciation, Personal collection, Shipped, Lost / disposed | `neutral` | Informational |

Payments and collections use the same scale: overdue is `attention`, partly paid is `warning`, paid is `success`.

## Typography

- The font is the platform's own system stack (`sans`). It downloads nothing, renders fastest on slow phones, and looks native on each device. There are no font files.
- `mono` is used only for `item-id`: Item IDs and SKUs.
- The scale is `title-xl` 28, `title-lg` 22, `title` 18, `heading` 16, `body-lg` 16, `body` 14, `label` 14/500, `caption` 12. Money uses `money-lg` 20 and `money` 15.
- Page titles use `title-lg` on phones and `title-xl` from `bp-md` up.
- Inputs on phones use `body-lg` (16px), because anything smaller makes iOS Safari zoom when the field gets focus.
- Every amount, count and ID uses `font-variant-numeric: tabular-nums`, so columns of numbers line up.
- Use weights 400, 500 and 600 only. Use 600 for headings and amounts, never 700.

## Space, layout and shape

- The spacing scale is a 4px base: `space-1` 4, `space-2` 8, `space-3` 12, `space-4` 16, `space-5` 24, `space-6` 32, `space-7` 48.
- The page gutter is `space-4` on phones and `space-5` from `bp-md` up. Content stays within 1200px from `bp-xl` up.
- **Main menu on phones:** a floating round button (`MenuFab`), `fab-size` 56px, at the bottom right, `fab-offset` from the edges plus the safe area. It opens the menu in a bottom drawer, within thumb reach. The `TopBar` holds only the logo and the user, with no menu button. Give scrolling pages `space-7` + `fab-size` of bottom padding, so the button never covers a list's last amount.
- **Main menu on desktop:** from `bp-md` up, a left sidebar (`SideNav`) that expands to `sider-width` (logo and labels) and collapses to `sider-collapsed` (mark and icons only). It is collapsed by default on tablets and expanded from `bp-lg`, and it remembers the person's choice per browser. The floating button doesn't appear at these widths.
- **Catalog:** a two-column `ItemCard` grid on phones (gap `space-3`), three to four columns from `bp-lg`. Filters live in a bottom drawer on phones.
- **Forms:** one column of full-width stacked fields, `space-4` between fields, and labels always above the field. On phones, a `StickyActionBar` holds the submit button, and the floating menu button is hidden on that screen, so the two never overlap; Cancel or Back leaves the form.
- **Controls:** `control-touch` (44px) on phones, which means antd `componentSize="large"`, and `control-md` (40px) on desktop. `control-sm` is for dense desktop toolbars only.
- **Radii:** `radius-md` for buttons, inputs and rows; `radius-lg` for catalog cards, modals and drawer tops; `radius-sm` for tags; `radius-full` for avatars, dots and chips only.
- **Borders before shadows.** Cards and rows sit on `surface-page` with a `line` hairline. `shadow-overlay` is for things that float (dropdowns, popovers, modals, drawers), `shadow-fab` for the floating menu button, and `shadow-sticky` for the bottom action bar.
- **Focus:** every interactive element shows a 2px solid `focus-ring` outline with a 2px offset, and the outline is never removed. Hover changes the fill to `surface-sunken`, or to `ink-hover` / `racing-red-hover` on filled buttons.

## Iconography

- Use `@ant-design/icons` 6, **Outlined** style only, at 16px inline with text and 20px in the top bar and icon buttons. Icons take the colour of the text next to them.
- Every icon-only button has an accessible name, such as `aria-label="Open menu"`.
- No emoji and no illustrated icons. Item photos are the only imagery.

## Logo

The logo is a storage drawer holding a red car, followed by the wordmark "Storage" in black and "Minis" in racing red. Its files are in the **App Logo** asset group:

- **Full logo** (`storageminis-logo.png`, transparent and trimmed): the phone `TopBar` at 20px tall, the expanded `SideNav` at 20px, and the sign-in page at 28px.
- **Mark** (`storageminis-mark.png`, the drawer and car only, transparent and trimmed): the collapsed `SideNav` at 32px wide, plus favicons and app icons.
- **Originals** (`StorageMinis Logo No Background.png`, `StorageMinis Logo White Background.png`): keep for print and partners. They carry wide empty margins, so use the trimmed files in the UI.

Rules:

- Place the logo on `surface` or `surface-page` only, never on `ink` or a photo, since its black parts would disappear. Leave clear space of at least the drawer's height around it.
- Never recolour, stretch, outline or redraw it, and never set the name in type beside the logo. The logo already contains the name.
- The logo's red is the source of `racing-red` (`#ba0101`). Its presence in the logo doesn't widen where red appears in the UI.

## Accessibility and testability

- Text holds at least 4.5:1 contrast on the surfaces its token names, and control borders, icons and the focus ring hold at least 3:1. Every pair in `tokens.json` has been checked.
- Every form field has a visible label. Placeholders are never used as labels.
- Components are built for Playwright from the start, so tests locate them by role and label (`getByRole`, `getByLabel`). Use `data-testid` only for repeated records, such as an `ItemCard` keyed by its Item ID, and where no role or label identifies the element.
- At phone width, pages never scroll sideways.

## Components

Each card is a pattern assembled from antd components, and its guideline names exactly which ones, with which props and tokens. Nothing is rebuilt by hand.

- **Actions:** `Button` (antd `Button`), `StickyActionBar` (antd `Button`s in a layout wrapper)
- **Data display:** `Money` (antd `Typography.Text` / `Statistic`), `StatusTag` (antd `Tag`), `ListRow` (antd `List.Item`), `ItemCard` (antd `Card`)
- **Forms:** `FormField` (antd `Form.Item` + `Input`), `SearchBar` (antd `Input`, `Button`, `Badge`, `Drawer`)
- **Navigation:** `MenuFab` (antd `FloatButton` + `Drawer` + `Menu`) on phones, `SideNav` (antd `Layout.Sider` + `Menu`) on desktop, `TopBar` (antd `Layout.Header`, `Avatar`, `Dropdown`)

The previews show how those antd components look with this theme. They are drawn with plain markup, because antd can't be loaded here yet. Once `apps/web` installs antd, they can be re-synced to render the real components.
