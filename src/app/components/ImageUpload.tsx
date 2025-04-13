"use client";

import React, { useState, useCallback, useRef } from "react";
import { Upload, XCircle, Image as ImageIcon } from "lucide-react";
import { uploadToCloudinary, validateImageFile } from "../lib/cloudinary";
import Image from "next/image";

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  maxSizeMB?: number;
  folder?: string;
  className?: string;
}

export default function ImageUpload({
  onImageUploaded,
  maxSizeMB = 5,
  folder = "applicants/profile",
  className = "",
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    async (file: File) => {
      // Reset states
      setError(null);

      // Validate file
      const validation = validateImageFile(file, maxSizeMB);
      if (!validation.valid) {
        setError(validation.message);
        return;
      }

      try {
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Start upload
        setIsUploading(true);
        setUploadProgress(0);

        const imageUrl = await uploadToCloudinary(file, folder, (progress) => {
          setUploadProgress(progress);
        });

        // Upload complete
        onImageUploaded(imageUrl);
        setIsUploading(false);
        setUploadProgress(null);
      } catch (error) {
        setError("Upload failed. Please try again.");
        setIsUploading(false);
        setUploadProgress(null);
        console.error("Upload error:", error);
      }
    },
    [folder, maxSizeMB, onImageUploaded]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileChange(e.dataTransfer.files[0]);
      }
    },
    [handleFileChange]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFileChange(e.target.files[0]);
      }
    },
    [handleFileChange]
  );

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const removeImage = useCallback(() => {
    setPreviewUrl(null);
    setUploadProgress(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  return (
    <div className={className}>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleInputChange}
        style={{ display: "none" }}
      />

      {previewUrl ? (
        <div className="relative rounded-md overflow-hidden">
          <Image
            src={previewUrl}
            alt="Profile preview"
            className="w-full h-48 object-cover rounded-md"
            width={300}
            height={192}
            style={{ width: "100%", height: "12rem" }}
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-all"
            disabled={isUploading}
          >
            <XCircle size={20} />
          </button>

          {uploadProgress !== null && (
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 px-3 py-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-white text-xs mt-1 text-center">
                {uploadProgress}%
              </p>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={openFileDialog}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : error
                ? "border-red-300 bg-red-50"
                : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <div className="flex flex-col items-center justify-center py-4">
            {error ? (
              <>
                <XCircle className="w-10 h-10 text-red-500 mb-2" />
                <p className="text-sm text-red-500">{error}</p>
                <p className="text-xs text-gray-500 mt-2">Click to try again</p>
              </>
            ) : (
              <>
                {isDragging ? (
                  <Upload className="w-10 h-10 text-blue-500 mb-2" />
                ) : (
                  <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
                )}
                <p className="text-sm text-gray-500">
                  {isDragging
                    ? "Drop your image here"
                    : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Image only (max {maxSizeMB}MB)
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
