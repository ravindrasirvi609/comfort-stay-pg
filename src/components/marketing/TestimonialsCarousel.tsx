"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import BlurText from "../BlurText";
import { cn } from "@/lib/utils";

interface Testimonial {
  name: string;
  role: string;
  company: string;
  rating: number;
  comment: string;
  gradient: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Anjali Sharma",
    role: "Software Developer",
    company: "TCS",
    rating: 5,
    comment:
      "I moved into Comfort Stay PG when it opened. As a woman in IT, safety was my priority — the security here is excellent. Clean, spacious rooms and incredibly supportive staff.",
    gradient: "from-pink-400 to-rose-500",
  },
  {
    name: "Neha Gupta",
    role: "Digital Marketing Specialist",
    company: "Infosys",
    rating: 5,
    comment:
      "Moving to Pune for work was made easy with Comfort Stay PG. Homely atmosphere, wholesome food, and a community of like-minded women. Perfect commute to Hinjewadi IT Park.",
    gradient: "from-fuchsia-400 to-pink-500",
  },
  {
    name: "Priya Desai",
    role: "MBA Student",
    company: "Symbiosis Institute",
    rating: 5,
    comment:
      "Quiet study spaces and blazing WiFi are gold for a student. Flexible timings work for my schedule, and I never worry about safety returning late.",
    gradient: "from-rose-400 to-red-400",
  },
  {
    name: "Sanjana Patel",
    role: "UI/UX Designer",
    company: "Wipro",
    rating: 4,
    comment:
      "Amenities are thoughtfully designed for working women. My twin-sharing room feels roomy and private. So glad I moved in shortly after they opened.",
    gradient: "from-pink-300 to-fuchsia-400",
  },
  {
    name: "Riya Mehta",
    role: "HR Executive",
    company: "Tech Mahindra",
    rating: 5,
    comment:
      "The best PG choice I made in Pune. Cleanliness, nutritious meals, attentive staff — it truly feels like home. Very responsive to feedback.",
    gradient: "from-pink-500 to-rose-600",
  },
];

export default function TestimonialsCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      slidesToScroll: 1,
      breakpoints: {
        "(min-width: 640px)": { slidesToScroll: 2 },
        "(min-width: 1024px)": { slidesToScroll: 3 },
      },
    },
    [Autoplay({ delay: 4500, stopOnInteraction: true })]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollTo = useCallback(
    (idx: number) => emblaApi?.scrollTo(idx),
    [emblaApi]
  );
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi]);

  return (
    <section id="testimonials" className="py-20 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="eyebrow mb-4 justify-center">
            <span className="w-8 h-px bg-pink-500" /> Testimonials
            <span className="w-8 h-px bg-pink-500" />
          </div>
          <BlurText
            as="h2"
            text="Loved by residents. Every day."
            className="font-display text-[clamp(2rem,3.5vw,3.25rem)] font-bold leading-[1.08] tracking-tight text-gray-900 dark:text-white mb-4"
          />
          <p className="text-gray-600 dark:text-pink-100/70">
            Real stories from the women who call Comfort Stay home.
          </p>
        </div>

        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-4">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className="pl-4 flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="h-full rounded-3xl border border-pink-100/60 dark:border-pink-900/40 bg-white/75 dark:bg-pink-950/25 backdrop-blur-xl p-6 md:p-7 shadow-sm hover:shadow-lg hover:shadow-pink-500/10 transition-shadow"
                  >
                    <Quote
                      className="w-8 h-8 text-pink-300 dark:text-pink-500/70 mb-3"
                      strokeWidth={1.5}
                    />
                    <p className="text-gray-700 dark:text-pink-100/85 leading-relaxed mb-6">
                      &ldquo;{t.comment}&rdquo;
                    </p>
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "h-11 w-11 rounded-2xl bg-gradient-to-br shadow-md flex items-center justify-center text-white font-bold",
                          t.gradient
                        )}
                      >
                        {t.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 dark:text-white text-sm">
                          {t.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-pink-100/60">
                          {t.role} • {t.company}
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, s) => (
                          <Star
                            key={s}
                            size={12}
                            className={cn(
                              s < t.rating
                                ? "fill-pink-500 stroke-pink-500"
                                : "text-pink-200"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="mt-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              {scrollSnaps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollTo(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    idx === selectedIndex
                      ? "w-8 bg-gradient-to-r from-pink-500 to-rose-500"
                      : "w-2 bg-pink-200 dark:bg-pink-800/60 hover:bg-pink-300"
                  )}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={scrollPrev}
                aria-label="Previous testimonial"
                className="h-10 w-10 rounded-full border border-pink-200 dark:border-pink-800/60 bg-white/70 dark:bg-pink-950/30 backdrop-blur text-pink-700 dark:text-pink-200 hover:bg-pink-50 dark:hover:bg-pink-900/40 transition-colors flex items-center justify-center"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={scrollNext}
                aria-label="Next testimonial"
                className="h-10 w-10 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/30 hover:shadow-lg hover:shadow-pink-500/50 transition-shadow flex items-center justify-center"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
