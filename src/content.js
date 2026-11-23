import data from "./portfolio.json" with { type: "json" };
import { normalizePortfolio } from "./schema.js";
export const {profile, categories} = normalizePortfolio(data);
export const themes = {
  forest: {
    name: "Forest",
    english: "FOREST ISLAND",
    caption: "Curiosity, shaped into an island.",
    accent: "#3f7761",
    water: "#54bdc5",
    background: "#d5eef0",
  },
  desert: {
    name: "Desert",
    english: "DESERT OASIS",
    caption: "New possibilities in every grain of sand.",
    accent: "#aa6d3e",
    water: "#9bcfd0",
    background: "#f3e1cc",
  },
  ocean: {
    name: "Ocean",
    english: "OCEAN GARDEN",
    caption: "Dive in and listen for ideas.",
    accent: "#527ea4",
    water: "#5a9fc5",
    background: "#dce7f6",
  },
};
