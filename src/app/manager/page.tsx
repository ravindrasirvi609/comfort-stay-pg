import Link from "next/link";
import { FaFileInvoiceDollar, FaExclamationCircle } from "react-icons/fa";

export default function ManagerPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-8 text-center">
          Welcome, Manager
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* Complaints Card */}
          <Link href="/manager/complaints">
            <div className="rounded-xl shadow-lg bg-white dark:bg-gray-800 p-8 flex flex-col items-center hover:shadow-pink-200/40 dark:hover:shadow-pink-700/30 transition cursor-pointer border border-pink-100 dark:border-pink-900/30 hover:scale-105">
              <FaExclamationCircle className="text-pink-500 text-5xl mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                Complaints
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-center">
                View and manage all user complaints and issues.
              </p>
            </div>
          </Link>
          {/* Expenses Card */}
          <Link href="/manager/expenses">
            <div className="rounded-xl shadow-lg bg-white dark:bg-gray-800 p-8 flex flex-col items-center hover:shadow-purple-200/40 dark:hover:shadow-purple-700/30 transition cursor-pointer border border-purple-100 dark:border-purple-900/30 hover:scale-105">
              <FaFileInvoiceDollar className="text-purple-600 text-5xl mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                Expenses
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Track, add, and review all PG expenses.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
