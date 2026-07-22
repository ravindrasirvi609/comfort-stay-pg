"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Phone, Mail, MapPin, Send, Loader2, Clock } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import BlurText from "../BlurText";

export default function ContactV2() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("/api/contact-inquiries", formData);
      if (response.data.success) {
        toast.success(response.data.message);
        setFormData({ name: "", email: "", phone: "", message: "" });
      } else {
        toast.error(response.data.message || "Failed to submit inquiry");
      }
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Contact submission error:", err);
      toast.error(
        err.response?.data?.message ||
          "Failed to submit your inquiry. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <section id="contact" className="py-20 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="eyebrow mb-4 justify-center">
            <span className="w-8 h-px bg-pink-500" /> Get in touch
            <span className="w-8 h-px bg-pink-500" />
          </div>
          <BlurText
            as="h2"
            text="Say hi — we'd love to hear from you."
            className="font-display text-[clamp(2rem,3.5vw,3.25rem)] font-bold leading-[1.08] tracking-tight text-gray-900 dark:text-white mb-4"
          />
          <p className="text-gray-600 dark:text-pink-100/70">
            Have questions? Want a room tour? We usually reply within a few hours.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left — info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 flex flex-col gap-5"
          >
            <div className="rounded-3xl border border-pink-100/60 dark:border-pink-900/40 bg-white/70 dark:bg-pink-950/25 backdrop-blur-xl p-6 md:p-7 shadow-sm">
              <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-5">
                Talk to us
              </h3>
              <ul className="space-y-5 text-sm">
                <li className="flex items-start gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-md">
                    <Phone size={16} />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-widest font-bold text-pink-600 dark:text-pink-300 mb-0.5">
                      Phone
                    </p>
                    <a
                      href="tel:+919922538989"
                      className="text-gray-900 dark:text-white font-semibold hover:text-pink-600 dark:hover:text-pink-300"
                    >
                      +91 9922 538 989
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-md">
                    <Mail size={16} />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-widest font-bold text-pink-600 dark:text-pink-300 mb-0.5">
                      Email
                    </p>
                    <a
                      href="mailto:info@comfortstay.com"
                      className="text-gray-900 dark:text-white font-semibold hover:text-pink-600 dark:hover:text-pink-300"
                    >
                      info@comfortstay.com
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-md">
                    <MapPin size={16} />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-widest font-bold text-pink-600 dark:text-pink-300 mb-0.5">
                      Address
                    </p>
                    <p className="text-gray-700 dark:text-pink-100/80 leading-relaxed">
                      Hinjewadi Phase 1 Rd, Mukai Nagar,
                      <br />
                      Rajiv Gandhi Infotech Park, Pune 411057
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="rounded-3xl border border-pink-100/60 dark:border-pink-900/40 bg-gradient-to-br from-pink-50/80 to-rose-50/60 dark:from-pink-900/25 dark:to-rose-900/15 backdrop-blur-xl p-6 md:p-7 shadow-sm">
              <div className="flex items-center gap-2 text-pink-700 dark:text-pink-300 font-bold mb-2">
                <Clock size={16} /> Visiting Hours
              </div>
              <p className="text-sm text-gray-700 dark:text-pink-100/85">
                Monday – Saturday · <strong>10:00 AM – 10:00 PM</strong>
              </p>
              <p className="text-xs text-gray-500 dark:text-pink-100/60 mt-1.5">
                Residents enjoy 24/7 secure access.
              </p>
            </div>
          </motion.div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-7"
          >
            <div className="relative overflow-hidden rounded-3xl border border-pink-100/60 dark:border-pink-900/40 bg-white/85 dark:bg-pink-950/30 backdrop-blur-xl p-6 md:p-9 shadow-lg shadow-pink-500/10">
              <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-pink-200/50 blur-3xl pointer-events-none" />
              <form onSubmit={handleSubmit} className="relative space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 9xxxxxxxxx"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us what you're looking for…"
                    rows={5}
                    required
                    disabled={loading}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  size="lg"
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send size={16} />
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-500 dark:text-pink-100/60 text-center">
                  By submitting, you agree to be contacted about your enquiry.
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
