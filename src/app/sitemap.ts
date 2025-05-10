import { MetadataRoute } from "next";

// Base URL of your website
const baseUrl = "https://www.comfortstaypg.com";

// Helper function to get a date a few days ago for realistic lastModified dates
const getRecentDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
};

export default function sitemap(): MetadataRoute.Sitemap {
  // Main pages with custom lastModified dates to make them more realistic
  const mainPages = [
    {
      url: `${baseUrl}`,
      lastModified: getRecentDate(1), // Homepage updated most recently
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: getRecentDate(15),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/facilities`,
      lastModified: getRecentDate(30),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: getRecentDate(7),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/testimonials`,
      lastModified: getRecentDate(5),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faqs`,
      lastModified: getRecentDate(10),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: getRecentDate(3),
      changeFrequency: "monthly" as const,
      priority: 0.9, // Higher priority for contact page to encourage inquiries
    },
  ];

  // Sample room pages if you have them
  const roomPages = [
    {
      url: `${baseUrl}/rooms/triple-sharing`,
      lastModified: getRecentDate(2),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/rooms/twin-sharing`,
      lastModified: getRecentDate(2),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
  ];

  return [...mainPages, ...roomPages];
}
