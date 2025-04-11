"use client";

import { motion } from "framer-motion";
import { Star, User } from "lucide-react";

const testimonials = [
  {
    name: "Anjali Sharma",
    role: "Software Developer",
    company: "TCS",
    rating: 5,
    comment:
      "Comfort Stay PG has been my home for the past year, and I couldn't be happier. As a woman working in IT, safety was my priority, and this place exceeds expectations with its security measures. The rooms are clean, spacious, and the staff is incredibly supportive.",
  },
  {
    name: "Neha Gupta",
    role: "Digital Marketing Specialist",
    company: "Infosys",
    rating: 5,
    comment:
      "Moving to Pune for work was challenging until I found Comfort Stay PG. The homely atmosphere, delicious food, and the community of like-minded women made the transition smooth. The location is perfect for quick commutes to Hinjewadi IT Park.",
  },
  {
    name: "Priya Desai",
    role: "MBA Student",
    company: "Symbiosis Institute",
    rating: 5,
    comment:
      "As a student, I appreciate the quiet study spaces and high-speed WiFi. The flexible timings are perfect for my schedule, and I never worry about my safety even when returning late. The community events help us connect with other residents.",
  },
  {
    name: "Sanjana Patel",
    role: "UI/UX Designer",
    company: "Wipro",
    rating: 4,
    comment:
      "The amenities at Comfort Stay PG are thoughtfully designed for working women. I love the beauty corner and the lounge area where I can relax after work. The twin-sharing room is spacious and gives enough privacy.",
  },
  {
    name: "Riya Mehta",
    role: "HR Executive",
    company: "Tech Mahindra",
    rating: 5,
    comment:
      "After trying several PGs in Pune, I can confidently say Comfort Stay is the best. The cleanliness, nutritious meals, and the warm staff make it feel like home. The management is responsive to feedback and constantly improving.",
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-effect p-8 md:p-12 rounded-lg"
        >
          <h2 className="comfort-header text-3xl font-bold mb-8 text-center">
            What Our Residents Say
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center border-2 border-pink-300 dark:border-pink-700">
                    <User
                      size={24}
                      className="text-pink-500 dark:text-pink-400"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-pink-700 dark:text-pink-300">
                      {testimonial.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {testimonial.role}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {testimonial.company}
                    </p>
                  </div>
                </div>

                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="text-pink-500 fill-pink-500"
                      size={16}
                    />
                  ))}
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  &ldquo;{testimonial.comment}&rdquo;
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
