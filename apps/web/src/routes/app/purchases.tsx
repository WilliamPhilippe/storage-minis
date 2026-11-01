import { createFileRoute } from "@tanstack/react-router";
import { SectionPlaceholder } from "../../features/sections/SectionPlaceholder";

export const Route = createFileRoute("/app/purchases")({
  staticData: { titleKey: "purchases" },
  component: SectionPlaceholder,
});
