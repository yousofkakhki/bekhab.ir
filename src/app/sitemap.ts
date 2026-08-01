import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/SEOConfig";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteConfig.url,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/blog`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
