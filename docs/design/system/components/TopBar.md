# TopBar

The header above every back-office page, built from antd `Layout.Header`, `Avatar` and `Dropdown`. On phones it shows the logo and the user; on desktop, the page title and the user.

```tsx
<Layout.Header className={styles.header}>
  {isPhone ? <img src={logoUrl} alt="StorageMinis" height={20} /> : <Typography.Title level={1}>{title}</Typography.Title>}
  <Dropdown menu={{ items: accountItems }}>
    <Button type="text" aria-label={t("nav.account", { name: user.name })}>
      <Avatar size={32}>{initials}</Avatar>
      {!isPhone && <span>{user.name}</span>}
    </Button>
  </Dropdown>
</Layout.Header>
```

- **No menu button.** On phones the main menu is the floating `MenuFab`, and on desktop it's the `SideNav`.
- **Phones:** 56px tall, the full logo at 20px tall on the left, and the avatar on the right.
- **Desktop:** 64px tall, the page title in `title-lg` on the left (the logo lives in the `SideNav`), and the avatar plus name on the right.
- **Height:** `header-height` (64px) on desktop and `header-height-phone` (56px) below `bp-md`, set through the `Layout` tokens `headerHeight` and `headerPadding`.
- **Until sign-in exists (frontend PR 3):** there is no account menu yet, so the TopBar holds only the logo on phones and the page title from `bp-md`.
- **No language switch.** It sits at the bottom of the `SideNav` and in the footer of the `MenuFab`'s drawer, so the account menu doesn't take it.
- **Look:** `Layout` token `headerBg` (`surface`), with a bottom `line` border. The avatar shows initials on `surface-sunken`. The account menu holds Sign out.
- Red never appears here, apart from what's in the logo itself.
