# Money

An amount stored as integer cents in the Organization's currency, shown with its symbol and the amount in the active language, through antd `Typography.Text`.

```tsx
<Typography.Text strong className={styles.money}>{formatMoney(cents, lang)}</Typography.Text>
<Statistic title={t("sale.balance")} value={formatMoney(balance, lang)} />   {/* totals */}
<Typography.Text type="danger" strong>{formatMoney(-40050, lang)}</Typography.Text>
```

- **Currency:** each Organization has one currency, BRL by default or USD, chosen once. Amounts are integer cents in that currency, and nothing is converted.
- **Symbol:** the back office shows `$`. The public catalog shows the Organization's symbol, `R$` or `US$`.
- **Rules (W4):** in the back office, en-US gives `$400`, `$400.50`, `$1,234.50` and `-$400.50`; pt-BR gives `$400`, `$400,50`, `$1.234,50` and `-$400,50`. Cents show only when they aren't zero.
- **Formatting** lives in `lib/format/money.ts`, from integers with no floating point. Pass the formatted string to `Statistic` as `value`, so antd doesn't reformat it.
- **Typography:** `money` (15/600) in rows and cards, `money-lg` (20/600) for totals and balances. `Statistic`'s value defaults to 24px, not 20, so set its size when it should match `money-lg`. `tabular-nums` comes from the allowed override (`.ant-statistic-content`) or the `money` class.
- **Tone:** default `ink`; `type="secondary"` (`ink-muted`); `type="danger"` (`colorErrorText` = `racing-red-text`) for overdue or negative balances; `type="success"` for amounts received.
