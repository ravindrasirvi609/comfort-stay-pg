"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Send } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

const VisitForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    preferredDate: "",
    preferredTime: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("/api/visit-requests", formData);

      if (response.data.success) {
        toast.success(response.data.message);
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          preferredDate: "",
          preferredTime: "",
          message: "",
        });
      } else {
        toast.error(response.data.message || "Failed to schedule visit");
      }
    } catch (error: any) {
      console.error("Visit scheduling error:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to schedule your visit. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Get today's date in YYYY-MM-DD format for min date attribute
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="card p-6 border border-pink-100 dark:border-pink-900/30 shadow-soft rounded-lg">
      <h3 className="text-xl font-bold mb-4 text-pink-600 dark:text-pink-400">
        Schedule a Visit
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="visit-name"
            className="block mb-2 text-sm font-medium"
          >
            Name
          </label>
          <input
            type="text"
            id="visit-name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="input-field"
            placeholder="Your full name"
            required
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="visit-email"
              className="block mb-2 text-sm font-medium"
            >
              Email
            </label>
            <input
              type="email"
              id="visit-email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              placeholder="Your email address"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label
              htmlFor="visit-phone"
              className="block mb-2 text-sm font-medium"
            >
              Phone
            </label>
            <input
              type="tel"
              id="visit-phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input-field"
              placeholder="Your phone number"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="visit-date"
              className="block mb-2 text-sm font-medium"
            >
              <Calendar size={16} className="inline mr-1" />
              Preferred Date
            </label>
            <input
              type="date"
              id="visit-date"
              name="preferredDate"
              value={formData.preferredDate}
              onChange={handleChange}
              className="input-field"
              min={today}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label
              htmlFor="visit-time"
              className="block mb-2 text-sm font-medium"
            >
              <Clock size={16} className="inline mr-1" />
              Preferred Time
            </label>
            <select
              id="visit-time"
              name="preferredTime"
              value={formData.preferredTime}
              onChange={handleChange}
              className="input-field"
              required
              disabled={loading}
            >
              <option value="">Select a time slot</option>
              <option value="9:00 AM - 11:00 AM">9:00 AM - 11:00 AM</option>
              <option value="11:00 AM - 1:00 PM">11:00 AM - 1:00 PM</option>
              <option value="2:00 PM - 4:00 PM">2:00 PM - 4:00 PM</option>
              <option value="4:00 PM - 6:00 PM">4:00 PM - 6:00 PM</option>
              <option value="6:00 PM - 8:00 PM">6:00 PM - 8:00 PM</option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="visit-message"
            className="block mb-2 text-sm font-medium"
          >
            Message (Optional)
          </label>
          <textarea
            id="visit-message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={3}
            className="input-field"
            placeholder="Any additional information or specific requirements"
            disabled={loading}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full bg-pink-600 hover:bg-pink-700 transition-colors text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Scheduling...</span>
            </>
          ) : (
            <>
              Schedule Visit
              <Send size={18} />
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
};

export default VisitForm;
