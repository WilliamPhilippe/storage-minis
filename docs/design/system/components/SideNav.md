# SideNav

The main menu on desktop: a left sidebar that expands to logo and labels or collapses to the mark and icons, built from antd `Layout.Sider` and `Menu`.

```tsx
<Layout.Sider
  theme="light"
  collapsible
  collapsed={collapsed}
  onCollapse={setCollapsed}         // persisted per browser
  width={240}                        // sider-width
  collapsedWidth={72}                // sider-collapsed
  breakpoint="lg"                    // starts collapsed below bp-lg
>
  <div className={styles.logo}>
    <img src={collapsed ? markUrl : logoUrl} alt="StorageMinis" />
  </div>
  <Menu mode="inline" selectedKeys={[section]} items={navItems} />
</Layout.Sider>
```

- **Shown from `bp-md` up.** It's collapsed by default from `bp-md` to `bp-lg` and expanded from `bp-lg`. The person's choice is kept in localStorage.
- **Look:** background `surface` (`Layout` token `siderBg`), with a right `line` border. The logo area is 64px tall: the full logo at 20px tall when expanded (it is 188px wide at that height), the mark at 32px wide when collapsed. Items are 44px with 20px Outlined icons. The selected and hover background is `surface-sunken`, with `ink` text at 600 weight for the current section.
- **Trigger:** antd's built-in trigger at the bottom (`Layout` tokens `triggerBg` `surface`, `triggerColor` `ink`, `triggerHeight` 48), labelled "Collapse" / "Expand menu".
- **Collapsed** items show their label in a tooltip (antd does this), and each keeps its accessible name.
- **Items:** the same list as `MenuFab`, in the same order.
