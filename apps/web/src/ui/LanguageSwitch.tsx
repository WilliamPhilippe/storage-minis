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

// A text button with the globe and the current language: its name
// ("English") on the Login and catalog pages, its code ("EN") in the shell,
// or the globe alone in the collapsed SideNav. Its accessible name is always
// "Language: English". Each option is written in its own language.
export function LanguageSwitch({
  label = "name",
  placement = "bottomLeft",
}: {
  label?: "name" | "code" | "none";
  placement?: DropdownProps["placement"];
}) {
  const { t } = useTranslation();
  const { language, switchLanguage } = useLocale();
  const { message } = App.useApp();

  return (
    <Dropdown
      trigger={["click"]}
      placement={placement}
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
        icon={<GlobalOutlined aria-hidden />}
        aria-label={t("language.switch", { name: languageNames[language] })}
      >
        {label !== "none" && (
          <span lang={language}>
            {label === "code"
              ? languageCodes[language]
              : languageNames[language]}
          </span>
        )}
      </Button>
    </Dropdown>
  );
}
