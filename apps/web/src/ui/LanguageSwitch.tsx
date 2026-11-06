import { GlobalOutlined } from "@ant-design/icons";
import { App, Button, Dropdown, type DropdownProps } from "antd";
import { useTranslation } from "react-i18next";
import {
  isLanguage,
  languageCodes,
  languageNames,
  languages,
} from "../i18n/i18n";
import { useLocale } from "../i18n/useLocale";

// A text button with the globe and the current language's code ("EN"), or
// the globe alone in the collapsed SideNav (owner, 2026-11-01). Its accessible
// name is always "Language: English". Each option is written in its own
// language. The Login page disables it while signing in.
export function LanguageSwitch({
  iconOnly = false,
  placement = "bottomLeft",
  disabled = false,
}: {
  iconOnly?: boolean;
  placement?: DropdownProps["placement"];
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const { language, switchLanguage } = useLocale();
  const { message } = App.useApp();

  return (
    <Dropdown
      trigger={["click"]}
      placement={placement}
      disabled={disabled}
      menu={{
        items: languages.map((option) => ({
          key: option,
          label: <span lang={option}>{languageNames[option]}</span>,
        })),
        selectable: true,
        selectedKeys: [language],
        onClick: ({ key }) => {
          if (!isLanguage(key)) {
            return;
          }
          switchLanguage(key).catch(() => {
            void message.error(t("language.failed"));
          });
        },
      }}
    >
      <Button
        type="text"
        disabled={disabled}
        icon={<GlobalOutlined aria-hidden />}
        aria-label={t("language.switch", { name: languageNames[language] })}
      >
        {!iconOnly && <span lang={language}>{languageCodes[language]}</span>}
      </Button>
    </Dropdown>
  );
}
