"use client";

import React from "react";

interface NotFoundProps {
  message?: string;
}

export default function NotFound({ message = "Not Found" }: NotFoundProps) {
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <h2 className="text-2xl font-bold mb-4">404</h2>
      <p className="text-lg text-gray-600">{message}</p>
    </div>
  );
}
