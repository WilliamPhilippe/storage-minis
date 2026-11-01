# StatusTag

antd `Tag` without a border: one state of an item, sale or payment as a short word on a soft tone.

```tsx
<Tag bordered={false} color="error">Received — not approved</Tag>
<Tag bordered={false} color="success">Available</Tag>
<Tag bordered={false} color="warning">Reserved</Tag>
<Tag bordered={false} color="processing">In garage</Tag>
<Tag bordered={false}>Awaiting arrival</Tag>
```

- **Styling:** the status colors come from the theme: `colorErrorBg` / `colorError` (`racing-red-soft` / `racing-red`, 4.6:1), `colorSuccessBg` / `colorSuccess`, `colorWarningBg` / `colorWarning`, `colorInfoBg` / `colorInfo`. The default tag uses the `Tag` component tokens `defaultBg` (`surface-sunken`) and `defaultColor` (`ink-muted`). Text is `caption`, and corners are `borderRadiusSM`.
- **Fixed mapping:** Received — not approved and Overdue → `error`. Available and Paid → `success`. Reserved and Partly paid → `warning`. In garage → `processing`. Every other state → the default tag. Keep it in one `statusTagProps(state)` helper, never per screen.
- **Copy:** the state's name from the i18n catalog, in sentence case. Color never appears without a word.
- The preview's leading dot is optional (`icon` prop with a 6px dot); skip it if the tags look busy.
