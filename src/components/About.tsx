"use client";

import { motion } from "framer-motion";
import { Home, Users, Shield, Heart, Flower, Clock } from "lucide-react";

const features = [
  {
    icon: <Home size={24} />,
    title: "Comfortable Living",
    description:
      "Stylish, spacious rooms designed specifically for women's comfort and privacy.",
  },
  {
    icon: <Shield size={24} />,
    title: "Enhanced Security",
    description:
      "Dedicated 24/7 security with biometric entry and CCTV surveillance.",
  },
  {
    icon: <Users size={24} />,
    title: "Women's Community",
    description:
      "Safe, supportive community exclusively for working women and students.",
  },
  {
    icon: <Clock size={24} />,
    title: "Flexible Timings",
    description: "No strict curfews with secure access system for residents.",
  },
  {
    icon: <Flower size={24} />,
    title: "Clean Environment",
    description: "Regular housekeeping and well-maintained common areas.",
  },
  {
    icon: <Heart size={24} />,
    title: "Homely Atmosphere",
    description: "Caring staff and amenities that make you feel at home.",
  },
];

const About = () => {
  return (
    <section id="about" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-effect p-8 md:p-12 rounded-lg"
        >
          <h2 className="comfort-header text-3xl font-bold mb-8 text-center">
            About Comfort Stay PG
          </h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-lg mb-6">
                Welcome to{" "}
                <span className="font-semibold text-pink-600 dark:text-pink-400">
                  Comfort Stay PG
                </span>
                , an exclusive girls&apos; paying guest accommodation in the
                heart of Hinjewadi, Pune. We offer a perfect blend of comfort,
                security, and modern amenities designed specifically for working
                women and female students.
              </p>
              <p className="text-lg mb-6">
                Strategically located near Hinjewadi IT Park and major
                educational institutions, our PG provides convenient and safe
                accommodation with easy access to workplaces, shopping centers,
                and entertainment venues.
              </p>
              <p className="text-lg">
                Experience a nurturing, homelike environment with our dedicated
                staff, thoughtfully designed spaces, and a vibrant community of
                like-minded women who prioritize their career growth and
                personal well-being.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="card p-4 text-center"
                >
                  <div className="mb-2 text-pink-600 dark:text-pink-400">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
