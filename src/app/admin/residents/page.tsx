"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ResidentsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/users");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Redirecting...</h2>
        <p className="text-gray-600">
          Residents are now managed in the Users section.
        </p>
      </div>
    </div>
  );
}
