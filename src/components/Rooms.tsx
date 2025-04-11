"use client";

import { motion } from "framer-motion";
import { Users, Snowflake, Star, Bed } from "lucide-react";

const rooms = [
  {
    type: "Shared Room",
    capacity: "2-3 Girls",
    price: "₹9,500/month",
    features: [
      "Spacious living area",
      "Personal cupboard",
      "Study table with chair",
      "High-speed WiFi",
      "Attached bathroom",
    ],
    color: "bg-pink-100 dark:bg-pink-900/20",
    icon: <Users size={24} />,
  },
  {
    type: "Twin Sharing",
    capacity: "2 Girls",
    price: "₹12,000/month",
    features: [
      "Premium twin beds",
      "Larger cupboards",
      "Dedicated study area",
      "High-speed WiFi",
      "Attached bathroom",
    ],
    color: "bg-pink-200 dark:bg-pink-900/40",
    icon: <Bed size={24} />,
  },
  {
    type: "AC Twin Sharing",
    capacity: "2 Girls",
    price: "₹14,000/month",
    features: [
      "Air conditioned room",
      "Premium twin beds",
      "Larger cupboards",
      "Dedicated study area",
      "Attached bathroom",
    ],
    color: "bg-pink-300 dark:bg-pink-900/60",
    icon: <Snowflake size={24} />,
  },
  {
    type: "Private Room",
    capacity: "1 Girl",
    price: "₹18,000/month",
    features: [
      "Complete privacy",
      "Queen sized bed",
      "Large wardrobe",
      "Dedicated work space",
      "Private bathroom",
    ],
    color: "bg-pink-400 dark:bg-pink-900/80",
    icon: <Star size={24} />,
  },
];

const Rooms = () => {
  return (
    <section id="rooms" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-effect p-8 md:p-12 rounded-lg"
        >
          <h2 className="comfort-header text-3xl font-bold mb-8 text-center">
            Room Types & Pricing
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {rooms.map((room, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card overflow-hidden"
              >
                <div
                  className={`${room.color} px-4 py-3 flex items-center justify-between`}
                >
                  <h3 className="text-xl font-bold">{room.type}</h3>
                  <div className="text-pink-600 dark:text-pink-300">
                    {room.icon}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <Users size={18} />
                      <span>{room.capacity}</span>
                    </span>
                    <span className="text-pink-600 dark:text-pink-400 font-semibold">
                      {room.price}
                    </span>
                  </div>
                  <ul className="space-y-2 mb-6 text-sm">
                    {room.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-pink-500">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-pink-600 hover:bg-pink-700 transition-colors text-white py-2 px-4 rounded-lg"
                  >
                    Book Now
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
          <p className="text-center mt-8 text-sm text-gray-600 dark:text-gray-300">
            All room prices include meals, electricity, water, WiFi, and
            housekeeping services.
            <br />
            Security deposit: Refundable amount equal to one month&apos;s rent.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Rooms;
