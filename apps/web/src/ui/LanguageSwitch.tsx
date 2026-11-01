import { GlobalOutlined } from "@ant-design/icons";
import { App, Button, Dropdown } from "antd";
import { useTranslation } from "react-i18next";
import { isLanguage, languageNames, languages } from "../i18n/i18n";
import { useLocale } from "../i18n/useLocale";

// A text button with the current language's name; its accessible name is
// "Language: English". Each option is written in its own language.
export function LanguageSwitch() {
  const { t } = useTranslation();
  const { language, switchLanguage } = useLocale();
  const { message } = App.useApp();

  return (
    <Dropdown
      trigger={["click"]}
      menu={{
        items: languages.map((option) => ({
          key: option,
          label: <span lang={option}>{languageNames[option]}</span>,
        })),
        selectable: true,
        selectedKeys: [language],
        onClick: ({ key }) => {
          if (!isLanguage(key) || key === language) {
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
        <span lang={language}>{languageNames[language]}</span>
      </Button>
    </Dropdown>
  );
}
