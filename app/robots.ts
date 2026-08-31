import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Auth pages and shared summaries stay crawlable but carry a
      // noindex meta tag instead — blocking them here would hide the
      // noindex from Google when they're linked externally.
      disallow: ["/dashboard", "/api/"],
    },
    sitemap: "https://www.writelogs.com/sitemap.xml",
  };
}
