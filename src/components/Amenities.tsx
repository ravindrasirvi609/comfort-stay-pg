"use client";

import { motion } from "framer-motion";
import {
  Wifi,
  Utensils,
  ShowerHead,
  Bed,
  Tv,
  ParkingSquare,
  Shirt,
  Shield,
  Coffee,
  Clock,
  Book,
  Scissors,
  UserCircle2,
  Package,
} from "lucide-react";

const amenities = [
  {
    icon: <Wifi size={24} />,
    title: "High-Speed WiFi",
    description: "Uninterrupted internet access throughout the premises",
  },
  {
    icon: <Utensils size={24} />,
    title: "Nutritious Meals",
    description:
      "Healthy, homely meals three times a day with customization options",
  },
  {
    icon: <ShowerHead size={24} />,
    title: "Hot Water",
    description: "24/7 hot water supply with modern bathroom facilities",
  },
  {
    icon: <Bed size={24} />,
    title: "Comfortable Beds",
    description: "Premium quality mattresses and bedding for restful sleep",
  },
  {
    icon: <Shield size={24} />,
    title: "Enhanced Security",
    description:
      "Female security guards, biometric entry, and CCTV surveillance",
  },
  {
    icon: <ParkingSquare size={24} />,
    title: "Secure Parking",
    description: "Well-lit, monitored parking space for vehicles",
  },
  {
    icon: <Shirt size={24} />,
    title: "Laundry Service",
    description: "Regular laundry with washing and drying facilities",
  },
  {
    icon: <Clock size={24} />,
    title: "Flexible Timings",
    description: "No strict curfew with late check-in and check-out facility",
  },
  {
    icon: <Tv size={24} />,
    title: "Entertainment",
    description: "Smart TV and recreational area for leisure time",
  },
  {
    icon: <Coffee size={24} />,
    title: "Lounge & Kitchen",
    description: "Fully equipped common kitchen and with self cooking facility",
  },
  {
    icon: <Book size={24} />,
    title: "Study Room",
    description: "Quiet study space with high-speed internet for work/study",
  },
  // {
  //   icon: <UserCircle2 size={24} />,
  //   title: "Beauty Corner",
  //   description: "Dedicated space with mirrors and power outlets for styling",
  // },
  // {
  //   icon: <Scissors size={24} />,
  //   title: "Salon Services",
  //   description: "Regular visiting salon services at discounted rates",
  // },
  // {
  //   icon: <Package size={24} />,
  //   title: "Package Handling",
  //   description: "Secure receipt and storage of your deliveries",
  // },
];

const Amenities = () => {
  return (
    <section id="amenities" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-effect p-8 md:p-12 rounded-lg"
        >
          <h2 className="comfort-header text-3xl font-bold mb-8 text-center">
            Our Amenities
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {amenities.map((amenity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card p-4 text-center"
              >
                <div className="mb-2 text-pink-600 dark:text-pink-400">
                  {amenity.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{amenity.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {amenity.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Amenities;
