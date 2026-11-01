import "antd/dist/reset.css";
import "./ui/tokens.css";
import "./ui/antd-overrides.css";
import "./ui/base.css";
import { ConfigProvider, Spin } from "antd";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { theme } from "./ui/theme";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("The page has no #root element.");
}

createRoot(rootElement).render(
  <StrictMode>
    <ConfigProvider theme={theme}>
      <Spin />
    </ConfigProvider>
  </StrictMode>,
);
