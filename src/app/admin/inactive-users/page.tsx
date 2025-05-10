"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InactiveUsersRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/users/checkouts");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Redirecting...</h2>
        <p className="text-gray-600">
          Inactive users are now managed in the User Archives & Checkouts
          section.
        </p>
      </div>
    </div>
  );
}
