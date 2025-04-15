"use client";

import React, { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import Loader from "@/components/Loader";
import NotFound from "@/components/NotFound";
import {
  ArrowLeft,
  Save,
  X,
  UserRound,
  MapPin,
  Home,
  FileText,
  Settings,
} from "lucide-react";

interface UserData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role?: string;
  registrationStatus?: string;
  fathersName?: string;
  permanentAddress?: string;
  city?: string;
  state?: string;
  guardianMobileNumber?: string;
  validIdType?: string;
  companyName?: string;
  companyAddress?: string;
  validIdPhoto?: string;
  profileImage?: string;
  documents?: string[];
  bedNumber?: string | null;
  isActive?: boolean;
  approvalDate?: string;
  moveInDate?: string;
  pgId?: string;
  roomId?:
    | {
        _id: string;
        roomNumber: string;
        price: number;
        type: string;
      }
    | string
    | null;
}

interface ErrorResponse {
  success: boolean;
  message: string;
}

export default function EditUserPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserData>({
    _id: id,
    name: "",
    email: "",
    phone: "",
    role: "user",
    registrationStatus: "",
    fathersName: "",
    permanentAddress: "",
    city: "",
    state: "",
    guardianMobileNumber: "",
    validIdType: "",
    companyName: "",
    companyAddress: "",
    validIdPhoto: "",
    profileImage: "",
    documents: [],
    bedNumber: null,
    isActive: true,
    moveInDate: "",
    roomId: "",
    pgId: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/users/${id}`);
        if (response.data.success && response.data.user) {
          const user = response.data.user;
          setUserData({
            _id: user._id,
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            registrationStatus: user.registrationStatus || "",
            fathersName: user.fathersName || "",
            permanentAddress: user.permanentAddress || "",
            city: user.city || "",
            state: user.state || "",
            guardianMobileNumber: user.guardianMobileNumber || "",
            validIdType: user.validIdType || "",
            companyName: user.companyName || "",
            companyAddress: user.companyAddress || "",
            validIdPhoto: user.validIdPhoto || "",
            profileImage: user.profileImage || "",
            documents: user.documents || [],
            bedNumber: user.bedNumber,
            isActive: user.isActive !== undefined ? user.isActive : true,
            moveInDate: user.moveInDate || "",
            roomId: user.roomId || "",
            pgId: user.pgId || "",
          });
          setError(null);
        } else {
          setError("Failed to load user data");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user details");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement;
      setUserData((prev) => ({ ...prev, [name]: checkbox.checked }));
    } else {
      setUserData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Create a data object without roomId and role
    const dataToSubmit = { ...userData };
    delete dataToSubmit.roomId;
    delete dataToSubmit.role;

    try {
      setIsSaving(true);
      const response = await axios.put(`/api/users/${id}`, dataToSubmit);

      if (response.data.success) {
        toast.success("User updated successfully");
        router.push(`/admin/users/${id}`);
      } else {
        toast.error(response.data.message || "Failed to update user");
      }
    } catch (err) {
      console.error("Error updating user:", err);
      const axiosError = err as AxiosError<ErrorResponse>;
      toast.error(
        axiosError.response?.data?.message || "Failed to update user"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "personal":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={userData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Full Name"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={userData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Email Address"
                />
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={userData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Phone Number"
                />
              </div>

              {/* Father's Name */}
              <div>
                <label
                  htmlFor="fathersName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Father&apos;s Name
                </label>
                <input
                  type="text"
                  id="fathersName"
                  name="fathersName"
                  value={userData.fathersName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Father's Name"
                />
              </div>

              {/* Guardian Mobile */}
              <div>
                <label
                  htmlFor="guardianMobileNumber"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Guardian Mobile
                </label>
                <input
                  type="tel"
                  id="guardianMobileNumber"
                  name="guardianMobileNumber"
                  value={userData.guardianMobileNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Guardian Mobile Number"
                />
              </div>
            </div>
          </div>
        );

      case "address":
        return (
          <div className="space-y-6">
            {/* Permanent Address */}
            <div>
              <label
                htmlFor="permanentAddress"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Permanent Address
              </label>
              <textarea
                id="permanentAddress"
                name="permanentAddress"
                value={userData.permanentAddress}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Permanent Address"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* City */}
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
                  value={userData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="City"
                />
              </div>

              {/* State */}
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
                  value={userData.state}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="State"
                />
              </div>
            </div>

            {/* Company Name and Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Name */}
              <div>
                <label
                  htmlFor="companyName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Company Name
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={userData.companyName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Company Name"
                />
              </div>

              {/* Company Address */}
              <div>
                <label
                  htmlFor="companyAddress"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Company Address
                </label>
                <textarea
                  id="companyAddress"
                  name="companyAddress"
                  value={userData.companyAddress}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Company Address"
                ></textarea>
              </div>
            </div>
          </div>
        );

      case "accommodation":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Room Number - Use roomId data */}
              <div>
                <label
                  htmlFor="roomId"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Room Number
                </label>
                <input
                  type="text"
                  id="roomId"
                  name="roomId"
                  value={
                    typeof userData.roomId === "object" &&
                    userData.roomId?.roomNumber
                      ? userData.roomId.roomNumber
                      : ""
                  }
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white bg-gray-100 dark:bg-gray-600"
                  placeholder="Room Number (View Only)"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Room assignment must be managed through room management
                </p>
              </div>

              {/* Bed Number */}
              <div>
                <label
                  htmlFor="bedNumber"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Bed Number
                </label>
                <input
                  type="text"
                  id="bedNumber"
                  name="bedNumber"
                  value={userData.bedNumber || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Bed Number"
                />
              </div>

              {/* Move-in Date */}
              <div>
                <label
                  htmlFor="moveInDate"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Move-in Date
                </label>
                <input
                  type="date"
                  id="moveInDate"
                  name="moveInDate"
                  value={
                    userData.moveInDate
                      ? new Date(userData.moveInDate)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
        );

      case "status":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PG ID */}
              <div>
                <label
                  htmlFor="pgId"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  PG ID
                </label>
                <input
                  type="text"
                  id="pgId"
                  name="pgId"
                  value={userData.pgId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="PG ID"
                />
              </div>

              {/* Registration Status */}
              <div>
                <label
                  htmlFor="registrationStatus"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Registration Status
                </label>
                <select
                  id="registrationStatus"
                  name="registrationStatus"
                  value={userData.registrationStatus}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {/* Valid ID Type */}
              <div>
                <label
                  htmlFor="validIdType"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Valid ID Type
                </label>
                <select
                  id="validIdType"
                  name="validIdType"
                  value={userData.validIdType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select ID Type</option>
                  <option value="Aadhar Card">Aadhar Card</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Passport">Passport</option>
                  <option value="Voter ID">Voter ID</option>
                  <option value="PAN Card">PAN Card</option>
                </select>
              </div>
            </div>

            {/* Status Checkboxes */}
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={userData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isActive"
                  className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Active Status
                </label>
              </div>
            </div>
          </div>
        );

      case "documents":
        return (
          <div className="space-y-6">
            {/* Document URLs */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                ID Document
              </h3>
              {userData.validIdPhoto && (
                <div className="mt-2">
                  <a
                    href={userData.validIdPhoto}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline"
                  >
                    View ID Document
                  </a>
                </div>
              )}

              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">
                Passport Photo
              </h3>
              {userData.profileImage && (
                <div className="mt-2">
                  <a
                    href={userData.profileImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline"
                  >
                    View Passport Photo
                  </a>
                </div>
              )}

              {userData.documents && userData.documents.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Additional Documents
                  </h3>
                  <div className="mt-2 space-y-2">
                    {userData.documents.map((doc, index) => (
                      <div key={index}>
                        <a
                          href={doc}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline"
                        >
                          Document {index + 1}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                Note: To update documents, please use the document upload
                section in the user management page.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <NotFound message="User not found" />;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition"
            >
              <ArrowLeft size={20} className="mr-1" />
              <span>Back</span>
            </button>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit User
          </h1>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden">
        <form onSubmit={handleSubmit}>
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab("personal")}
                className={`px-4 py-3 font-medium text-sm flex items-center ${
                  activeTab === "personal"
                    ? "border-b-2 border-pink-500 text-pink-600 dark:text-pink-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <UserRound size={18} className="mr-2" />
                Personal Info
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("address")}
                className={`px-4 py-3 font-medium text-sm flex items-center ${
                  activeTab === "address"
                    ? "border-b-2 border-pink-500 text-pink-600 dark:text-pink-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <MapPin size={18} className="mr-2" />
                Address & Company
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("accommodation")}
                className={`px-4 py-3 font-medium text-sm flex items-center ${
                  activeTab === "accommodation"
                    ? "border-b-2 border-pink-500 text-pink-600 dark:text-pink-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <Home size={18} className="mr-2" />
                Accommodation
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("status")}
                className={`px-4 py-3 font-medium text-sm flex items-center ${
                  activeTab === "status"
                    ? "border-b-2 border-pink-500 text-pink-600 dark:text-pink-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <Settings size={18} className="mr-2" />
                Status & Role
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("documents")}
                className={`px-4 py-3 font-medium text-sm flex items-center ${
                  activeTab === "documents"
                    ? "border-b-2 border-pink-500 text-pink-600 dark:text-pink-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <FileText size={18} className="mr-2" />
                Documents
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6 space-y-6">{renderTabContent()}</div>

          {/* Form Actions */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            >
              <X size={18} className="mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            >
              <Save size={18} className="mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
