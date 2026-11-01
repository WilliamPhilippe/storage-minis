# Login

**Route:** `/login` · **Status:** design approved 2026-11-01 · **Delivery:** W11 step 3, "Sign-in end to end", in the [frontend foundation proposal](../../../technical/frontend-foundation-proposal-2026-11-01.md)

The only way into the back office is Google sign-in (W8). The page has four phone states and one desktop layout. Read [`../../system/`](../../system/) first.

| State | Screen | Prototype |
| --- | --- | --- |
| 1. Sign in (default) | [screens/1-sign-in.png](screens/1-sign-in.png) | [prototype/1-sign-in.html](prototype/1-sign-in.html) |
| 2. Opening Google | [screens/2-opening-google.png](screens/2-opening-google.png) | [prototype/2-opening-google.html](prototype/2-opening-google.html) |
| 3. In-app browser | [screens/3-in-app-browser.png](screens/3-in-app-browser.png) | [prototype/3-in-app-browser.html](prototype/3-in-app-browser.html) |
| 4. No access | [screens/4-no-access.png](screens/4-no-access.png) | [prototype/4-no-access.html](prototype/4-no-access.html) |
| 5. Desktop sign in | [screens/5-desktop.png](screens/5-desktop.png) | [prototype/5-desktop.html](prototype/5-desktop.html) |

## Layout

**Phones (below `bp-md`):**

- `surface-page` background. A header row holds only the language switch, on the right.
- A single column with gutters of `space-4`, vertically centred, with extra bottom padding so the content sits slightly above centre.
- From top to bottom: the logo (`storageminis-logo.png`, 28px tall), the title and lead, the action, and the helper text.
- A footer line sits at the bottom, with a `line` border on top.
- Controls are 44px (`componentSize="large"`).

**Desktop (from `bp-md`):**

- The same content in a 400px card, centred on `surface-page`. The card is `surface` with a `line` border, `radius-lg` and padding `space-6`.
- The language switch is top right, and the footer line sits below the card.
- Controls are 40px.

**Spacing:** `space-6` (32px) between the logo, the title block and the action block. Inside a block, use `space-2` (title to lead) or `space-3` (button to helper).

There is no main menu (`MenuFab` / `SideNav`) on this page, because it comes before sign-in.

## States

### 1. Sign in

The default state, and the state after sign-out.

| Element | Copy (en-US) | antd / tokens |
| --- | --- | --- |
| Title | Sign in | `Typography.Title level={1}`, `title-lg` (22/600) |
| Lead | Manage your inventory, purchases, sales and public catalog. | `Typography.Paragraph type="secondary"`, `body-lg` on phones, `body` on desktop |
| Action | Continue with Google | `Button type="primary" block`, `ink` fill. Use **Google's official sign-in button artwork** for the G; the round "G" in the screens is a placeholder |
| Helper | Only Google accounts invited to an organization can sign in. | `Typography.Text type="secondary"`, `caption`, centred |
| Footer | Shopping? Open the catalog link the seller shared with you. | `caption`, `ink-muted`, centred |

**Behaviour:**

- Phones use `signInWithRedirect` and desktops use `signInWithPopup`. If the popup is blocked (`auth/popup-blocked`), fall back to redirect (W8).
- Firebase is imported lazily, on this route only.
- After sign-in, load the session (user, Memberships, active Organization; W5) and go to `/app`, or to the page the person was sent from.

### 2. Opening Google

Shown from the moment the action is pressed until the browser leaves for Google, or the popup returns.

| Element | Copy (en-US) | antd / tokens |
| --- | --- | --- |
| Action | Opening Google… | The same `Button` with `loading` and `disabled` (`ink-hover` fill, spinner) |
| Helper | You'll come back here after choosing your account. | Replaces state 1's helper. Mark it `role="status"` so screen readers announce it |
| Language switch | — | Disabled while signing in |

On return from a redirect, show this state while Firebase resolves `getRedirectResult`. Don't flash state 1.

### 3. In-app browser

Shown instead of state 1 when the page opens inside an in-app webview (Instagram, WhatsApp, Facebook and similar), where Google blocks sign-in (`disallowed_useragent`; section 4 of the proposal).

| Element | Copy (en-US) | antd / tokens |
| --- | --- | --- |
| Title | Open in your browser | `title-lg` |
| Lead | Google sign-in doesn't work inside apps like Instagram or WhatsApp. Open this page in Safari or Chrome to continue. | `body-lg`, `ink-muted` |
| Steps | 1. Tap the menu button (••• or ⋮) in the corner of the screen. 2. Choose **Open in browser**, or copy the link and paste it into Safari or Chrome. | An ordered list in a `surface` box with a `line` border and `radius-lg`. Number badges are 24px `radius-full` on `surface-sunken` |
| Action | Copy link | `Button type="primary" block`. Copies the current URL; on success, show `message.success("Link copied")` |
| URL | `[APP DOMAIN]/login` | `caption`, `ink-muted`. The real domain is undecided (T04) |
| Footer | Shopping? The catalog works here without signing in. | `caption` |

**Behaviour:**

- No Google button appears in this state.
- Detection is a user-agent check in our code. Keep it small and covered by tests. If detection is wrong, state 1 still works in a regular browser.

### 4. No access

Shown when Google sign-in succeeds but the API refuses the account because it has no Membership. A Firebase identity alone grants no access (technical direction, Authentication).

| Element | Copy (en-US) | antd / tokens |
| --- | --- | --- |
| Title and lead | as state 1 | — |
| Alert title | This account doesn't have access | `Alert type="error" showIcon` (`racing-red-soft` ground, `racing-red-text` title) |
| Alert text | You signed in as **{email}**, which isn't a member of any organization. Ask the administrator to add you, or use another Google account. | The alert's `description`, in `ink`. `{email}` comes from the Google account |
| Action | Use another Google account | `Button type="primary" block`. Signs out of Firebase, then starts state 2 with Google's account chooser (`prompt: "select_account"`) |

**Behaviour:**

- Sign the person out of Firebase before showing this state, so no session lingers.
- **Open (T02 / #22):** whether the administrator can add people, and the wording of "ask the administrator", depend on T02's bootstrap and Membership rules. Keep the copy in the catalogs so it can change without code changes.

### 5. Desktop

The same content and states as phones, inside the card. Only the controls (40px) and the lead (`body`) change.

## Shared elements

- **Language switch:** a text `Button` with `GlobalOutlined` and the current language's name ("English" / "Português"). It opens a `Dropdown` of the two languages, saves the choice in localStorage, and switches everything that W4 lists. Its accessible name is "Language: English".
- **Logo:** `system/assets/logo/storageminis-logo.png` at 28px tall, with `alt="StorageMinis"`. Never type the name next to it.
- **Errors other than no access** (network, popup closed, Firebase errors): show state 1 with an `Alert type="error"` above the action, saying what happened and what to try, for example "Sign-in was cancelled. Try again." or "Couldn't reach Google. Check your connection and try again."

## Testability (W9)

- Locate by role and label: the `button` named "Continue with Google", the `heading` "Sign in", the `alert` in state 4, and the `button` "Language: English".
- Playwright signs in through the test-only custom-token path (W8), not this page's Google button. This page's own tests cover states 1, 3 and 4, plus the language switch, on phone and desktop projects.
- At 390px wide, the page doesn't scroll sideways.

## Open items

| Item | Owner / source |
| --- | --- |
| Official Google button artwork and its exact size rules | Google's sign-in branding guidelines, checked during the build |
| App domain shown in state 3 | T04 (#23) |
| No-access wording and the path to request access | T02 (#22) |
| Exact copy for other sign-in errors | Decide in the step 3 plan |
