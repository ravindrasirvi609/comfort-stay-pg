import { MetadataRoute } from "next";

// Base URL of your website
const baseUrl = "https://comfortstaypg.com";

export default function sitemap(): MetadataRoute.Sitemap {
  // Add static routes here
  const staticRoutes = [
    "", // Homepage
    "/about",
    "/facilities",
    "/gallery",
    "/testimonials",
    "/faqs",
    "/contact",
    // Add other static pages like /rooms if it's a single page overview
  ];

  // TODO: Add dynamic routes if you have them
  // Example: Fetching room IDs from a database/API
  // const rooms = await fetchRoomsFromAPI();
  // const dynamicRoomRoutes = rooms.map((room) => ({
  //   url: `${baseUrl}/rooms/${room.slug}`, // Assuming you have slugs
  //   lastModified: new Date(), // Or fetch last updated date
  //   changeFrequency: 'weekly',
  //   priority: 0.8,
  // }));

  const staticUrls = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(), // Use a more specific date if possible
    changeFrequency: "weekly" as "weekly", // Or 'weekly', 'daily' depending on update frequency
    priority: route === "" ? 1.0 : 0.8, // Homepage highest priority
  }));

  return [
    ...staticUrls,
    // ...dynamicRoomRoutes, // Uncomment and adapt if you add dynamic routes
  ];
}
