"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiSave, FiRefreshCw, FiInfo } from "react-icons/fi";
import {
  RiSettings4Line,
  RiUserSettingsLine,
  RiBuilding4Line,
  RiMailSettingsLine,
  RiNotification4Line,
} from "react-icons/ri";
import { FaSpinner } from "react-icons/fa";

interface PGDetails {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactEmail: string;
  contactPhone: string;
  description: string;
  rules: string[];
  features: {
    wifi: boolean;
    food: boolean;
    laundry: boolean;
    cleaning: boolean;
    parking: boolean;
    security: boolean;
  };
  paymentDetails: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    upiId: string;
  };
  notificationSettings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    paymentReminders: boolean;
    maintenanceAlerts: boolean;
  };
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [pgDetails, setPgDetails] = useState<PGDetails>({
    name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    contactEmail: "",
    contactPhone: "9922538989",
    description: "",
    rules: [""],
    features: {
      wifi: false,
      food: false,
      laundry: false,
      cleaning: false,
      parking: false,
      security: false,
    },
    paymentDetails: {
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      upiId: "",
    },
    notificationSettings: {
      emailNotifications: true,
      smsNotifications: true,
      paymentReminders: true,
      maintenanceAlerts: true,
    },
  });

  useEffect(() => {
    fetchPGDetails();
  }, []);

  const fetchPGDetails = async () => {
    try {
      setLoading(true);
      // Replace with your actual API endpoint
      const response = await axios.get("/api/pg-details");
      if (response.data.success) {
        setPgDetails(response.data.pgDetails);
      }
    } catch (error) {
      console.error("Error fetching PG details:", error);
      setErrorMessage("Failed to load PG details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      // Replace with your actual API endpoint
      const response = await axios.post("/api/pg-details", { pgDetails });

      if (response.data.success) {
        setSuccessMessage("Settings saved successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setErrorMessage("Failed to save settings. Please try again.");
      }
    } catch (error) {
      console.error("Error saving PG details:", error);
      setErrorMessage("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPgDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFeatureToggle = (feature: string) => {
    setPgDetails((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: !prev.features[feature as keyof typeof prev.features],
      },
    }));
  };

  const handleNotificationToggle = (setting: string) => {
    setPgDetails((prev) => ({
      ...prev,
      notificationSettings: {
        ...prev.notificationSettings,
        [setting]:
          !prev.notificationSettings[
            setting as keyof typeof prev.notificationSettings
          ],
      },
    }));
  };

  const handlePaymentDetailsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setPgDetails((prev) => ({
      ...prev,
      paymentDetails: {
        ...prev.paymentDetails,
        [name]: value,
      },
    }));
  };

  const handleAddRule = () => {
    setPgDetails((prev) => ({
      ...prev,
      rules: [...prev.rules, ""],
    }));
  };

  const handleRuleChange = (index: number, value: string) => {
    const updatedRules = [...pgDetails.rules];
    updatedRules[index] = value;
    setPgDetails((prev) => ({
      ...prev,
      rules: updatedRules,
    }));
  };

  const handleRemoveRule = (index: number) => {
    const updatedRules = [...pgDetails.rules];
    updatedRules.splice(index, 1);
    setPgDetails((prev) => ({
      ...prev,
      rules: updatedRules,
    }));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your PG details and configurations
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0">
          <button
            onClick={fetchPGDetails}
            className="inline-flex items-center rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-700"
          >
            <FiRefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-75"
          >
            {saving ? (
              <FiRefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FiSave className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-4 rounded-md bg-green-50 p-4 dark:bg-green-900/30">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiInfo className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                {successMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/30">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiInfo className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                {errorMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <FaSpinner className="animate-spin text-4xl text-pink-600" />
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
            <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
              <li className="mr-2">
                <button
                  onClick={() => setActiveTab("details")}
                  className={`inline-flex items-center p-4 border-b-2 rounded-t-lg ${
                    activeTab === "details"
                      ? "text-pink-600 border-pink-600 dark:text-pink-500 dark:border-pink-500"
                      : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                  }`}
                >
                  <RiBuilding4Line className="mr-2 h-5 w-5" />
                  PG Details
                </button>
              </li>
              <li className="mr-2">
                <button
                  onClick={() => setActiveTab("features")}
                  className={`inline-flex items-center p-4 border-b-2 rounded-t-lg ${
                    activeTab === "features"
                      ? "text-pink-600 border-pink-600 dark:text-pink-500 dark:border-pink-500"
                      : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                  }`}
                >
                  <RiSettings4Line className="mr-2 h-5 w-5" />
                  Features & Rules
                </button>
              </li>
              <li className="mr-2">
                <button
                  onClick={() => setActiveTab("payment")}
                  className={`inline-flex items-center p-4 border-b-2 rounded-t-lg ${
                    activeTab === "payment"
                      ? "text-pink-600 border-pink-600 dark:text-pink-500 dark:border-pink-500"
                      : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                  }`}
                >
                  <RiUserSettingsLine className="mr-2 h-5 w-5" />
                  Payment Settings
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`inline-flex items-center p-4 border-b-2 rounded-t-lg ${
                    activeTab === "notifications"
                      ? "text-pink-600 border-pink-600 dark:text-pink-500 dark:border-pink-500"
                      : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                  }`}
                >
                  <RiNotification4Line className="mr-2 h-5 w-5" />
                  Notifications
                </button>
              </li>
            </ul>
          </div>

          {/* Content Sections */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            {/* PG Details Section */}
            {activeTab === "details" && (
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      PG Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={pgDetails.name}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contactEmail"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Contact Email
                    </label>
                    <input
                      type="email"
                      id="contactEmail"
                      name="contactEmail"
                      value={pgDetails.contactEmail}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contactPhone"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      id="contactPhone"
                      name="contactPhone"
                      value={pgDetails.contactPhone}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={pgDetails.address}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={pgDetails.city}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="state"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      State
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={pgDetails.state}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="pincode"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Pincode
                    </label>
                    <input
                      type="text"
                      id="pincode"
                      name="pincode"
                      value={pgDetails.pincode}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={pgDetails.description}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Features & Rules Section */}
            {activeTab === "features" && (
              <div className="p-6">
                <div className="mb-8">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Features
                  </h2>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {Object.keys(pgDetails.features).map((feature) => (
                      <div key={feature} className="flex items-center">
                        <input
                          id={feature}
                          type="checkbox"
                          checked={
                            pgDetails.features[
                              feature as keyof typeof pgDetails.features
                            ]
                          }
                          onChange={() => handleFeatureToggle(feature)}
                          className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500 dark:border-gray-600 dark:bg-gray-700"
                        />
                        <label
                          htmlFor={feature}
                          className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize"
                        >
                          {feature}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Rules
                  </h2>
                  <div className="space-y-3">
                    {pgDetails.rules.map((rule, index) => (
                      <div key={index} className="flex items-center">
                        <input
                          type="text"
                          value={rule}
                          onChange={(e) =>
                            handleRuleChange(index, e.target.value)
                          }
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2"
                          placeholder="Enter rule"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveRule(index)}
                          className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddRule}
                      className="mt-2 inline-flex items-center rounded-md border border-pink-500 bg-white px-3 py-2 text-sm font-medium text-pink-500 shadow-sm hover:bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 dark:bg-transparent dark:hover:bg-pink-900/20"
                    >
                      Add Rule
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Settings Section */}
            {activeTab === "payment" && (
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Payment Details
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="bankName"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Bank Name
                    </label>
                    <input
                      type="text"
                      id="bankName"
                      name="bankName"
                      value={pgDetails.paymentDetails.bankName}
                      onChange={handlePaymentDetailsChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="accountNumber"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Account Number
                    </label>
                    <input
                      type="text"
                      id="accountNumber"
                      name="accountNumber"
                      value={pgDetails.paymentDetails.accountNumber}
                      onChange={handlePaymentDetailsChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="ifscCode"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      id="ifscCode"
                      name="ifscCode"
                      value={pgDetails.paymentDetails.ifscCode}
                      onChange={handlePaymentDetailsChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="upiId"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      UPI ID
                    </label>
                    <input
                      type="text"
                      id="upiId"
                      name="upiId"
                      value={pgDetails.paymentDetails.upiId}
                      onChange={handlePaymentDetailsChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeTab === "notifications" && (
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Notification Preferences
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Configure how and when the system should send notifications to
                  users.
                </p>
                <div className="space-y-4">
                  {Object.keys(pgDetails.notificationSettings).map(
                    (setting) => (
                      <div key={setting} className="flex items-start">
                        <div className="flex h-5 items-center">
                          <input
                            id={setting}
                            type="checkbox"
                            checked={
                              pgDetails.notificationSettings[
                                setting as keyof typeof pgDetails.notificationSettings
                              ]
                            }
                            onChange={() => handleNotificationToggle(setting)}
                            className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500 dark:border-gray-600 dark:bg-gray-700"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label
                            htmlFor={setting}
                            className="font-medium text-gray-700 dark:text-gray-300 capitalize"
                          >
                            {setting
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, function (str) {
                                return str.toUpperCase();
                              })}
                          </label>
                          <p className="text-gray-500 dark:text-gray-400">
                            {setting === "emailNotifications" &&
                              "Send notifications via email to users"}
                            {setting === "smsNotifications" &&
                              "Send text message alerts to users"}
                            {setting === "paymentReminders" &&
                              "Send payment reminders before due date"}
                            {setting === "maintenanceAlerts" &&
                              "Send alerts about maintenance activities"}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
