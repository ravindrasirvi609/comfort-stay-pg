"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function RulesAndRegulations() {
  // Animation variants for staggered animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Rules categories with their specific rules
  const ruleCategories = [
    {
      id: "general",
      title: "General Rules",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      ),
      rules: [
        "No Outside Visitors Without Permission: Residents must get prior approval from the PG owner before bringing any guest. Overnight stays require permission and incur extra charges.",
        "Meals Only in the Dining Area: Meals are not permitted inside the rooms. All residents are requested to have their meals at the dining table only to maintain cleanliness and hygiene.",
        "Maintain Cleanliness: Residents are responsible for keeping their rooms and common areas clean. Any damage or mess caused will need to be cleaned or compensated for.",
        "Noise Control: Please avoid playing loud music or causing disturbances to fellow residents. Maintain a peaceful environment, especially during rest hours.",
        "Avoid Gathering Near the Main Gate: Residents should not stand or gather with others in front of the main gate. It is important to maintain discipline and not cause inconvenience to neighbors or security.",
      ],
    },
    {
      id: "visitors",
      title: "Visitors Policy",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      rules: [
        "No outside visitors without prior approval from the PG owner.",
        "All visitors must be registered at the reception/security desk.",
        "Overnight stays require special permission and additional charges.",
        "Residents are responsible for their visitors' behavior.",
        "Management reserves the right to deny entry to any visitor.",
      ],
    },
    {
      id: "safety",
      title: "Safety & Security",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      rules: [
        "Security & Safety: Always keep your belongings safe. The PG management will not be responsible for any personal loss or theft. Lock your room when not in use.",
        "Prohibited Items: Smoking, alcohol consumption, and any kind of narcotics are strictly prohibited within the PG premises.",
        "Report Issues Promptly: Any maintenance or facility-related issues should be reported to the management immediately for timely resolution.",
        "Do Not Use or Place Items on Vacant Beds: Residents must not place their belongings or themselves on vacant beds, even if they appear unused. Every bed is reserved and must remain clean and ready for new occupants.",
        "Respect & Behaviour: All residents are expected to behave respectfully with fellow roommates, staff, and management. Any misconduct may lead to termination of stay.",
      ],
    },
    {
      id: "facilities",
      title: "Facilities Usage",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
      ),
      rules: [
        "Switch Off Electrical Appliances: Please ensure all electrical appliances, lights, and fans are turned off when not in use to conserve energy and avoid hazards.",
        "Electrical Appliances: Usage of personal electrical appliances like heaters, induction cooktops, or high-voltage devices is not allowed without prior approval from the management.",
        "Laundry & Drying Clothes: Use the designated laundry and drying areas. Hanging clothes in balconies or common areas is not permitted.",
        "Do Not Waste Water: Use water responsibly. Unnecessary wastage in bathrooms, wash areas, or while doing laundry is discouraged.",
        "Report any damages or malfunctions to management immediately.",
      ],
    },
    {
      id: "payments",
      title: "Payment Rules",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      rules: [
        "Monthly rent must be paid by the 5th of each month.",
        "Security deposit is equal to one month's rent and is refundable after deducting for damages, if any.",
        "Late payments will incur a penalty of 5% per week.",
        "Payment can be made through online transfer, UPI, or at the reception.",
        "Receipts will be provided for all payments.",
      ],
    },
    {
      id: "checkout",
      title: "Check-out Procedure",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      ),
      rules: [
        "Notice period of 30 days must be given before vacating the room.",
        "Room must be handed over in the same condition as it was allotted.",
        "All personal belongings must be removed during checkout.",
        "Security deposit will be refunded within 15 days after deducting for damages, if any.",
        "Complete the exit survey form for feedback.",
      ],
    },
  ];

  return (
    <div className="min-h-screen pb-16 pt-24 bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero section with animated intro */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-4">
            Rules & Regulations
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            For a harmonious and safe living environment, all residents are
            required to adhere to the following rules and regulations. By
            accepting accommodation at ComfortStay PG, you agree to comply with
            these guidelines.
          </p>
        </motion.div>

        {/* Rules sections with accordion style */}
        <motion.div
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {ruleCategories.map((category) => (
            <motion.div
              key={category.id}
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <details className="group">
                <summary className="flex items-center justify-between p-6 text-lg font-semibold cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400">
                      {category.icon}
                    </div>
                    <span>{category.title}</span>
                  </div>
                  <span className="transition group-open:rotate-180">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-700 dark:text-gray-300">
                  <ul className="list-disc pl-5 space-y-2">
                    {category.rules.map((rule, index) => (
                      <li key={index} className="py-1">
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              </details>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional notices section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-12 bg-gradient-to-r from-pink-100/80 to-purple-100/80 dark:from-pink-900/20 dark:to-purple-900/20 backdrop-blur-sm rounded-xl p-6 border border-pink-200/50 dark:border-pink-800/30 text-center"
        >
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Important Notice
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            Management reserves the right to modify these rules and regulations
            as necessary. Residents will be notified of any changes. Violation
            of these rules may result in termination of residency.
          </p>

          <div className="mt-8">
            <Link
              href="/register"
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-pink-500/25 font-medium text-sm"
            >
              Return to Registration
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
