import { MetadataRoute } from "next";

const baseUrl = "https://www.comfortstaypg.com";

const getRecentDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
};

// Public gallery images (add more here as they are added to /public/gallery/)
const galleryImages = [
  `${baseUrl}/gallery/building.jpg`,
  `${baseUrl}/gallery/2sharing.jpg`,
  `${baseUrl}/gallery/3sharing.jpg`,
  `${baseUrl}/gallery/dining.jpg`,
  `${baseUrl}/gallery/bathroom.jpg`,
];

export default function sitemap(): MetadataRoute.Sitemap {
  const mainPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: getRecentDate(1),
      changeFrequency: "daily",
      priority: 1.0,
      images: galleryImages,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: getRecentDate(15),
      changeFrequency: "monthly",
      priority: 0.8,
      images: [`${baseUrl}/gallery/building.jpg`],
    },
    {
      url: `${baseUrl}/facilities`,
      lastModified: getRecentDate(30),
      changeFrequency: "monthly",
      priority: 0.8,
      images: [
        `${baseUrl}/gallery/2sharing.jpg`,
        `${baseUrl}/gallery/3sharing.jpg`,
      ],
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: getRecentDate(7),
      changeFrequency: "weekly",
      priority: 0.7,
      images: galleryImages,
    },
    {
      url: `${baseUrl}/testimonials`,
      lastModified: getRecentDate(5),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faqs`,
      lastModified: getRecentDate(10),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: getRecentDate(3),
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];

  const roomPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/rooms/triple-sharing`,
      lastModified: getRecentDate(2),
      changeFrequency: "weekly",
      priority: 0.8,
      images: [`${baseUrl}/gallery/3sharing.jpg`],
    },
    {
      url: `${baseUrl}/rooms/twin-sharing`,
      lastModified: getRecentDate(2),
      changeFrequency: "weekly",
      priority: 0.8,
      images: [`${baseUrl}/gallery/2sharing.jpg`],
    },
  ];

  return [...mainPages, ...roomPages];
}
