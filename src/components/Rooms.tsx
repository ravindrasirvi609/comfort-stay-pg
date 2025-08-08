"use client";

import { motion } from "framer-motion";
import { Users, Bed } from "lucide-react";

const rooms = [
  {
    type: "Triple Sharing",
    capacity: "3 Girls",
    price: "₹8,000/month",
    features: [
      "Brand new room",
      "Spacious living area",
      "Personal cupboard",
      "Pillow and bed sheet provided with furnished room",
      "High-speed WiFi",
      "Attached bathroom",
    ],
    color: "bg-pink-100 dark:bg-pink-900/20",
    icon: <Users size={24} />,
  },
  {
    type: "Twin Sharing",
    capacity: "2 Girls",
    price: "₹9,500/month",
    features: [
      "Brand new room",
      "Premium twin beds",
      "Larger cupboards",
      "Pillow and bed sheet provided with furnished room",
      "High-speed WiFi",
      "Attached bathroom",
    ],
    color: "bg-pink-200 dark:bg-pink-900/40",
    icon: <Bed size={24} />,
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
          className="glass-effect p-8 md:p-12 rounded-2xl gradient-ring"
        >
          <h2 className="section-title text-gradient title-accent mb-8">
            Room Types & Pricing
          </h2>
          <p className="text-center mb-8 text-gray-700 dark:text-gray-300">
            Our brand new building opened in July 2025 with two room options:
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {rooms.map((room, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card overflow-hidden gradient-ring"
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
                  <div className="flex gap-3">
                    <motion.a
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      href="#contact"
                      className="flex-1 btn-primary text-center"
                    >
                      Book Now
                    </motion.a>
                    <motion.a
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      href="https://wa.me/919922538989?text=I%27m%20interested%20in%20the%20{room.type}%20room%20@%20Comfort%20Stay%20PG"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                    >
                      WhatsApp
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <p className="text-center mt-8 text-sm text-gray-600 dark:text-gray-300">
            All room prices include meals, electricity, water, WiFi, and
            housekeeping services.
            <br />
            <span className="font-semibold">
              Limited rooms still available in our brand new building that
              opened in July 2025!
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Rooms;
