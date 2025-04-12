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
      "I moved into Comfort Stay PG when it opened in February 2025. As a woman working in IT, safety was my priority, and this place has excellent security measures. The rooms are clean, spacious, and the staff is incredibly supportive.",
  },
  {
    name: "Neha Gupta",
    role: "Digital Marketing Specialist",
    company: "Infosys",
    rating: 5,
    comment:
      "Moving to Pune for work was made easy with Comfort Stay PG. Since they opened in February, I've enjoyed the homely atmosphere, wholesome food, and community of like-minded women. The location is perfect for quick commutes to Hinjewadi IT Park.",
  },
  {
    name: "Priya Desai",
    role: "MBA Student",
    company: "Symbiosis Institute",
    rating: 5,
    comment:
      "As a student, I love the quiet study spaces and high-speed WiFi. The flexible timings are perfect for my schedule, and I never worry about safety when returning late. The community events have already helped me connect with other residents since moving in February.",
  },
  {
    name: "Sanjana Patel",
    role: "UI/UX Designer",
    company: "Wipro",
    rating: 4,
    comment:
      "The amenities at Comfort Stay PG are thoughtfully designed for working women. I enjoy the beauty corner and lounge area where I can relax after work. My twin-sharing room is spacious and gives enough privacy. Glad I moved in shortly after they opened.",
  },
  {
    name: "Riya Mehta",
    role: "HR Executive",
    company: "Tech Mahindra",
    rating: 5,
    comment:
      "After researching several PGs in Pune, I can confirm Comfort Stay is the best choice I made. The cleanliness, nutritious meals, and attentive staff make it feel like home. In just two months since they opened, the management has been very responsive to feedback.",
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

          <div className="text-center mb-8 text-gray-700 dark:text-gray-300">
            <p>
              Hear from our residents who have been with us since our opening in
              February 2025. Experience these benefits by joining our community!
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
                      Current Resident
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
