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
      "I'm excited about Comfort Stay PG opening in 2025. As a woman working in IT, safety is my priority, and this place promises excellent security measures. Looking forward to the clean, spacious rooms and supportive staff they're planning.",
  },
  {
    name: "Neha Gupta",
    role: "Digital Marketing Specialist",
    company: "Infosys",
    rating: 5,
    comment:
      "Moving to Pune for work will be easier with Comfort Stay PG. I'm looking forward to the homely atmosphere, wholesome food, and community of like-minded women. The location seems perfect for quick commutes to Hinjewadi IT Park.",
  },
  {
    name: "Priya Desai",
    role: "MBA Student",
    company: "Symbiosis Institute",
    rating: 5,
    comment:
      "As a student, I'm eager to use the quiet study spaces and high-speed WiFi they're planning. The flexible timings will be perfect for my schedule, and I won't have to worry about safety when returning late. Can't wait for the community events!",
  },
  {
    name: "Sanjana Patel",
    role: "UI/UX Designer",
    company: "Wipro",
    rating: 4,
    comment:
      "The amenities at Comfort Stay PG seem thoughtfully designed for working women. I'm excited about the beauty corner and lounge area where I'll be able to relax after work. The twin-sharing room layouts look spacious with good privacy.",
  },
  {
    name: "Riya Mehta",
    role: "HR Executive",
    company: "Tech Mahindra",
    rating: 5,
    comment:
      "After researching several PGs in Pune, Comfort Stay's plans look the most promising. Their focus on cleanliness, nutritious meals, and attentive staff makes it seem like a real home. I'm impressed by their responsiveness to queries about the new facility.",
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
            What Our Future Residents Can Expect
          </h2>

          <div className="text-center mb-8 text-gray-700 dark:text-gray-300">
            <p>
              See what residents are looking forward to at our new PG opening in
              March 2025. Pre-book now to experience these benefits!
            </p>
          </div>

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
                      Prospective Resident
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
