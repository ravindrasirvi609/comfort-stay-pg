"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Users, Bed, Check, Sparkles, ArrowRight, Phone } from "lucide-react";
import BlurText from "../BlurText";
import { cn } from "@/lib/utils";

interface Room {
  type: string;
  capacity: string;
  price: string;
  image: string;
  features: string[];
  popular?: boolean;
}

const rooms: Room[] = [
  {
    type: "Triple Sharing",
    capacity: "3 Girls",
    price: "8,500",
    image: "/gallery/3sharing.jpg",
    features: [
      "Brand new furnished room",
      "Spacious living area",
      "Personal cupboard per bed",
      "Pillow & bedsheet included",
      "High-speed WiFi",
      "Attached bathroom",
    ],
  },
  {
    type: "Twin Sharing",
    capacity: "2 Girls",
    price: "10,000",
    image: "/gallery/2sharing.jpg",
    popular: true,
    features: [
      "Brand new furnished room",
      "Premium twin beds",
      "Larger personal cupboards",
      "Pillow & bedsheet included",
      "High-speed WiFi",
      "Attached bathroom",
    ],
  },
];

export default function RoomsV2() {
  return (
    <section id="rooms" className="py-20 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="eyebrow mb-4 justify-center">
            <span className="w-8 h-px bg-pink-500" /> Rooms & Pricing
            <span className="w-8 h-px bg-pink-500" />
          </div>
          <BlurText
            as="h2"
            text="Pick the room that fits your rhythm."
            className="font-display text-[clamp(2rem,3.5vw,3.25rem)] font-bold leading-[1.08] tracking-tight text-gray-900 dark:text-white mb-4"
          />
          <p className="text-gray-600 dark:text-pink-100/70">
            All-inclusive pricing — meals, WiFi, electricity, water, and
            housekeeping. No hidden charges.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {rooms.map((room, i) => (
            <motion.div
              key={room.type}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={cn(
                "group relative overflow-hidden rounded-3xl border backdrop-blur-xl transition-all",
                room.popular
                  ? "border-transparent shadow-2xl shadow-pink-500/25 ring-1 ring-pink-500/20"
                  : "border-pink-100/60 dark:border-pink-900/40 hover:shadow-xl hover:shadow-pink-500/10"
              )}
            >
              {/* Shimmer border for popular */}
              {room.popular && (
                <div className="pointer-events-none absolute inset-0 rounded-3xl">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-pink-500/60 via-rose-400/50 to-fuchsia-500/60 p-[1.5px]">
                    <div className="h-full w-full rounded-[calc(1.5rem-1.5px)] bg-white/85 dark:bg-[#2b1a26]/85 backdrop-blur-xl" />
                  </div>
                </div>
              )}
              {!room.popular && (
                <div className="absolute inset-0 rounded-3xl bg-white/70 dark:bg-pink-950/25" />
              )}

              <div className="relative">
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={room.image}
                    alt={`${room.type} room at Comfort Stay PG`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(min-width: 768px) 40vw, 90vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-transparent" />
                  {room.popular && (
                    <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur px-3 py-1 text-[11px] font-bold text-pink-700 shadow-lg">
                      <Sparkles size={12} className="fill-pink-500 stroke-pink-500" />
                      Most Popular
                    </span>
                  )}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                    <div>
                      <div className="text-xs opacity-90 mb-0.5">
                        {room.capacity}
                      </div>
                      <h3 className="text-2xl font-bold font-display leading-none">
                        {room.type}
                      </h3>
                    </div>
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                      {room.popular ? <Bed size={20} /> : <Users size={20} />}
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6">
                  <div className="mb-5 flex items-baseline gap-1">
                    <span className="text-4xl md:text-5xl font-black font-display text-gray-900 dark:text-white">
                      ₹{room.price}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-pink-100/60">
                      / month
                    </span>
                    <span className="ml-auto inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-900/25 px-3 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                      All inclusive
                    </span>
                  </div>

                  <ul className="grid grid-cols-1 gap-2 mb-6">
                    {room.features.map((f, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-2 text-sm text-gray-700 dark:text-pink-100/80"
                      >
                        <Check
                          size={16}
                          className="mt-0.5 shrink-0 text-pink-500"
                        />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-3">
                    <a
                      href="/contact"
                      className="btn-primary flex-1 min-w-[140px] justify-center"
                    >
                      Book Now <ArrowRight size={16} />
                    </a>
                    <a
                      href={`https://wa.me/919922538989?text=${encodeURIComponent(
                        `I'm interested in the ${room.type} room @ Comfort Stay PG`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary justify-center px-4"
                      aria-label="WhatsApp"
                    >
                      <Phone size={16} />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="text-center mt-10 text-sm text-gray-500 dark:text-pink-100/60">
          Limited rooms available in our brand-new July 2025 building.
        </p>
      </div>
    </section>
  );
}
