# Money

An amount stored as integer centavos, shown as `$` and the amount in the active language, through antd `Typography.Text`.

```tsx
<Typography.Text strong className={styles.money}>{formatMoney(cents, lang)}</Typography.Text>
<Statistic title={t("sale.balance")} value={formatMoney(balance, lang)} />   {/* totals */}
<Typography.Text type="danger" strong>{formatMoney(-40050, lang)}</Typography.Text>
```

- **Rules (W4):** en-US gives `$400`, `$400.50`, `$1,234.50` and `-$400.50`; pt-BR gives `$400`, `$400,50`, `$1.234,50` and `-$400,50`. Cents show only when they aren't zero. Never `R$` or `US$`, and nothing is converted.
- **Formatting** lives in `lib/format/money.ts`, from integers with no floating point. Pass the formatted string to `Statistic` as `value`, so antd doesn't reformat it.
- **Typography:** `money` (15/600) in rows and cards, `money-lg` (20/600) for totals and balances. `tabular-nums` comes from the allowed override (`.ant-statistic-content`) or the `money` class.
- **Tone:** default `ink`; `type="secondary"` (`ink-muted`); `type="danger"` (`colorErrorText` = `racing-red-text`) for overdue or negative balances; `type="success"` for amounts received.
