import en from "./portfolio.json" with { type: "json" };
import zh from "./portfolio.zh.json" with { type: "json" };
import { normalizePortfolio } from "./schema.js";
import { lang, t, overlay } from "./i18n.js";
// English is the source; the Chinese file only holds translated text and is merged on top.
const data = lang === "zh" ? overlay(en, zh) : en;
export const {profile, categories} = normalizePortfolio(data);
export const themes = {
  forest: {
    name: t("themeForest"),
    english: t("engForest"),
    caption: t("capForest"),
    accent: "#3f7761",
    water: "#54bdc5",
    background: "#d5eef0",
  },
  desert: {
    name: t("themeDesert"),
    english: t("engDesert"),
    caption: t("capDesert"),
    accent: "#aa6d3e",
    water: "#9bcfd0",
    background: "#f3e1cc",
  },
  ocean: {
    name: t("themeOcean"),
    english: t("engOcean"),
    caption: t("capOcean"),
    accent: "#527ea4",
    water: "#5a9fc5",
    background: "#dce7f6",
  },
};
