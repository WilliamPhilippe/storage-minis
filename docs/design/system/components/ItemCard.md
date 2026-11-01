# ItemCard

One available unit in the public catalog, built from antd `Card`: photo, brand, name and an optional price.

```tsx
<Card
  data-testid={`item-card-${item.id}`}
  cover={item.imageUrl ? <img src={item.imageUrl} alt={item.name} loading="lazy" /> : <NoPhoto />}
  styles={{ body: { padding: 12 } }}
>
  <Card.Meta
    title={item.name}
    description={`${item.brand} · ${item.scale}`}
  />
  {item.price != null && <Typography.Text strong>{formatMoney(item.price, lang)}</Typography.Text>}
</Card>
```

- **Styling:** `colorBgContainer` (`surface`), border `colorBorderSecondary` (`line`), corners `borderRadiusLG` (`radius-lg`), body padding `space-3`. The cover is 4:3 with `object-fit: cover` on `surface-sunken`. Set this through the `cover` element's className and the `styles` prop, not global CSS.
- **Text:** brand and scale in `caption` `ink-muted` (PRO-003 makes brand mandatory), the name in 14/600 clamped to two lines, and the price in `money`. The price is optional, and the card never shows stock counts.
- **No photo:** a neutral placeholder with `PictureOutlined` and "No photo" from the catalog.
- **Grid:** antd `Row` / `Col` or a CSS grid: two columns with gap `space-3` on phones, three to four from `bp-lg`.
- **Don't:** badge cards with red, show a status (everything in the catalog is Available), or overlay text on photos.
