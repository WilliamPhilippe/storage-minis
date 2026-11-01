# StatusTag

antd `Tag` in its filled variant: one state of an item, sale or payment as a short word on a soft tone.

```tsx
<Tag variant="filled" color="error">Received — not approved</Tag>
<Tag variant="filled" color="success">Available</Tag>
<Tag variant="filled" color="warning">Reserved</Tag>
<Tag variant="filled" color="processing">In garage</Tag>
<Tag variant="filled">Awaiting arrival</Tag>
```

- **Styling:** the status colors come from the theme: `colorErrorBg` / `colorError` (`racing-red-soft` / `racing-red`, 4.6:1), `colorSuccessBg` / `colorSuccess`, `colorWarningBg` / `colorWarning`, `colorInfoBg` / `colorInfo`. The default tag uses the `Tag` component tokens `defaultBg` (`surface-sunken`) and `defaultColor` (`ink-muted`). Text is `caption`, and corners are `borderRadiusSM`.
- **Fixed mapping:** Received — not approved and Overdue → `error`. Available and Paid → `success`. Reserved and Partly paid → `warning`. In garage → `processing`. Every other state → the default tag. Keep it in one `statusTagProps(state)` helper, never per screen.
- **Variant:** use `variant="filled"`. `bordered={false}` is deprecated in antd 6.
- **Copy:** the state's name from the i18n catalog, in sentence case. Color never appears without a word.
- The preview's leading dot is optional (`icon` prop with a 6px dot); skip it if the tags look busy.
