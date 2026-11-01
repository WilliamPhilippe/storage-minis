# MenuFab

The main menu on phones: a round ink button at the bottom right that opens the menu in a bottom drawer, built from antd `FloatButton`, `Drawer` and `Menu`.

```tsx
<FloatButton
  type="primary"
  icon={<MenuOutlined />}
  aria-label={t("nav.openMenu")}
  onClick={() => setNavOpen(true)}
  className={styles.fab}            // position and safe-area inset only
/>
<Drawer placement="bottom" size="auto" open={navOpen} onClose={() => setNavOpen(false)} title={t("nav.menu")}>
  <Menu mode="inline" selectedKeys={[section]} items={navItems} onClick={() => setNavOpen(false)} />
</Drawer>
```

- **Shown only below `bp-md`.** From `bp-md` up, `SideNav` replaces it.
- **Look:** an `ink` fill with `on-ink` icon (`MenuOutlined`, 24px), `fab-size` 56px and `radius-full`. Its `shadow-fab` comes from the `FloatButton` component token `boxShadowSecondary`, so the CSS Module class keeps only its position, `fab-offset` (16px) from the right and bottom edges, plus `env(safe-area-inset-bottom)`. It's never red, because opening the menu isn't an alert.
- **Drawer:** `placement="bottom"` and `size="auto"` (`height` logs a deprecation warning), with `radius-lg` top corners. Its shadow comes from antd's own `boxShadowDrawer*` tokens. The menu items are 44px tall (`Menu` token `itemHeight`), use 16px text and 20px Outlined icons, and the current section is `surface-sunken`, with its label in a 600-weight span (as in `SideNav`). Tapping an item navigates and closes the drawer.
- **Hidden** on screens with a `StickyActionBar` (forms) and while a modal or another drawer is open.
- **Page padding:** scrolling pages reserve `space-7` + `fab-size` at the bottom, so the button never covers a list's last amount.
- **Accessibility:** the button has `aria-label="Open menu"` and `aria-expanded`. The drawer traps focus and returns it to the button on close (antd does both).
- **Items** (placeholders until the routes exist): Inventory, Purchases, Sales, Customers, Payments, Reports, Catalog, Settings.
