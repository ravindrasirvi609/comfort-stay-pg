"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import axios from "axios";
import { uploadFile } from "@/app/lib/firebase";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    idPhoto: 0,
    passportPhoto: 0,
  });

  // Refs for file inputs
  const idPhotoRef = useRef<HTMLInputElement>(null);
  const passportPhotoRef = useRef<HTMLInputElement>(null);

  // Valid ID type options
  const validIdTypes = [
    "Aadhar Card",
    "Passport",
    "Driving License",
    "Voter Card",
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
    companyNameAndAddress: "",
    passportPhoto: "",
    password: "",
    confirmPassword: "",
  });

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  // Handle file upload
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fileType: "validIdPhoto" | "passportPhoto"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setUploadProgress((prev) => ({
        ...prev,
        [fileType]: 10,
      }));

      // Set a unique path for the file
      const timestamp = Date.now();
      const path = `applicants/${fileType}/${timestamp}_${file.name}`;

      // Upload file to Firebase Storage
      setUploadProgress((prev) => ({
        ...prev,
        [fileType]: 40,
      }));

      const downloadUrl = await uploadFile(file, path);

      setUploadProgress((prev) => ({
        ...prev,
        [fileType]: 100,
      }));

      // Update form data with the download URL
      setFormData((prev) => ({
        ...prev,
        [fileType]: downloadUrl,
      }));

      setTimeout(() => {
        setUploadProgress((prev) => ({
          ...prev,
          [fileType]: 0,
        }));
      }, 1000);
    } catch (err) {
      console.error(`Error uploading ${fileType}:`, err);
      setError(
        `Failed to upload ${fileType === "validIdPhoto" ? "ID document" : "passport photo"}. Please try again.`
      );
      setUploadProgress((prev) => ({
        ...prev,
        [fileType]: 0,
      }));
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!formData.validIdPhoto) {
      setError("Please upload your ID document");
      setLoading(false);
      return;
    }

    if (!formData.passportPhoto) {
      setError("Please upload your passport size photo");
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
        mobileNumber: formData.mobileNumber,
        guardianMobileNumber: formData.guardianMobileNumber,
        validIdType: formData.validIdType,
        validIdPhoto: formData.validIdPhoto,
        companyNameAndAddress: formData.companyNameAndAddress,
        passportPhoto: formData.passportPhoto,
        password: formData.password,
      });

      if (response.data.success) {
        setSuccess(true);
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
          companyNameAndAddress: "",
          passportPhoto: "",
          password: "",
          confirmPassword: "",
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

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pink-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden relative">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-pink-300 dark:bg-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-40 w-72 h-72 bg-purple-300 dark:bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-blue-300 dark:bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-4xl w-full backdrop-blur-lg bg-white/40 dark:bg-gray-800/50 rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-2xl overflow-hidden p-8 z-10 hover:shadow-pink-200/20 dark:hover:shadow-pink-700/20 transition-all duration-300">
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
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Registration Request Submitted!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Thank you for registering with ComfortStay PG. Your request has
              been submitted for admin approval. Once approved, you will receive
              your login credentials via email.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                href="/login"
                className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-md transition-colors"
              >
                Go to Login
              </Link>
              <Link
                href="/"
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md transition-colors"
              >
                Return Home
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mb-4">
                  CS
                </div>
              </div>
              <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                Register for ComfortStay PG
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Fill in your details to request registration
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 bg-red-100/80 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl relative flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="block sm:inline text-sm">{error}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="emailAddress"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="emailAddress"
                    name="emailAddress"
                    value={formData.emailAddress}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="fathersName"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Father&apos;s Name *
                  </label>
                  <input
                    type="text"
                    id="fathersName"
                    name="fathersName"
                    value={formData.fathersName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="mobileNumber"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    id="mobileNumber"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    required
                    pattern="[0-9]{10}"
                    title="Please enter a valid 10-digit mobile number"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="guardianMobileNumber"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Guardian&apos;s Mobile Number *
                  </label>
                  <input
                    type="tel"
                    id="guardianMobileNumber"
                    name="guardianMobileNumber"
                    value={formData.guardianMobileNumber}
                    onChange={handleChange}
                    required
                    pattern="[0-9]{10}"
                    title="Please enter a valid 10-digit mobile number"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="permanentAddress"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Permanent Address *
                  </label>
                  <textarea
                    id="permanentAddress"
                    name="permanentAddress"
                    value={formData.permanentAddress}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="companyNameAndAddress"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Company/Organization Name & Address *
                  </label>
                  <textarea
                    id="companyNameAndAddress"
                    name="companyNameAndAddress"
                    value={formData.companyNameAndAddress}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    State *
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="validIdType"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Valid ID Type *
                  </label>
                  <select
                    id="validIdType"
                    name="validIdType"
                    value={formData.validIdType}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white text-sm"
                  >
                    {validIdTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="validIdPhoto"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Upload Valid ID Photo *
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      id="validIdPhoto"
                      name="validIdPhoto"
                      ref={idPhotoRef}
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload(e, "validIdPhoto")}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => idPhotoRef.current?.click()}
                      className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 text-sm"
                      disabled={loading}
                    >
                      Choose File
                    </button>
                    <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {formData.validIdPhoto
                        ? "ID Document Uploaded"
                        : "No file chosen"}
                    </span>
                  </div>
                  {uploadProgress.idPhoto > 0 &&
                    uploadProgress.idPhoto < 100 && (
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div
                          className="bg-pink-600 h-2.5 rounded-full"
                          style={{ width: `${uploadProgress.idPhoto}%` }}
                        ></div>
                      </div>
                    )}
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="passportPhoto"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Upload Passport Size Photo *
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      id="passportPhoto"
                      name="passportPhoto"
                      ref={passportPhotoRef}
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "passportPhoto")}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => passportPhotoRef.current?.click()}
                      className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 text-sm"
                      disabled={loading}
                    >
                      Choose File
                    </button>
                    <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {formData.passportPhoto
                        ? "Passport Photo Uploaded"
                        : "No file chosen"}
                    </span>
                  </div>
                  {uploadProgress.passportPhoto > 0 &&
                    uploadProgress.passportPhoto < 100 && (
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div
                          className="bg-pink-600 h-2.5 rounded-full"
                          style={{ width: `${uploadProgress.passportPhoto}%` }}
                        ></div>
                      </div>
                    )}
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Password *
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={8}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white text-sm"
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  ) : null}
                  Submit Registration Request
                </button>
              </div>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-pink-600 hover:text-pink-500 dark:text-pink-400 dark:hover:text-pink-300"
                  >
                    Login here
                  </Link>
                </p>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
