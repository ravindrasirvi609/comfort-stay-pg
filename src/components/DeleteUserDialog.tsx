import React, { useState } from "react";
import { Trash2, AlertTriangle, Key, CreditCard } from "lucide-react";

interface DeleteUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (keyInfo: KeyInfo, depositInfo: DepositInfo) => void;
  isDeleting: boolean;
  userName: string;
  currentDepositFees?: number;
}

interface KeyInfo {
  keyIssued: boolean;
}

interface DepositInfo {
  isReturning: boolean;
  amount: number;
}

const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  userName,
  currentDepositFees = 0,
}) => {
  // State for key information
  const [keyIssued, setKeyIssued] = useState(false);

  // State for deposit return information
  const [isReturningDeposit, setIsReturningDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState(currentDepositFees);
  const [paymentMethod, setPaymentMethod] = useState<
    "Cash" | "UPI" | "Bank Transfer" | "Card" | "Other"
  >("Cash");
  const [transactionId, setTransactionId] = useState("");
  const [returnStatus, setReturnStatus] = useState<
    "Pending" | "Completed" | "Partial" | "Not Applicable"
  >("Not Applicable");
  const [remarks, setRemarks] = useState("");

  const handleConfirm = () => {
    const keyInfo: KeyInfo = {
      keyIssued,
    };

    const depositInfo: DepositInfo = {
      isReturning: isReturningDeposit,
      amount: depositAmount,
    };

    onConfirm(keyInfo, depositInfo);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 backdrop-blur-sm"
          onClick={onClose}
        ></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
          &#8203;
        </span>

        {/* Dialog panel */}
        <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white dark:bg-gray-800 rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="px-4 pt-5 pb-4 bg-white dark:bg-gray-800 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-red-100 dark:bg-red-800 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-300" />
              </div>

              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                  Deactivate User
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Are you sure you want to deactivate{" "}
                    <strong>{userName}</strong>? This user will be moved to the
                    inactive users list and can be reactivated later if needed.
                  </p>
                </div>

                {/* Room Key Status */}
                <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center mb-3">
                    <Key className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Room Key Status
                    </h3>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="keyIssued"
                      name="keyIssued"
                      type="checkbox"
                      checked={keyIssued}
                      onChange={(e) => setKeyIssued(e.target.checked)}
                      className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="keyIssued"
                      className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                    >
                      User still has room key (not returned)
                    </label>
                  </div>
                </div>

                {/* Security Deposit Return */}
                <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center mb-3">
                    <CreditCard className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Security Deposit Return
                    </h3>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center">
                      <input
                        id="isReturningDeposit"
                        name="isReturningDeposit"
                        type="checkbox"
                        checked={isReturningDeposit}
                        onChange={(e) =>
                          setIsReturningDeposit(e.target.checked)
                        }
                        className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="isReturningDeposit"
                        className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                      >
                        Return security deposit (₹{currentDepositFees})
                      </label>
                    </div>
                  </div>

                  {isReturningDeposit && (
                    <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div>
                        <label
                          htmlFor="depositAmount"
                          className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Return Amount
                        </label>
                        <input
                          type="number"
                          id="depositAmount"
                          value={depositAmount}
                          onChange={(e) =>
                            setDepositAmount(Number(e.target.value))
                          }
                          className="w-full p-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 p-3 rounded-md bg-yellow-50 dark:bg-yellow-900/30">
                  <div className="flex">
                    <div className="shrink-0">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        Important information
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                        <ul className="list-disc space-y-1 pl-5">
                          <li>User will no longer be able to log in</li>
                          <li>
                            All user data will remain in the system for
                            record-keeping
                          </li>
                          <li>The user's room will be marked as available</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isDeleting}
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm ${
                isDeleting && "opacity-50 cursor-not-allowed"
              }`}
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Deactivate User
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserDialog;
