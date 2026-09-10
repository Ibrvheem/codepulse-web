import type { MetadataRoute } from "next";

import { EDITOR_PAGES } from "./(landing)/for/[editor]/_lib/editor-pages";

const BASE = "https://www.writelogs.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, changeFrequency: "weekly", priority: 1 },
    ...EDITOR_PAGES.map((page) => ({
      url: `${BASE}/for/${page.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    {
      url: `${BASE}/daily-standup-update`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE}/wakatime-alternative`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    { url: `${BASE}/privacy`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/terms`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/refunds`, changeFrequency: "monthly", priority: 0.3 },
  ];
}
