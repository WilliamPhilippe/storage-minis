# SearchBar

antd `Input` and a Filters `Button` with a `Badge`, at the top of every filterable list and the catalog.

```tsx
<Flex gap={8}>
  <Input allowClear prefix={<SearchOutlined />} placeholder={t("items.search")} aria-label={t("common.search")} />
  <Badge count={activeFilters} color="#161b21">
    <Button icon={<FilterOutlined />} onClick={openFilters} aria-label={t("common.filtersCount", { count: activeFilters })}>
      {t("common.filters")}
    </Button>
  </Badge>
</Flex>
<Drawer placement={isPhone ? "bottom" : "right"} open={filtersOpen} title={t("common.filters")}>…</Drawer>
```

- **Styling:** theme only. Control height comes from `componentSize`. The `Badge` uses `ink` instead of antd's default red, because an active filter isn't an alert.
- **Filters** go in an antd `Drawer`: `placement="bottom"` on phones with `radius-lg` top corners, and on the right from `bp-md` up.
- **Accessible name** includes the count ("Filters, 2 active").
- The query and filters live in URL search params, validated with Zod (W5), so lists are shareable and survive a reload.
