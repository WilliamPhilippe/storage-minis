# SideNav

The main menu on desktop: a left sidebar that expands to logo and labels or collapses to the mark and icons, built from antd `Layout.Sider` and `Menu`.

```tsx
<Layout.Sider
  theme="light"
  collapsible
  collapsed={collapsed}
  trigger={null}                     // our own button below; antd's is a div with no role, focus or label
  width={240}                        // sider-width
  collapsedWidth={72}                // sider-collapsed
>
  <div className={styles.logo}>
    <img src={collapsed ? markUrl : logoUrl} alt="StorageMinis" />
  </div>
  <Menu mode="inline" selectedKeys={[section]} items={navItems} />
  {collapsed ? (
    <Button type="text" icon={<MenuUnfoldOutlined />} aria-label={t("nav.expandMenu")} aria-expanded={false} onClick={() => setCollapsed(false)} />
  ) : (
    <Button type="text" icon={<MenuFoldOutlined />} aria-expanded onClick={() => setCollapsed(true)}>{t("nav.collapse")}</Button>
  )}
</Layout.Sider>
```

- **Shown from `bp-md` up.** No `breakpoint` prop: it would override a restored choice on mount. The shell sets the default instead: collapsed from `bp-md` to `bp-lg`, expanded from `bp-lg`. A choice the person saved (localStorage) wins over the default.
- **Look:** background `surface` (antd's light `Sider`), with a right `line` border. The logo area is 64px tall: the full logo at 20px tall when expanded (it is 188px wide at that height), the mark at 32px wide when collapsed. Items are 44px with 20px Outlined icons. The selected and hover background is `surface-sunken`, with `ink` text for the current section.
- **Current item weight:** `Menu` has no weight token, so the current item's label is rendered inside a 600-weight span in `navItems`. No `.ant-*` class is targeted. `MenuFab`'s drawer menu does the same.
- **Collapse button:** our own text `Button` at the bottom, replacing antd's trigger (`trigger={null}`). Expanded, it shows "Collapse" with its icon. Collapsed, it is icon-only and named "Expand menu". Both carry `aria-expanded`.
- **Collapsed** items show their label in a tooltip (antd does this), and each keeps its accessible name.
- **Items:** the same list as `MenuFab`, in the same order.
