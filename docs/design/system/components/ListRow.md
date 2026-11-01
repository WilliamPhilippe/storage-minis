# ListRow

One record in a filterable list (an item, sale, customer or payment), readable at phone width.

**Before building:** antd's `List` is deprecated since antd 6.0 and warns on every render. Its replacement, `Listy` (6.6.0), is a different, virtualized API, so `ListRow`'s first implementation chooses between `Listy` and plain markup (a `<ul>` styled with CSS Modules). The sketch below shows the anatomy with the old `List` names only.

```tsx
<List
  className={styles.list}
  dataSource={sales}
  renderItem={(sale) => (
    <List.Item>
      <Link to="/app/sales/$id" params={{ id: sale.id }} className={styles.rowLink}>
        <List.Item.Meta
          title={`Sale #${sale.number} · ${sale.customerName}`}
          description={<>{t("sale.items", { count: sale.itemCount })} · {formatDate(sale.createdAt)}</>}
        />
        <Tag variant="filled" {...statusTagProps(sale.state)} />
        <Typography.Text strong>{formatMoney(sale.total, lang)}</Typography.Text>
        <RightOutlined aria-hidden />
      </Link>
    </List.Item>
  )}
/>
```

- **Styling:** the list sits in a `surface` container with a `line` border (`colorBorderSecondary`) and `radius-md`, with `line` dividers. The row padding is `space-3` / `space-4`, the minimum height is `control-touch`, and hover is `surface-sunken`. Only the link layout is CSS Module work.
- **Anatomy:** the title (`heading`, one line, ellipsis); the meta line (`caption`, `ink-muted`, with Item IDs in `item-id` mono through `Typography.Text code`); the status `Tag` under the meta line; the amount top-right, which never shrinks; and a chevron when the row opens a detail page.
- **The whole row is one link.** No buttons inside it. Secondary actions go on the detail page or in a `Dropdown`.
- Use this before a `Table`. A screen that needs columns decides its own phone layout.
