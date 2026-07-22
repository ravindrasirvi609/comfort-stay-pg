"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useMemo, useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, Expand } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import BlurText from "../BlurText";

interface GalleryImage {
  src: string;
  alt: string;
  category: "rooms" | "dining" | "exterior" | "amenities" | "common";
}

const images: GalleryImage[] = [
  { src: "/gallery/2sharing.jpg", alt: "Twin Sharing Room — bright & spacious", category: "rooms" },
  { src: "/gallery/3sharing.jpg", alt: "Triple Sharing Room — modern furnishing", category: "rooms" },
  { src: "/gallery/dining.jpg", alt: "Dining Area — communal dining space", category: "dining" },
  { src: "/gallery/bathroom.jpg", alt: "Attached Bathroom — clean & modern", category: "rooms" },
  { src: "/gallery/building.jpg", alt: "Building Exterior — Comfort Stay PG", category: "exterior" },
];

const categories = [
  { id: "all", label: "All" },
  { id: "rooms", label: "Rooms" },
  { id: "dining", label: "Dining" },
  { id: "exterior", label: "Exterior" },
] as const;

type CategoryId = (typeof categories)[number]["id"];

export default function GalleryV2() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredImages = useMemo(
    () =>
      activeCategory === "all"
        ? images
        : images.filter((img) => img.category === activeCategory),
    [activeCategory]
  );

  const openAt = useCallback((idx: number) => setLightboxIndex(idx), []);
  const close = useCallback(() => setLightboxIndex(null), []);
  const next = useCallback(() => {
    setLightboxIndex((i) =>
      i === null ? i : (i + 1) % filteredImages.length
    );
  }, [filteredImages.length]);
  const prev = useCallback(() => {
    setLightboxIndex((i) =>
      i === null ? i : (i - 1 + filteredImages.length) % filteredImages.length
    );
  }, [filteredImages.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, next, prev]);

  return (
    <section id="gallery" className="py-20 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="eyebrow mb-4 justify-center">
            <span className="w-8 h-px bg-pink-500" /> Photo Gallery
            <span className="w-8 h-px bg-pink-500" />
          </div>
          <BlurText
            as="h2"
            text="A peek inside Comfort Stay PG."
            className="font-display text-[clamp(2rem,3.5vw,3.25rem)] font-bold leading-[1.08] tracking-tight text-gray-900 dark:text-white mb-4"
          />
          <p className="text-gray-600 dark:text-pink-100/70">
            Real rooms, real spaces — captured just for you.
          </p>
        </div>

        <Tabs
          value={activeCategory}
          onValueChange={(v) => setActiveCategory(v as CategoryId)}
          className="w-full"
        >
          <div className="flex justify-center mb-8">
            <TabsList>
              {categories.map((c) => (
                <TabsTrigger key={c.id} value={c.id}>
                  {c.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>

        {/* Masonry-ish grid */}
        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] md:auto-rows-[220px] gap-3 md:gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredImages.map((img, i) => {
              // varied row spans for masonry feel
              const rowSpan =
                i % 5 === 0 ? "row-span-2" : i % 3 === 0 ? "row-span-2" : "";
              const colSpan = i % 4 === 0 ? "col-span-2" : "";
              return (
                <motion.button
                  key={img.src}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  onClick={() => openAt(i)}
                  className={`group relative overflow-hidden rounded-3xl border border-pink-100/60 dark:border-pink-900/40 bg-pink-50 dark:bg-pink-950/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 ${rowSpan} ${colSpan}`}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(min-width: 768px) 25vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center justify-between w-full text-white">
                      <span className="text-sm font-semibold drop-shadow">
                        {img.alt}
                      </span>
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/25 backdrop-blur">
                        <Expand size={14} />
                      </span>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Lightbox */}
        <Dialog
          open={lightboxIndex !== null}
          onOpenChange={(o) => !o && close()}
        >
          <DialogContent
            hideClose
            className="max-w-5xl bg-transparent border-0 shadow-none p-0"
          >
            <DialogTitle className="sr-only">Image gallery lightbox</DialogTitle>
            {lightboxIndex !== null && (
              <div className="relative">
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-black">
                  <Image
                    src={filteredImages[lightboxIndex].src}
                    alt={filteredImages[lightboxIndex].alt}
                    fill
                    className="object-contain"
                    sizes="90vw"
                    priority
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-white">
                  <span className="text-sm">
                    {filteredImages[lightboxIndex].alt}
                  </span>
                  <span className="text-xs opacity-70">
                    {lightboxIndex + 1} / {filteredImages.length}
                  </span>
                </div>

                {filteredImages.length > 1 && (
                  <>
                    <button
                      onClick={prev}
                      aria-label="Previous"
                      className="absolute left-2 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur flex items-center justify-center text-white"
                    >
                      <ChevronLeft />
                    </button>
                    <button
                      onClick={next}
                      aria-label="Next"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur flex items-center justify-center text-white"
                    >
                      <ChevronRight />
                    </button>
                  </>
                )}

                <button
                  onClick={close}
                  aria-label="Close"
                  className="absolute -top-12 right-0 md:right-2 h-10 w-10 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur flex items-center justify-center text-white"
                >
                  <X />
                </button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
