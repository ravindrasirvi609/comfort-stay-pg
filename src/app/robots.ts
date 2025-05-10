import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/admin-login/",
        "/dashboard/",
        "/api/",
        "/_next/",
        "/server-sitemap.xml",
      ],
    },
    sitemap: "https://www.comfortstaypg.com/sitemap.xml",
  };
}
