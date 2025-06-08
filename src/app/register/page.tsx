"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import ImageUpload from "../components/ImageUpload";
import useAuth from "../../hooks/useAuth";

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  // Valid ID type options
  const validIdTypes = [
    "Aadhar Card",
    "Passport",
    "Driving License",
    "Voter Card",
  ];

  // Indian states
  const indianStates = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry",
  ];

  // Form fields
  const [formData, setFormData] = useState({
    fullName: "",
    emailAddress: "",
    fathersName: "",
    permanentAddress: "",
    city: "",
    state: "",
    mobileNumber: "",
    guardianMobileNumber: "",
    validIdType: validIdTypes[0],
    validIdPhoto: "",
    companyName: "",
    companyAddress: "",
    employeeId: "",
    profileImage: "",
    agreeToTerms: false, // Added field for rules agreement
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if user is already logged in
  useEffect(() => {
    if (mounted && !authLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [mounted, authLoading, isAuthenticated, router]);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
    setError("");
  };

  // Handle cloudinary image upload
  const handleImageUploaded = (
    type: "validIdPhoto" | "profileImage",
    url: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [type]: url,
    }));
  };

  // Navigation between steps
  const nextStep = () => {
    if (currentStep === 1) {
      // Validate personal information
      if (
        !formData.fullName ||
        !formData.emailAddress ||
        !formData.fathersName ||
        !formData.mobileNumber ||
        !formData.guardianMobileNumber ||
        !formData.permanentAddress ||
        !formData.city ||
        !formData.state
      ) {
        setError("Please fill all required fields in personal information");
        return;
      }

      // Validate mobile number format
      const mobileRegex = /^\d{10}$/;
      if (!mobileRegex.test(formData.mobileNumber)) {
        setError("Please enter a valid 10-digit mobile number");
        return;
      }
      if (!mobileRegex.test(formData.guardianMobileNumber)) {
        setError("Please enter a valid 10-digit guardian mobile number");
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.emailAddress)) {
        setError("Please enter a valid email address");
        return;
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    setError("");
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError("");
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.validIdPhoto) {
      setError("Please upload your ID document");
      setLoading(false);
      return;
    }

    if (!formData.profileImage) {
      setError("Please upload your passport size photo");
      setLoading(false);
      return;
    }

    if (!formData.agreeToTerms) {
      setError("You must agree to the rules and regulations to proceed");
      setLoading(false);
      return;
    }

    if (
      !formData.companyName ||
      !formData.companyAddress ||
      !formData.employeeId
    ) {
      setError("Please fill in all company details including Employee ID");
      setLoading(false);
      return;
    }

    try {
      // Submit registration request
      const response = await axios.post("/api/auth/register-request", {
        fullName: formData.fullName,
        emailAddress: formData.emailAddress,
        fathersName: formData.fathersName,
        permanentAddress: formData.permanentAddress,
        city: formData.city,
        state: formData.state,
        mobileNumber: `+91${formData.mobileNumber}`,
        guardianMobileNumber: `+91${formData.guardianMobileNumber}`,
        validIdType: formData.validIdType,
        validIdPhoto: formData.validIdPhoto,
        companyName: formData.companyName,
        companyAddress: formData.companyAddress,
        employeeId: formData.employeeId,
        profileImage: formData.profileImage,
        agreeToTerms: formData.agreeToTerms,
      });

      if (response.data.success) {
        setSuccess(true);
        window.scrollTo(0, 0);
        // Clear form data
        setFormData({
          fullName: "",
          emailAddress: "",
          fathersName: "",
          permanentAddress: "",
          city: "",
          state: "",
          mobileNumber: "",
          guardianMobileNumber: "",
          validIdType: validIdTypes[0],
          validIdPhoto: "",
          companyName: "",
          companyAddress: "",
          employeeId: "",
          profileImage: "",
          agreeToTerms: false,
        });
      } else {
        setError(response.data.message || "Registration request failed");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("Registration error:", err.response?.data);
        if (err.response?.data?.message?.includes("MongoDB")) {
          setError(
            "We're experiencing database connection issues. Please try again later or contact support."
          );
        } else {
          setError(
            err.response?.data?.message ||
              "An error occurred during registration request"
          );
        }
      } else {
        console.error("Unexpected error during registration:", err);
        setError("An unexpected error occurred during registration request");
      }
    } finally {
      setLoading(false);
    }
  };

  // If still loading auth state or component not mounted yet, show loading or nothing
  if (!mounted || authLoading) {
    return null;
  }

  // If user is already authenticated, we'll redirect in the useEffect
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pink-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center py-6 px-2 sm:p-4 md:p-6 lg:p-8 overflow-hidden relative">
      {/* Background decorative elements - optimized for different screen sizes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-10 sm:top-20 left-5 sm:left-20 w-32 sm:w-64 h-32 sm:h-64 bg-pink-300 dark:bg-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-20 sm:top-40 right-10 sm:right-40 w-40 sm:w-72 h-40 sm:h-72 bg-purple-300 dark:bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-10 sm:bottom-20 left-1/4 w-48 sm:w-80 h-48 sm:h-80 bg-blue-300 dark:bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-4xl w-full backdrop-blur-lg bg-white/40 dark:bg-gray-800/50 rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-2xl overflow-hidden p-4 sm:p-6 md:p-8 z-10 hover:shadow-pink-200/20 dark:hover:shadow-pink-700/20 transition-all duration-300">
        {success ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Registration Request Submitted!
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-6">
              Thank you for registering with ComfortStay PG. Your request has
              been submitted for admin approval. Once approved, you will receive
              your login credentials via email.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:space-x-4">
              <Link
                href="/login"
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-pink-500/25 font-medium text-sm sm:text-base"
              >
                Go to Login
              </Link>
              <Link
                href="/"
                className="px-6 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 transition-all duration-300 font-medium text-sm sm:text-base"
              >
                Back to Home
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-6 sm:mb-8">
              <div className="flex justify-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
                  CS
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                New Resident Registration
              </h2>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Create your account to request residence at ComfortStay PG
              </p>
            </div>

            {/* Progress bar - now more responsive for mobile */}
            <div className="mb-6 sm:mb-8">
              <div className="flex justify-between mb-2">
                {Array.from({ length: totalSteps }).map((_, index) => (
                  <div
                    key={index}
                    className={`flex flex-col items-center ${
                      index + 1 === currentStep
                        ? "text-pink-600 dark:text-pink-400"
                        : index + 1 < currentStep
                          ? "text-green-500 dark:text-green-400"
                          : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-1 ${
                        index + 1 === currentStep
                          ? "bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-400 border-2 border-pink-500"
                          : index + 1 < currentStep
                            ? "bg-green-100 dark:bg-green-900 text-green-500 dark:text-green-400"
                            : "bg-gray-100 dark:bg-gray-800"
                      }`}
                    >
                      {index + 1 < currentStep ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 sm:h-6 sm:w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className="text-[10px] sm:text-xs font-medium">
                      {index === 0 ? "Personal Info" : "Identity"}
                    </span>
                  </div>
                ))}
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-in-out"
                  style={{
                    width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Error message - optimized for mobile */}
            {error && (
              <div
                className="mb-4 sm:mb-6 bg-red-100/80 dark:bg-red-900/30 backdrop-blur-sm border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 px-3 sm:px-4 py-2 sm:py-3 rounded-xl relative flex items-center"
                role="alert"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="block text-xs sm:text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
                      <div className="relative bg-white/60 dark:bg-gray-900/60 rounded-lg p-1">
                        <label
                          htmlFor="fullName"
                          className="block text-xs font-medium text-gray-700 dark:text-gray-300 pl-3 pt-1"
                        >
                          Full Name *
                        </label>
                        <input
                          id="fullName"
                          name="fullName"
                          type="text"
                          required
                          className="block w-full pl-3 pr-10 py-2.5 bg-transparent border-0 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-0 sm:text-sm"
                          placeholder="Enter your full name"
                          value={formData.fullName}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
                      <div className="relative bg-white/60 dark:bg-gray-900/60 rounded-lg p-1">
                        <label
                          htmlFor="emailAddress"
                          className="block text-xs font-medium text-gray-700 dark:text-gray-300 pl-3 pt-1"
                        >
                          Email Address *
                        </label>
                        <input
                          id="emailAddress"
                          name="emailAddress"
                          type="email"
                          required
                          className="block w-full pl-3 pr-10 py-2.5 bg-transparent border-0 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-0 sm:text-sm"
                          placeholder="Enter your email address"
                          value={formData.emailAddress}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
                      <div className="relative bg-white/60 dark:bg-gray-900/60 rounded-lg p-1">
                        <label
                          htmlFor="fathersName"
                          className="block text-xs font-medium text-gray-700 dark:text-gray-300 pl-3 pt-1"
                        >
                          Father&apos;s Name *
                        </label>
                        <input
                          id="fathersName"
                          name="fathersName"
                          type="text"
                          className="block w-full pl-3 pr-10 py-2.5 bg-transparent border-0 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-0 sm:text-sm"
                          placeholder="Enter your father's name"
                          value={formData.fathersName}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
                      <div className="relative bg-white/60 dark:bg-gray-900/60 rounded-lg p-1">
                        <label
                          htmlFor="mobileNumber"
                          className="block text-xs font-medium text-gray-700 dark:text-gray-300 pl-3 pt-1"
                        >
                          Mobile Number *
                        </label>
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-3 text-gray-700 dark:text-gray-300">
                            +91
                          </span>
                          <input
                            id="mobileNumber"
                            name="mobileNumber"
                            type="tel"
                            required
                            className="block w-full flex-1 pl-1 pr-10 py-2.5 bg-transparent border-0 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-0 sm:text-sm"
                            placeholder="Enter your 10-digit number"
                            pattern="\d{10}"
                            value={formData.mobileNumber}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
                      <div className="relative bg-white/60 dark:bg-gray-900/60 rounded-lg p-1">
                        <label
                          htmlFor="guardianMobileNumber"
                          className="block text-xs font-medium text-gray-700 dark:text-gray-300 pl-3 pt-1"
                        >
                          Guardian Mobile Number *
                        </label>
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-3 text-gray-700 dark:text-gray-300">
                            +91
                          </span>
                          <input
                            id="guardianMobileNumber"
                            name="guardianMobileNumber"
                            type="tel"
                            required
                            className="block w-full flex-1 pl-1 pr-10 py-2.5 bg-transparent border-0 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-0 sm:text-sm"
                            placeholder="Enter guardian's 10-digit number"
                            pattern="\d{10}"
                            value={formData.guardianMobileNumber}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="relative group md:col-span-2">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
                      <div className="relative bg-white/60 dark:bg-gray-900/60 rounded-lg p-1">
                        <label
                          htmlFor="permanentAddress"
                          className="block text-xs font-medium text-gray-700 dark:text-gray-300 pl-3 pt-1"
                        >
                          Permanent Address *
                        </label>
                        <textarea
                          id="permanentAddress"
                          name="permanentAddress"
                          rows={3}
                          className="block w-full pl-3 pr-10 py-2.5 bg-transparent border-0 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-0 sm:text-sm"
                          placeholder="Enter your permanent address"
                          value={formData.permanentAddress}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
                      <div className="relative bg-white/60 dark:bg-gray-900/60 rounded-lg p-1">
                        <label
                          htmlFor="city"
                          className="block text-xs font-medium text-gray-700 dark:text-gray-300 pl-3 pt-1"
                        >
                          City *
                        </label>
                        <input
                          id="city"
                          name="city"
                          type="text"
                          className="block w-full pl-3 pr-10 py-2.5 bg-transparent border-0 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-0 sm:text-sm"
                          placeholder="Enter your city"
                          value={formData.city}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
                      <div className="relative bg-white/60 dark:bg-gray-900/60 rounded-lg p-1">
                        <label
                          htmlFor="state"
                          className="block text-xs font-medium text-gray-700 dark:text-gray-300 pl-3 pt-1"
                        >
                          State *
                        </label>
                        <select
                          id="state"
                          name="state"
                          required
                          className="block w-full pl-3 pr-10 py-2.5 bg-transparent border-0 text-gray-900 dark:text-white focus:outline-none focus:ring-0 sm:text-sm"
                          value={formData.state}
                          onChange={handleChange}
                        >
                          <option value="">Select State</option>
                          {indianStates.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Identity Verification */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
                      <div className="relative bg-white/60 dark:bg-gray-900/60 rounded-lg p-1">
                        <label
                          htmlFor="validIdType"
                          className="block text-xs font-medium text-gray-700 dark:text-gray-300 pl-3 pt-1"
                        >
                          Valid ID Type *
                        </label>
                        <select
                          id="validIdType"
                          name="validIdType"
                          required
                          className="block w-full pl-3 pr-10 py-2.5 bg-transparent border-0 text-gray-900 dark:text-white focus:outline-none focus:ring-0 sm:text-sm"
                          value={formData.validIdType}
                          onChange={handleChange}
                        >
                          {validIdTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
                      <div className="relative bg-white/60 dark:bg-gray-900/60 rounded-lg p-1">
                        <label
                          htmlFor="companyName"
                          className="block text-xs font-medium text-gray-700 dark:text-gray-300 pl-3 pt-1"
                        >
                          Company Name *
                        </label>
                        <input
                          id="companyName"
                          name="companyName"
                          type="text"
                          required
                          className="block w-full pl-3 pr-10 py-2.5 bg-transparent border-0 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-0 sm:text-sm"
                          placeholder="Enter your company name"
                          value={formData.companyName}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
                      <div className="relative bg-white/60 dark:bg-gray-900/60 rounded-lg p-1">
                        <label
                          htmlFor="employeeId"
                          className="block text-xs font-medium text-gray-700 dark:text-gray-300 pl-3 pt-1"
                        >
                          Employee ID *
                        </label>
                        <input
                          id="employeeId"
                          name="employeeId"
                          type="text"
                          required
                          className="block w-full pl-3 pr-10 py-2.5 bg-transparent border-0 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-0 sm:text-sm"
                          placeholder="Enter your employee ID"
                          value={formData.employeeId}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="relative group md:col-span-2">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
                      <div className="relative bg-white/60 dark:bg-gray-900/60 rounded-lg p-1">
                        <label
                          htmlFor="companyAddress"
                          className="block text-xs font-medium text-gray-700 dark:text-gray-300 pl-3 pt-1"
                        >
                          Company Address *
                        </label>
                        <textarea
                          id="companyAddress"
                          name="companyAddress"
                          rows={2}
                          required
                          className="block w-full pl-3 pr-10 py-2.5 bg-transparent border-0 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-0 sm:text-sm"
                          placeholder="Enter your company address"
                          value={formData.companyAddress}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ID Document Upload *
                      </label>
                      <div className="bg-white/30 dark:bg-gray-800/30 rounded-xl p-3 sm:p-4 backdrop-blur-sm">
                        <ImageUpload
                          onImageUploaded={(url) =>
                            handleImageUploaded("validIdPhoto", url)
                          }
                          folder="applicants/id_documents"
                          maxSizeMB={5}
                          className={`${formData.validIdPhoto ? "border-green-500" : ""} max-w-full h-auto`}
                        />
                        {formData.validIdPhoto && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            ID document uploaded successfully
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Passport Size Photo *
                      </label>
                      <div className="bg-white/30 dark:bg-gray-800/30 rounded-xl p-3 sm:p-4 backdrop-blur-sm">
                        <ImageUpload
                          onImageUploaded={(url) =>
                            handleImageUploaded("profileImage", url)
                          }
                          folder="applicants/profile"
                          maxSizeMB={2}
                          className={`${formData.profileImage ? "border-green-500" : ""} max-w-full h-auto`}
                        />
                        {formData.profileImage && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Passport photo uploaded successfully
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Terms and Conditions Checkbox */}
              {currentStep === 2 && (
                <div className="mt-8">
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
                    <div className="relative bg-white/60 dark:bg-gray-900/60 rounded-lg p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <input
                            type="checkbox"
                            id="agreeToTerms"
                            name="agreeToTerms"
                            checked={formData.agreeToTerms}
                            onChange={handleChange}
                            className="h-5 w-5 text-purple-500 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="agreeToTerms"
                            className="block text-sm text-gray-800 dark:text-gray-200 font-medium cursor-pointer"
                          >
                            I agree to the{" "}
                            <Link
                              href="/rules-regulations"
                              target="_blank"
                              className="text-pink-600 dark:text-pink-400 hover:text-pink-500 dark:hover:text-pink-300 font-semibold underline"
                            >
                              Rules and Regulations
                            </Link>{" "}
                            of ComfortStay PG *
                          </label>
                          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                            By checking this box, you confirm that you have
                            read, understood, and agree to abide by all the
                            rules and policies of our facility.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Add information notice for step 2 */}
              {currentStep === 2 && (
                <div className="bg-blue-100/70 dark:bg-blue-900/30 backdrop-blur-sm border border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-300 p-4 rounded-xl mt-6 max-w-md mx-auto">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm">
                        Your registration will be reviewed by the admin before
                        approval. Once approved, you&apos;ll receive your login
                        credentials via email with the password automatically
                        generated.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation buttons - improved for mobile */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 mt-8">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-5 py-2.5 sm:px-6 sm:py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 transition-all duration-300 font-medium flex items-center justify-center sm:justify-start text-sm"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Previous
                  </button>
                ) : (
                  <div></div>
                )}

                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-pink-500/25 font-medium flex items-center justify-center sm:justify-start text-sm"
                  >
                    Next
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 sm:h-5 sm:w-5 ml-1 sm:ml-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-5 py-2.5 sm:px-6 sm:py-3 w-full sm:w-auto bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-pink-500/25 font-medium flex items-center justify-center text-sm ${
                      loading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        Submit Registration
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 sm:h-5 sm:w-5 ml-1 sm:ml-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-pink-600 dark:text-pink-400 hover:text-pink-500 dark:hover:text-pink-300"
                >
                  Login here
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
