# StickyActionBar

Two antd `Button`s pinned to the bottom of a phone form, always within thumb reach.

```tsx
<div className={styles.stickyBar} role="group" aria-label={t("form.actions")}>
  <Button block onClick={onCancel}>Cancel</Button>
  <Button block type="primary" htmlType="submit" loading={isSubmitting}>Save sale</Button>
</div>
```

- **The wrapper is the only custom CSS** (a CSS Module): fixed to the bottom below `bp-md` and static from `bp-md` up, with background `surface`, shadow `shadow-sticky`, padding `space-3` / `space-4`, gap `space-3`, and `padding-bottom: max(space-3, env(safe-area-inset-bottom))`. From `bp-md` up, the buttons sit at the end of the form, right-aligned, without `block`.
- **Content:** at most two buttons, secondary on the left and primary on the right. Their size comes from `componentSize="large"`.
- Give the page bottom padding equal to the bar's height, so the last field is never hidden behind it.
