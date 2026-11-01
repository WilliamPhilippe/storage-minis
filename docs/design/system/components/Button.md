# Button

antd `Button`, styled by the theme alone: primary is ink, and red is only for attention.

```tsx
<Button type="primary">Record payment</Button>        {/* ink fill, on-ink text */}
<Button>Edit</Button>                                   {/* surface, line-strong border */}
<Button type="text">Cancel</Button>
<Button type="primary" danger>Approve 3 items</Button>  {/* racing-red: attention only */}
```

- **Styling:** `colorPrimary` (`ink`), `colorPrimaryHover` (`ink-hover`), `colorBorder` (`line-strong`), `colorError` / `colorErrorHover` (`racing-red`), plus the `Button` component tokens `primaryShadow`, `defaultShadow` and `dangerShadow` set to `none` and `fontWeight` 500. Focus uses the shared `focus-ring` override.
- **One primary per screen**, for the thing the screen is for. Use **at most one** `danger` primary, and only when it resolves something urgent (approving received items, settling an overdue balance) or confirms a destructive action (cancelling a sale, deleting something).
- **Sizes:** from `ConfigProvider componentSize`: `large` (44px) on phones, `medium` (40px) on desktop (`"middle"` is deprecated and removed in antd 7). Pass `size="small"` (32px) only in dense desktop toolbars. Use `block` for full-width phone buttons.
- **Copy:** verb first, sentence case: "Record payment", "Add item". Never "OK" or "Submit".
- **Consumer provides:** children, `onClick`, `loading`, `disabled`, `icon` (Outlined). An icon-only button needs `aria-label`.
- **Don't:** use red for the main action, put two primaries side by side, or disable a button without saying why nearby.
