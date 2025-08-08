"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

const images = [
  {
    src: "/gallery/2sharing.jpg",
    alt: "Twin Sharing Room",
    category: "rooms",
  },
  {
    src: "/gallery/3sharing.jpg",
    alt: "Private Room",
    category: "rooms",
  },
  {
    src: "/gallery/lounge.jpg",
    alt: "Lounge Area",
    category: "common",
  },
  {
    src: "/gallery/dining.jpg",
    alt: "Dining Area",
    category: "dining",
  },
  {
    src: "/gallery/kitchen.jpg",
    alt: "Kitchen",
    category: "dining",
  },
  {
    src: "/gallery/3sharing1.jpg",
    alt: "Study Room",
    category: "common",
  },
  {
    src: "/gallery/bathroom.jpg",
    alt: "Bathroom",
    category: "rooms",
  },
  {
    src: "/gallery/beauty-corner.jpg",
    alt: "Beauty Corner",
    category: "amenities",
  },
  {
    src: "/gallery/building.jpg",
    alt: "Building Exterior",
    category: "exterior",
  },
  {
    src: "/gallery/entrance.jpg",
    alt: "Reception Area",
    category: "common",
  },
  {
    src: "/gallery/garden.jpg",
    alt: "Garden Area",
    category: "exterior",
  },
  {
    src: "/gallery/security.jpg",
    alt: "Security System",
    category: "amenities",
  },
];

const categories = [
  { id: "all", label: "All Photos" },
  { id: "rooms", label: "Rooms" },
  { id: "common", label: "Common Areas" },
  { id: "dining", label: "Dining & Kitchen" },
  { id: "amenities", label: "Amenities" },
  { id: "exterior", label: "Exterior" },
];

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredImages =
    activeCategory === "all"
      ? images
      : images.filter((image) => image.category === activeCategory);

  return (
    <section id="gallery" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-effect p-8 md:p-12 rounded-2xl gradient-ring"
        >
          <h2 className="section-title text-gradient title-accent mb-8">
            Photo Gallery
          </h2>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-lg backdrop-blur-sm transition-all duration-300 ${
                  activeCategory === category.id
                    ? "bg-pink-600 text-white"
                    : "bg-white/10 hover:bg-pink-200/20 dark:hover:bg-pink-900/30"
                }`}
              >
                {category.label}
              </motion.button>
            ))}
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredImages.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card overflow-hidden aspect-square gradient-ring"
              >
                <div className="w-full h-full bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center group relative">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                    width={300}
                    height={300}
                  />
                  <div className="absolute inset-0 bg-pink-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-white font-medium">{image.alt}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Gallery;
