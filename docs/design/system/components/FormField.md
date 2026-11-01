# FormField

antd `Form.Item` (vertical) around an antd input, registered once as our TanStack Form field components.

```tsx
<Form layout="vertical" requiredMark>
  <form.AppField name="amount">
    {(field) => <field.MoneyInput label={t("payment.amount")} help={t("payment.amountHelp")} />}
  </form.AppField>
</Form>
// field.MoneyInput renders <Form.Item label validateStatus help required> around <InputNumber>
```

- **Inputs:** `Input`, `InputNumber`, `Select`, `DatePicker`, `Checkbox`, `Radio`, all antd. The wrappers only connect TanStack Form state to `Form.Item` props: `validateStatus="error"`, `help={error}` and `required`.
- **Styling:** labels come from `Form.Item` (14/500 `ink`), and the required mark is `colorError`. Borders use `colorBorder` (`line-strong`), with hover and active borders in `ink` (`Input` component tokens `hoverBorderColor` / `activeBorderColor`) and the active shadow a 2px `focus-ring`. Errors use `colorErrorText` (`racing-red-text`) and a `colorError` border.
- **Label above, always.** Never use a placeholder as the label.
- Error copy says what to do: "The amount is higher than the outstanding balance of $1,200."
- **Size:** from `componentSize`: `large` on phones (44px, 16px text, which avoids iOS zoom) and `middle` on desktop. Fields are full width, with `space-4` between them.
