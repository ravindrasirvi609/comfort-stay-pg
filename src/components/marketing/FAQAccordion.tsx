"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import BlurText from "../BlurText";
import { motion } from "framer-motion";

const faqs = [
  {
    q: "Who can stay at Comfort Stay PG?",
    a: "Comfort Stay PG is exclusively for working women and female students. We welcome residents from all backgrounds, working in Hinjawadi IT Park or studying nearby.",
  },
  {
    q: "What are your room options and pricing?",
    a: "We offer twin-sharing (2 girls, ₹10,000/month) and triple-sharing (3 girls, ₹8,500/month). Both include meals, WiFi, electricity, water, and housekeeping.",
  },
  {
    q: "What is included in the monthly rent?",
    a: "Rent is all-inclusive — 3 meals a day, high-speed WiFi, electricity, water, housekeeping, laundry facility, and 24/7 security.",
  },
  {
    q: "Is there a curfew?",
    a: "No strict curfew. Residents get a secure access system for flexible late check-ins while maintaining safety.",
  },
  {
    q: "How is security managed?",
    a: "24/7 CCTV surveillance throughout the property, dedicated security guards, and a secure entry system for residents only.",
  },
  {
    q: "Do you offer visits or trial stays?",
    a: "Yes — you can visit us between 10 AM and 10 PM (Mon–Sat). Reach out via phone or WhatsApp to schedule a tour.",
  },
  {
    q: "How close are you to Hinjawadi IT Park?",
    a: "We are a 5-minute walk from Hinjawadi Phase 1 IT Park — ideal for anyone working nearby.",
  },
];

export default function FAQAccordion() {
  return (
    <section id="faqs" className="py-20 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="eyebrow mb-4 justify-center">
            <span className="w-8 h-px bg-pink-500" /> FAQs
            <span className="w-8 h-px bg-pink-500" />
          </div>
          <BlurText
            as="h2"
            text="Questions? We've got answers."
            className="font-display text-[clamp(2rem,3.5vw,3.25rem)] font-bold leading-[1.08] tracking-tight text-gray-900 dark:text-white mb-4"
          />
          <p className="text-gray-600 dark:text-pink-100/70">
            Everything you need to know before you move in.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger>{f.q}</AccordionTrigger>
                <AccordionContent>{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}

export { faqs };
