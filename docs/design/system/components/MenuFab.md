# MenuFab

The main menu on phones: a round ink button at the bottom right that opens the menu in a bottom drawer, built from antd `FloatButton`, `Drawer` and `Menu`.

```tsx
<FloatButton
  type="primary"
  icon={<MenuOutlined />}
  aria-label={t("nav.openMenu")}
  onClick={() => setNavOpen(true)}
  className={styles.fab}            // 56px, fab-offset + safe area
/>
<Drawer placement="bottom" height="auto" open={navOpen} onClose={() => setNavOpen(false)} title={t("nav.menu")}>
  <Menu mode="inline" selectedKeys={[section]} items={navItems} onClick={() => setNavOpen(false)} />
</Drawer>
```

- **Shown only below `bp-md`.** From `bp-md` up, `SideNav` replaces it.
- **Look:** an `ink` fill with `on-ink` icon (`MenuOutlined`, 24px), `fab-size` 56px, `radius-full` and `shadow-fab`. It sits `fab-offset` (16px) from the right and bottom edges, plus `env(safe-area-inset-bottom)`. It's never red, because opening the menu isn't an alert.
- **Drawer:** `placement="bottom"` with `radius-lg` top corners and `shadow-overlay`. The menu items are 44px tall (`Menu` token `itemHeight`), use 16px text and 20px Outlined icons, and the current section is `surface-sunken` and 600 weight. Tapping an item navigates and closes the drawer.
- **Hidden** on screens with a `StickyActionBar` (forms) and while a modal or another drawer is open.
- **Page padding:** scrolling pages reserve `space-7` + `fab-size` at the bottom, so the button never covers a list's last amount.
- **Accessibility:** the button has `aria-label="Open menu"` and `aria-expanded`. The drawer traps focus and returns it to the button on close (antd does both).
- **Items** (placeholders until the routes exist): Inventory, Purchases, Sales, Customers, Payments, Reports, Catalog, Settings.
