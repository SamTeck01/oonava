import type { MetadataRoute } from "next";
import { services, demos } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://oonava.com";
  const paths = ["", "/services", "/solutions/real-estate", "/work", "/pricing", "/how-we-work", "/about", "/estimate", "/contact", "/privacy", "/terms",
    ...services.map((s) => `/services/${s.slug}`), ...demos.map((d) => `/work/${d.slug}`)];
  return paths.map((p) => ({ url: base + p }));
}
